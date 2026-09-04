import { check } from 'k6';
import { Rate } from 'k6/metrics';

export const transferSuccessRate = new Rate('successful_transfer_rate');

export function validateTransferResponse(res) {
    let body = {};
    let isJSON = false;

    try {
        body = JSON.parse(res.body);
        isJSON = true;
    } catch (e) {
        isJSON = false;
    }

    const passed = check(res, {
        'transfer status is 200': (r) => r.status === 200,
        'transfer response is valid JSON': () => isJSON,
        'transfer message is "Successfully Paid"': () => body.message === 'Successfully Paid',
    });

    transferSuccessRate.add(passed);
    return passed;
}