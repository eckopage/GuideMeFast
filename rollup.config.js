import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import { dts } from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { readFileSync } from 'fs';
import babel from '@rollup/plugin-babel';

// Read package.json
const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

// Babel config for Node 14 compatibility
const babelConfig = {
    exclude: 'node_modules/**',
    babelHelpers: 'bundled',
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: '14.18.0',
                    browsers: [
                        'Chrome >= 60',
                        'Firefox >= 55',
                        'Safari >= 12',
                        'Edge >= 15'
                    ]
                },
                modules: false,
                useBuiltIns: 'usage',
                corejs: 3
            }
        ],
        [
            '@babel/preset-react',
            {
                runtime: 'automatic'
            }
        ],
        '@babel/preset-typescript'
    ],
    plugins: [
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-private-methods'
    ]
};

export default [
    // Main build - ES5 compatible
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
                target: 'ES2018', // More compatible target
            }),
            babel(babelConfig),
            postcss({
                extract: true,
                minimize: true,
                sourceMap: true,
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
                target: 'ES2018',
            }),
            babel(babelConfig),
        ],
        external: [
            'react',
            'react-dom',
            '@mui/material',
            '@mui/icons-material',
            './index'
        ],
    },

    // Vanilla JS build - ES5 compatible
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
            babel({
                exclude: 'node_modules/**',
                babelHelpers: 'bundled',
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            targets: {
                                browsers: ['ie >= 11']
                            }
                        }
                    ]
                ]
            }),
            postcss({
                extract: false,
                inject: true,
                minimize: true,
            }),
        ],
    },

    // CDN build (includes CSS) - ES5 compatible
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
            babel({
                exclude: 'node_modules/**',
                babelHelpers: 'bundled',
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            targets: {
                                browsers: ['ie >= 11']
                            }
                        }
                    ]
                ]
            }),
            postcss({
                extract: false,
                inject: true,
                minimize: true,
            }),
        ],
    },

    // Type definitions
    {
        input: 'dist/index.d.ts',
        output: [{ file: 'dist/index.d.ts', format: 'esm' }],
        plugins: [dts()],
        external: [/\.css$/],
    },
];