import {check} from 'k6';
import { Rate } from 'k6/metrics';

export const tokenizerSuccessRate = new Rate('successful_tokenizer_rate');

export function validateTokenizerResponse(res) {
    let body = {};
    let isJSON = false;

    try {
        body = JSON.parse(res.body);
        isJSON = true;
    } catch (e) {
        isJSON = false;
    }

    // Extract data_token from the response
    const dataToken = body.data?.data_token;

    const passed = check(res, {
        'tokenizer status is 201': (r) => r.status === 201,
        'tokenizer response is valid JSON': () => isJSON,
        'session message is "Session created successfully"': () => body.message === 'Session created successfully',
        'data_token is extracted': () => typeof dataToken === 'string' && dataToken.length > 0
    });

    tokenizerSuccessRate.add(passed);
    return {passed, dataToken};
}