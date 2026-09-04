export function buildTokenizerSessionPayload(overrides = {}) {
    const recipientAccounts = ['1000295551465', '1000181611158'];
    const selectedRecipient = recipientAccounts[Math.floor(Math.random() * recipientAccounts.length)];

    const randomAmount = Number((Math.random() * (500 - 10) + 10).toFixed(2)); // Random amount between 10 and 500

    const basePayload = {
        service_code: 'CBE',
        service_key: 'cbe_to_cbe',
        debit_account: '1000184556344',
        debit_currency: 'ETB',
        debit_amount: randomAmount,
        session_data: {
            critical_value: "1000295551465",
            type: 'account_number',
            reason: `load_test_${Date.now()}`,
        },
    };

    return { 
        ...basePayload, 
        ...overrides,
        session_data: {
            ...basePayload.session_data,
            ...(overrides.session_data || {}),
        },
    };
}