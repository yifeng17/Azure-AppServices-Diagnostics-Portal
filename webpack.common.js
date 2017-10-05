const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {

    entry: {
        // application entry points
        'polyfills': './app/polyfills.ts',
        'loading-css': './loading-css/loading-css.ts'
    },

    resolve: {
        extensions: ['.ts', '.js', '.json']
    },

    module: {
        rules: [
            // We define the ts loaders in the environment specific configurations

            {
                test: /\.html$/,
                use: 'html-loader'
            },
            // For external css we will combine, and extract it into an external file
            {
                test: /\.css$/,
                exclude: path.resolve(__dirname, "app"),
                use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
            },
            // For global css files that we are loading in main.ts
            {
                test: /\.css$/,
                include: path.resolve(__dirname, "app/assets"),
                use: ['style-loader', 'css-loader']
            },
            // This is for all css that goes with a component. 
            // This must use raw-loader because it is a requirement of using 'angular2-template-loader'
            {
                test: /\.css$/,
                include: path.resolve(__dirname, "app"),
                exclude: path.resolve(__dirname, "app/assets"),
                use: 'raw-loader'
            },
            // Below is for Font Awesome, which requires some special handling
            {
                test: /\.(png|jpe?g|gif|ico)$/,
                loader: 'file-loader?name=./assets/[name].[hash].[ext]'
            },
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=./assets/[name]/[hash].[ext]',
            },
            {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=./assets/[name]/[hash].[ext]'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=application/octet-stream&name=./assets/[name]/[hash].[ext]'
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader?&name=./assets/[name]/[hash].[ext]'
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=image/svg+xml&name=./assets/[name]/[hash].[ext]'
            }
        ]
    },

    plugins: [
		new ExtractTextPlugin('css/[name].[chunkhash].bundle.css'),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor', 'polyfills']
        }),
        new CleanWebpackPlugin(
            [
                './dist/js/',
                './dist/css/',
                './dist/assets/',
                './dist/index.html'
            ]
        ),
        new webpack.ContextReplacementPlugin(
            /(.+)?angular(\\|\/)core(.+)?/,
            path.join(__dirname, 'app')
        ),
        // inject in index.html
        new HtmlWebpackPlugin({
            template: './index.html',
            inject: 'body',
            filename: 'index.html'
        }),
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            jquery: 'jquery'
        })
    ]
}; 