import http from 'k6/http';
import { Config } from '../../config/env.js';

export class TransferAPI {
    static transferFunds(accessToken, dataToken) {
        const endpoint = `${Config.baseUrl}/cbe_to_cbe/fund_transfer`;

        const payload = {
            data_token: dataToken,
        };

        const params = {
            headers: {
                ...Config.headers,
                'Authorization': `Bearer ${accessToken}`,
            },
            tags: { name: 'POST /cbe_to_cbe/fund_transfer' },
        };
        return http.post(endpoint, JSON.stringify(payload), params);
    }
};