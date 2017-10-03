const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const common = require('./webpack.common.js');
const ngToolsWebpack = require('@ngtools/webpack');
const helpers = require('./helper');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(common, {
    entry: {
        'app': './app/main-aot.ts',
        'vendor': './app/vendor-aot.ts'
    },
    output: {
        // Here we can specify the output
        path: path.join(__dirname, 'aot'),
        filename: 'js/[name].[chunkhash].bundle.js',
    },
    module: {
        rules: [
            { 
                test: /\.ts$/, 
                loader: '@ngtools/webpack' 
            }
        ]
    },
    plugins: [
        new UglifyJSPlugin({
            compress: { warnings: false }
        }),
        new ngToolsWebpack.AotPlugin({
            tsConfigPath: './tsconfig-aot.json',
            entryModule: helpers.root('app/app.module.ts#AppModule')
        }),
        new CleanWebpackPlugin(
            [
                './aot/js/',
                './aot/css/',
                './aot/assets/',
                './aot/index.html'
            ]
        )
    ]
});