import { check } from 'k6';
import { Rate } from 'k6/metrics';

export const authSuccessRate = new Rate('successful_auth_rate');

export function validateLoginResponse(res) {
    let body = {};
    let isJSON = false;

    try {
        body = JSON.parse(res.body);
        isJSON = true;
    } catch (e) {
        isJSON = false;
    }

    const accessToken = body.data?.access_token;
    const passed = check(res, {
        'Http status is 200': (r) => r.status === 200,
        'Response is valid JSON': () => isJSON,
        'Body status is 200': () => body.status === 200,
        'Message is "Login successful"': () => body.message === 'Login successful',
        'Has valid refresh_token': () => typeof body.data?.refresh_token === 'string' && body.data.refresh_token.length > 20,
        'Customer segment is present': () => Boolean(body.data?.customer_segment),
    });
    authSuccessRate.add(passed);
    return { passed, accessToken };
}
