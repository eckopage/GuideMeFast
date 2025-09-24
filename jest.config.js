export default {
    // Use ts-jest preset for TypeScript support
    preset: 'ts-jest/presets/default-esm',

    // Test environment
    testEnvironment: 'jsdom',

    // ES modules support
    extensionsToTreatAsEsm: ['.ts', '.tsx'],

    // Transform configuration
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            useESM: true,
            tsconfig: {
                jsx: 'react-jsx'
            }
        }],
        '^.+\\.(js|jsx)$': ['babel-jest', {
            presets: [
                ['@babel/preset-env', { targets: { node: 'current' } }],
                ['@babel/preset-react', { runtime: 'automatic' }]
            ]
        }]
    },

    // Module name mapping
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/src/__mocks__/fileMock.js'
    },

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

    // Test file patterns
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
        '<rootDir>/src/**/(*.)+(spec|test).(ts|tsx|js|jsx)'
    ],

    // Module file extensions
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    // Files to collect coverage from
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/index.tsx',
        '!src/setupTests.ts',
        '!src/**/*.stories.*',
        '!src/**/__tests__/**/*',
        '!src/**/__mocks__/**/*',
        '!src/**/node_modules/**'
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },

    // Coverage reporters
    coverageReporters: [
        'text',
        'text-summary',
        'lcov',
        'html',
        'json-summary'
    ],

    // Coverage output directory
    coverageDirectory: 'coverage',

    // Test timeout
    testTimeout: 10000,

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks after each test
    restoreMocks: true,

    // Verbose output
    verbose: false,

    // Globals for ES modules
    globals: {
        'ts-jest': {
            useESM: true,
            tsconfig: {
                jsx: 'react-jsx'
            }
        }
    },

    // Module directories
    moduleDirectories: ['node_modules', '<rootDir>/src'],

    // Ignore patterns
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/dist/',
        '<rootDir>/build/'
    ],

    // Transform ignore patterns
    transformIgnorePatterns: [
        'node_modules/(?!(react-dnd|dnd-core|@react-dnd|react-dnd-html5-backend)/)'
    ]
};