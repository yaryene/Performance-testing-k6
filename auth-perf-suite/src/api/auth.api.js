import http from 'k6/http';
import { Config } from '../../config/env.js';

export class AuthAPI {
    static login(pin) {
        const endpoint = `${Config.baseUrl}/member_auth/login`;
        const payload = {
            pin: pin
        };
        const headers = { ...Config.headers };

        return http.post(endpoint, JSON.stringify(payload), { headers });
    }
}