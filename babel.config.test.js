module.exports = {
    presets: [
        ['@babel/preset-env', {
            targets: { node: '14.18.0' },
            modules: 'commonjs'
        }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
    ],
    plugins: [
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator'
    ]
};