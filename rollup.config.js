import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import { dts } from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { readFileSync } from 'fs';

// Read package.json
const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

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

    // Vanilla JS build
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
            postcss({
                extract: false,
                inject: true,
                minimize: true,
            }),
        ],
    },

    // CDN build (includes CSS)
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
            postcss({
                extract: false,
                inject: true,
                minimize: true,
            }),
        ],
    },
];