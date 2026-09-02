import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 200 }, // Ramp-up to 200 users over 1 minute
        { duration: '2m', target: 200 }, // Stay at 200 users for 2 minutes
        { duration: '1m', target: 400 }, // Stay at 400 users for 1 minute
        { duration: '2m', target: 400 }, // Stay at 400 users for 2 minutes
        { duration: '2m', target: 0 },   // Ramp-down to 0 users over 2 minutes
    ],
};

export default function () {
    const res = http.get('https://test.k6.io');
    check(res, {
        'is status 200': (r) => r.status === 200,
    });
    sleep(1);
}