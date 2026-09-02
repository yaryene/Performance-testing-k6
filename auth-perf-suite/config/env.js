// config/environments.js
const ENVIRONMENTS = {
    local: {
        baseUrl: 'https://qaapisuperapp.cbe.com.et/api/v1/cbesuperapp',
    },
    staging: {
        baseUrl: 'https://qaapisuperapp.cbe.com.et/api/v1/cbesuperapp',
    },
    production: {
        baseUrl: 'https://qaapisuperapp.cbe.com.et/api/v1/cbesuperapp',
    },
};

const activeEnv = __ENV.TARGET_ENV || 'staging';

export const Config = {
    targetEnv: activeEnv,
    baseUrl: ENVIRONMENTS[activeEnv]?.baseUrl || ENVIRONMENTS.staging.baseUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'platform': 'ANDROID',
        'app_version': '1.0',
        'device_uuid': '2255dce14dd2d4a7',
        'installation_date': '2026-08-05T08:49:39.965Z',
        'x-source': 'APP',
        'trace_id': '51c813b22b9c3299e0630b6f030a5ca5',
        'enable_encryption': 'DISABLED',
    },
};