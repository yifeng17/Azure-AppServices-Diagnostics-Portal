const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
    entry: {
        'app': './app/main.ts',
        'vendor': './app/vendor.ts',
    },
    output: {
        // Here we can specify the output
        path: path.join(__dirname, 'dist'),
        filename: 'js/[name].bundle.js'
    },
    devServer: {
        historyApiFallback: true,
        stats: 'minimal',
        port: 3000,
        https: true
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    'awesome-typescript-loader',
                    'angular2-template-loader',
                    'source-map-loader'
                ]
            }
        ]
    }
});