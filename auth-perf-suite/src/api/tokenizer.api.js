import http from 'k6/http';
import { Config } from '../../config/env.js';



export class TokenizerAPI {
    static createSession(accessToken, sessionPayload) {
       const endpoint = `${Config.baseUrl}/tokenizer/session/create`;
       const params = {
           headers: {
               ...Config.headers,
               'Authorization': `Bearer ${accessToken}`,
           },
           tags: { name: 'POST /tokenizer/session/create' },
       };
       return http.post(endpoint, JSON.stringify(sessionPayload), params);
    }
};