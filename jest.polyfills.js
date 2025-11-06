/* eslint-env node, jest */
/* eslint-disable no-undef */
// Jest polyfills for Node.js environment

// Mock fetch globally
global.fetch = jest.fn();

// Mock Headers
global.Headers = class Headers {
  constructor(init) {
    this.headers = new Map();
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.headers.set(key.toLowerCase(), value));
      } else if (typeof init === 'object') {
        Object.entries(init).forEach(([key, value]) => this.headers.set(key.toLowerCase(), value));
      }
    }
  }

  get(name) {
    return this.headers.get(name.toLowerCase()) || null;
  }

  set(name, value) {
    this.headers.set(name.toLowerCase(), value);
  }

  has(name) {
    return this.headers.has(name.toLowerCase());
  }

  entries() {
    return this.headers.entries();
  }
};

// Mock Request
global.Request = class Request {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = options.headers || new Headers();
    this.body = options.body;
  }
};

// Mock Response
global.Response = class Response {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.statusText = options.statusText || 'OK';
    this.headers = options.headers || new Headers();
    this.ok = this.status >= 200 && this.status < 300;
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }

  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
  }
};

// Mock AbortController
global.AbortController = class AbortController {
  signal = {
    aborted: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  };

  abort() {
    this.signal.aborted = true;
  }
};

// Mock AbortSignal
global.AbortSignal = {
  timeout: jest.fn(() => ({
    aborted: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }))
};
