import '@testing-library/jest-dom';

// JSDOM/polyfills that are commonly missing in tests
// Silently stub scrollTo to avoid errors from components using it
if (!window.scrollTo) {
  // @ts-expect-error - jsdom environment
  window.scrollTo = () => {};
}

// Ensure fetch exists in test env if any util relies on it
if (typeof globalThis.fetch === 'undefined') {
  // @ts-expect-error - provide a minimal stub
  globalThis.fetch = async () => ({ ok: true, json: async () => ({}), text: async () => '' });
}

