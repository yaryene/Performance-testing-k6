# Auth Performance Suite

k6-based performance tests for the CBE Superapp login endpoint.

Overview
- Main load test: `tests/member-login.test.js`
- Config: `config/env.js`
- API helper: `src/api/auth.api.js`
- Test data: `data/users.json`

Prerequisites
- Install k6 (macOS): `brew install k6` or use the Grafana k6 Docker image.

Run
- From the `auth-perf-suite` folder:
  - Run staging: `npm run test:staging`
  - Run a quick single-request smoke with k6:
    `k6 run --vus 1 --iterations 1 tests/member-login.test.js`

Notes
- Control active environment with `TARGET_ENV` (default `staging`). Example:
  `TARGET_ENV=staging npm run test:staging`
- If imports fail, ensure `.js` extensions are present and run npm commands from this folder.

If you want a CONTRIBUTING or CI section added, tell me which remote and branch policy to document.
