import { sleep, group } from 'k6';
import { SharedArray } from 'k6/data';
import { AuthAPI } from '../src/api/auth.api.js';
import { TokenizerAPI } from '../src/api/tokenizer.api.js';
import { TransferAPI } from '../src/api/transfer.api.js';
import { VerifyPin } from '../src/api/verify-pin.api.js';
import { buildTokenizerSessionPayload } from '../src/payloads/tokenizer.payload.js';


import { validateLoginResponse, authSuccessRate } from '../src/checks/auth.checks.js';
import { validateTokenizerResponse, tokenizerSuccessRate } from '../src/checks/tokenizer.checks.js';
import { validateTransferResponse, transferSuccessRate } from '../src/checks/transfer.checks.js';


import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

const users = new SharedArray('users', function () {
    return JSON.parse(open('../data/users.json'));
});

const transfers = new SharedArray('transfers', function () {
    // load transfer payloads used by the fund transfer step
    return JSON.parse(open('../data/transfer-payloads.json'));
});


export const options = {
    scenarios: {
        cbe_transfer_journey: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 15 }, // Ramp-up to 15 users over 30 seconds
                { duration: '1m', target: 15 }, // Stay at 15 users for 1 minute
                { duration: '15s', target: 0 }, // Ramp-down to 0 users over 15 seconds
            ],
            gracefulRampDown: '10s',
        },
    },
    thresholds: {
        // Individual endpoint SLA targets
        'http_req_duration{name:POST /member_auth/login}': ['p(95) < 500'],
        'http_req_duration{name:POST /tokenizer/session/create}': ['p(95) < 400'],
        'http_req_duration{name:POST /cbe_to_cbe/fund_transfer}': ['p(95) < 800'],

        // Quality gate pass rates
        'successful_auth_rate': ['rate > 0.99'],
        'successful_tokenizer_rate': ['rate > 0.99'],
        'successful_transfer_rate': ['rate > 0.98'],
        'http_req_failed': ['rate < 0.01'],
    },
};

export default function () {
    const user = users[__VU % users.length]; // Cycle through users in the pool
    const transferData = transfers[__VU % transfers.length]; // Cycle through transfer data in the pool

    let accessToken = null;
    let dataToken = null;

    // step 1: login and access token retrieval
    group('Step 1: Member Login', function () {
        const loginRes = AuthAPI.login(user.pin);

        // DEBUG: print login response
        try { console.log(`login: status=${loginRes.status}`); } catch (e) { }
        try { console.log('login body:\n' + JSON.stringify(JSON.parse(loginRes.body), null, 2)); } catch (e) { try { console.log('login body (raw):\n' + loginRes.body); } catch (err) { } }

        const { passed, accessToken: token } = validateLoginResponse(loginRes);

        if (passed) {
            accessToken = token;
        }
    });

    // short pause simulating app navigation
    sleep(1);

    // early exist if auth failed: avoids cascaded false failures downstream
    if (!accessToken) {
        return;
    }

    // step 2: tokenizer session creation
    group('Step 2: Tokenizer Session Creation', function () {
        const sessionPayload = buildTokenizerSessionPayload();
        const sessionRes = TokenizerAPI.createSession(accessToken, sessionPayload);

        // DEBUG: print tokenizer session response
        try { console.log(`session: status=${sessionRes.status}`); } catch (e) { }
        try { console.log('session body:\n' + JSON.stringify(JSON.parse(sessionRes.body), null, 2)); } catch (e) { try { console.log('session body (raw):\n' + sessionRes.body); } catch (err) { } }

        const result = validateTokenizerResponse(sessionRes);

        if (result.passed) {
            dataToken = result.dataToken;
        }
    });

    // short pause simulating app navigation
    sleep(1);

    if (!dataToken) {
        return;
    }

    // step 3: Verify PIN
    group('Step 3: Verify PIN', function () {
        const verifyPinRes = VerifyPin.verifyPin(accessToken, user.pin, dataToken);

        // DEBUG: print verify pin response
        try { console.log(`verifyPin: status=${verifyPinRes.status}`); } catch (e) { }
        try { console.log('verifyPin body:\n' + JSON.stringify(JSON.parse(verifyPinRes.body), null, 2)); } catch (e) { try { console.log('verifyPin body (raw):\n' + verifyPinRes.body); } catch (err) { } }

        // Optionally validate verify pin response here if you have a check
        // validateVerifyPinResponse(verifyPinRes);
    });

    // short pause simulating app navigation
    sleep(1);

    if (!accessToken || !dataToken) {
        return;
    }

    // step 4: fund transfer execution
    group('Step 4: Fund Transfer Execution', function () {
        const transferRes = TransferAPI.transferFunds(accessToken, dataToken);

        // DEBUG: print full transfer response for troubleshooting
        try { console.log(`transfer: status=${transferRes.status}`); } catch (e) { }
        try { console.log('transfer headers:\n' + JSON.stringify(transferRes.headers, null, 2)); } catch (e) { }
        try { console.log('transfer body:\n' + JSON.stringify(JSON.parse(transferRes.body), null, 2)); } catch (e) { try { console.log('transfer body (raw):\n' + transferRes.body); } catch (err) { } }

        validateTransferResponse(transferRes);
    });
    // user think time before next iteration
    sleep(Math.random() * 1.5 + 1);
}

export function handleSummary(data) {
    return {
        'reports/fund-transfer-performance-report.html': htmlReport(data, {
            title: 'Executive Performance Report: CBE Fund Transfer Journey',
        }),
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    };
}