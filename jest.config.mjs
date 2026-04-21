import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/out/'],

  // Coverage
  collectCoverage: false,
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!app/api/**',         // esclude route API
    '!app/**/page copy*.js', // esclude copie
    '!**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Soglie di copertura "ragionevoli" (puoi adattarle)
  coverageThreshold: {
    global: { branches: 10, functions: 10, lines: 10, statements: 10 },
  },

  moduleNameMapper: {
    // CSS/SASS
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    // Alias @/ -> root
    '^@/(.*)$': '<rootDir>/$1',

    // Mock per moduli Next che altrimenti rompono i test in jsdom
    '^next/link$': '<rootDir>/test/mocks/nextLinkMock.js',
    '^next/navigation$': '<rootDir>/test/mocks/nextNavigationMock.js',
    '^next/image$': '<rootDir>/test/mocks/nextImageMock.js',
  },

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

export default createJestConfig(customJestConfig);
