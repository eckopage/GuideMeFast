export default {
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
                useBuiltIns: 'usage',
                corejs: 3,
                modules: false
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
    ],
    env: {
        test: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            node: 'current'
                        },
                        modules: 'commonjs'
                    }
                ],
                '@babel/preset-react',
                '@babel/preset-typescript'
            ]
        }
    }
};