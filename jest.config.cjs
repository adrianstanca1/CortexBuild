module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    // Map all imports of env.ts to the mock version
    '^.*/utils/env$': '<rootDir>/src/utils/__mocks__/env.ts',
    '^@/utils/env$': '<rootDir>/src/utils/__mocks__/env.ts'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { rootMode: 'upward' }],
    '^.+\\.(js|jsx)$': ['babel-jest', { rootMode: 'upward' }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@supabase|@firebase|firebase|react-hot-toast)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
  // Add globals for Node.js compatibility
  setupFiles: ['<rootDir>/jest.polyfills.js']
};
