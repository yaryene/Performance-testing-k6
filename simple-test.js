// import http from 'k6/http';
// import { check, sleep } from 'k6';
// export const options = {
//     vus: 100,
//     duration: '30s',
// };

// export default function () {
//    const res =  http.get('https://reqres.in/api/users/2');
//    check(res, {
//        'status is 200': (r) => r.status === 200,
//        'is rate limited (429)': (r) => r.status === 429,
//        'is server error (5xx)': (r) => r.status === 500,
//    });
// }
import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
    // 1. Ramping traffic pattern (Warm-up -> Peak -> Cool-down)
    stages: [
        { duration: '20s', target: 25 }, // ramp up to 25 users over 20 seconds, ramping up to 25 users to simulate increasing load
        { duration: '30s', target: 50 }, // stay at 50 users for 30 seconds, peak load at 50 users
        { duration: '10s', target: 0 }, // ramp down to 0 users over 10 seconds; graceful ramp down to avoid abrupt termination of requests
    ],
    thresholds: {
        'http_req_duration{expected_response:true}': ['p(95)<400'], // 95% of requests should be below 400ms; 95% of successful requests must finish under 400ms
        'http_req_duration{expected_response:true}': ['p(99)<800'], // 99% of successful requests must finish under 800ms
        http_req_failed: ['rate<0.01'], // less than 1% of requests should fail; total failure rate should be below 1%
    },
};

const HEADERS = {
    'Accept': 'application/json',
    'User-Agent': 'k6-load-test/1.0',
};

export default function () {
    const res = http.get('https://reqres.in/api/users/2', { headers: HEADERS });

    // functional assertions to validate the response; check for expected status codes and handle rate limiting and server errors
    check(res, {
        'status is 200': (r) => r.status === 200,
        'body has user data': (r) => r.json('data.id') === 2,
        'not rate limited (429)': (r) => r.status !== 429,
    });
    sleep(Math.random() * 1.5 + 1.0); // randomized human think time (between 1 and 2.5 seconds) to simulate realistic user behavior and avoid synchronized requests
};