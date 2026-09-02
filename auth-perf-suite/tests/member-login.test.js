import { sleep, group } from 'k6';
import { SharedArray } from 'k6/data';
import { AuthAPI } from '../src/api/auth.api.js';
import { validateLoginResponse, authSuccessRate } from '../src/checks/auth.checks.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

// pre-load data once in memory across all VUs

const userPool = new SharedArray('auth_users', function () {
    return JSON.parse(open('../data/users.json'));
});

export const options = {
    scenarios: {
        login_performance_profile: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 20 }, // Ramp-up to 20 users over 30 seconds
                { duration: '1m', target: 20 }, // Stay at 20 users for 1 minute
                { duration: '15s', target: 0 }, // Ramp-down to 0 users over 15 seconds
            ],
            gracefulRampDown: '10s',
        },
    },
    thresholds: {
        'http_req_duration{name: POST /member_auth/login}': [
            'p(90) < 350',  // 90% of requests finish under 350ms
            'p(95) < 500',  // 95% of requests finish under 500ms
            'p(99) < 1000', // 99% of requests finish under 1s
        ],
        'http_req_failed': ['rate<0.01'], // Less than 1% of requests should fail
        'successful_auth_rate': ['rate>0.99'], // At least 99% of login attempts should be successful
    },
};

export default function () {
    const user = userPool[__VU % userPool.length]; // Cycle through users in the pool
    group('Member Login Performance Test', function () {
        const response = AuthAPI.login(user.pin);
        validateLoginResponse(response);
    });
    sleep(Math.random() * 1.5 + 1); // Simulate user think time
}

export function handleSummary(data) {
    return {
        'reports/login-performance-report.html': htmlReport(data, {
            title: 'Executive Performance Report: /member_auth/login',
        }),
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    };
}