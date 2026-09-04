import http from 'k6/http';
import { Config } from '../../config/env.js';

export class VerifyPin {
    static verifyPin(accessToken, pin, dataToken) {
        const endpoint = `${Config.baseUrl}/member_auth/verify_pin`;

        const payload = {
            data_token: dataToken,
            pin: pin,
        };

        const params = {
            headers: {
                ...Config.headers,
                'Authorization': `Bearer ${accessToken}`,
            },
            tags: { name: 'POST /member_auth/verify_pin' },
        };
        return http.post(endpoint, JSON.stringify(payload), params);
    }
};