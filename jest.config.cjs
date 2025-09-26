module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',

    // Wyłącz automatyczne wykrywanie Babel config
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: {
                target: 'ES2018',
                module: 'CommonJS',
                jsx: 'react-jsx',
                allowSyntheticDefaultImports: true,
                esModuleInterop: true
            }
        }],
        '^.+\\.(js|jsx)$': ['babel-jest', {
            // Konfiguracja Babel bezpośrednio tutaj - nie szuka pliku config
            configFile: false,
            babelrc: false,
            presets: [
                ['@babel/preset-env', {
                    targets: { node: '14.18.0' },
                    modules: 'commonjs'
                }],
                ['@babel/preset-react', { runtime: 'automatic' }]
            ],
            plugins: [
                '@babel/plugin-proposal-optional-chaining',
                '@babel/plugin-proposal-nullish-coalescing-operator'
            ]
        }]
    },

    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/src/__mocks__/fileMock.js'
    },

    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    setupFiles: ['<rootDir>/src/__mocks__/browserMocks.js'],

    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
        '<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)'
    ],

    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/__tests__/**/*',
        '!src/**/__mocks__/**/*',
        '!src/vanilla.js',
        '!src/cdn.js'
    ],

    testTimeout: 10000,
    clearMocks: true,
    restoreMocks: true,
    verbose: true,

    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/dist/'
    ]
};