// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['src/**/*.{ts,tsx,js}'],
        plugins: {
            react,
            'react-hooks': reactHooks,
        },
        languageOptions: {
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',

                // Node.js globals
                module: 'readonly',
                require: 'readonly',
                process: 'readonly',

                // Animation globals
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',

                // AMD globals
                define: 'readonly',

                // Jest globals
                describe: 'readonly',
                test: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                jest: 'readonly',
            },
        },
        rules: {
            // TypeScript specific rules
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/no-require-imports': 'off',

            // React specific rules
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/jsx-uses-react': 'off',
            'react/jsx-uses-vars': 'error',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // General rules
            'no-console': 'warn',
            'no-debugger': 'warn',
            'prefer-const': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-arrow-callback': 'error',

            // Code quality rules
            'eqeqeq': ['error', 'always'],
            'curly': ['error', 'all'],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-script-url': 'error',

            // Style rules
            'semi': ['error', 'always'],
            'quotes': ['error', 'single', { avoidEscape: true }],
            'comma-dangle': ['error', 'always-multiline'],
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-spacing': ['error', 'never'],
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        // Specific rules for test files
        files: ['**/*.test.*', '**/*.spec.*'],
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    {
        // Specific rules for mock files
        files: ['src/__mocks__/**/*.js'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        // Specific rules for vanilla JS files (browser + node + AMD)
        files: ['src/vanilla.js', 'src/cdn.js'],
        rules: {
            'no-console': 'off', // Allow console in vanilla files
        },
    },
    {
        // Ignore patterns
        ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
    }
);