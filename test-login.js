import http from 'k6/http';
import { check } from 'k6';

// Self-contained staging smoke test — all config in this file for quick debugging
const baseUrl = 'https://qaapisuperapp.cbe.com.et/api/v1/cbesuperapp';
const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'platform': 'ANDROID',
    'app_version': '1.0',
    'device_uuid': '2255dce14dd2d4a7',
    'installation_date': '2026-08-05T08:49:39.965Z',
    'x-source': 'APP',
    'trace_id': '51c813b22b9c3299e0630b6f030a5ca5',
    'enable_encryption': 'DISABLED',
};

// Use the first known test PIN
const payload = JSON.stringify({ pin: '331000' });

export default function () {
    const url = `${baseUrl}/member_auth/login`;
    const res = http.post(url, payload, { headers });

    console.log(`POST ${url}`);
    console.log(`status=${res.status}`);
    console.log(`body=${res.body}`);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'body is JSON': (r) => {
            try { JSON.parse(r.body); return true; } catch (e) { return false; }
        }
    });
}
