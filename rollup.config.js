import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { readFileSync } from 'fs';

// Read package.json
const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

// Common Babel configuration for ES5 compatibility
const babelConfig = {
    babelHelpers: 'bundled',
    exclude: 'node_modules/**',
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    // Użyj konfiguracji z package.json
};

export default [
    // Main build
    {
        input: 'src/index.tsx',
        output: [
            {
                file: packageJson.main,
                format: 'cjs',
                sourcemap: true,
                exports: 'named',
            },
            {
                file: packageJson.module,
                format: 'esm',
                sourcemap: true,
            },
        ],
        plugins: [
            peerDepsExternal(),
            resolve({
                browser: true,
            }),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json',
                exclude: ['**/*.test.*', '**/*.stories.*'],
                sourceMap: true,
                inlineSources: true,
                declaration: true,
                declarationMap: true,
            }),
            babel(babelConfig),
            postcss({
                extract: true,
                minimize: true,
                sourceMap: true,
            }),
            terser({
                format: {
                    comments: false,
                },
            }),
        ],
        external: ['react', 'react-dom'],
    },

    // Material-UI build
    {
        input: 'src/material-ui.tsx',
        output: [
            {
                file: 'dist/material-ui.js',
                format: 'cjs',
                sourcemap: true,
                exports: 'named',
            },
            {
                file: 'dist/material-ui.esm.js',
                format: 'esm',
                sourcemap: true,
            },
        ],
        plugins: [
            peerDepsExternal(),
            resolve({
                browser: true,
            }),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json',
                target: 'ES2015',
            }),
            babel(babelConfig),
            terser({
                format: {
                    comments: false,
                },
            }),
        ],
        external: [
            'react',
            'react-dom',
            '@mui/material',
            '@mui/icons-material',
            './index'
        ],
    },

    // Vanilla JS build (już ES5 compatible)
    {
        input: 'src/vanilla.js',
        output: [
            {
                file: 'dist/vanilla.js',
                format: 'umd',
                name: 'GuideMeFast',
                sourcemap: true,
            },
            {
                file: 'dist/vanilla.esm.js',
                format: 'esm',
                sourcemap: true,
            },
        ],
        plugins: [
            resolve({
                browser: true,
            }),
            commonjs(),
            // Dodaj Babel też dla vanilla JS na wszelki wypadek
            babel({
                babelHelpers: 'bundled',
                exclude: 'node_modules/**',
                extensions: ['.js'],
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            targets: {
                                browsers: ['> 0.25%', 'not dead', 'ie >= 11'],
                            },
                            modules: false,
                        },
                    ],
                ],
            }),
            postcss({
                extract: false,
                inject: true,
                minimize: true,
            }),
            terser(),
        ],
    },

    // CDN build (includes CSS) - maksymalna kompatybilność
    {
        input: 'src/cdn.js',
        output: {
            file: 'dist/guidemefast.min.js',
            format: 'umd',
            name: 'GuideMeFast',
            sourcemap: true,
        },
        plugins: [
            resolve({
                browser: true,
            }),
            commonjs(),
            // Agresywne ustawienia Babel dla CDN (stare przeglądarki)
            babel({
                babelHelpers: 'bundled',
                exclude: 'node_modules/**',
                extensions: ['.js'],
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            targets: {
                                browsers: ['> 0.1%', 'not dead', 'ie >= 9'],
                            },
                            modules: false,
                            useBuiltIns: 'entry',
                            corejs: 3,
                        },
                    ],
                ],
            }),
            postcss({
                extract: false,
                inject: true,
                minimize: true,
            }),
            terser({
                format: {
                    comments: false,
                },
                compress: {
                    drop_console: true, // Usuń console.log z produkcji
                },
            }),
        ],
    },
];