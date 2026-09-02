import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    scenarios: {
        login_test: {
            executor: 'per-vu-iterations',
            vus: 10,
            iterations: 200,
            maxDuration: '60s',
        },
    },
};

export default function () {
    const url = 'https://dummyjson.com/auth/login';
    const payload = JSON.stringify({
        username: 'emilys',
        password: 'emilyspass',
    });
    const headers = {
        'Content-Type': 'application/json',
    };
    const res = http.post(
        url,
        payload,
        { headers: headers }
    );
    check(res, {
        'is status 200': (r) => r.status === 200,
        'response body has accessToken': (r) => r.body.includes('accessToken'),
        'is res body has username': (r) => r.body.includes('emilys'),
    });

    sleep(1.5);
} 