// Helper to load fake integration test keys from ENV_FAKEAPI_KEY1, ENV_FAKEAPI_KEY2, etc.
export function loadFakeApiKeys() {
  const keys = [];
  let index = 1;
  while (true) {
    const key = process.env[`ENV_FAKEAPI_KEY${index}`];
    if (!key) break;
    keys.push(key);
    index++;
  }
  return keys;
}

