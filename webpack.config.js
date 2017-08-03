const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        index: './src/javascript/index.js',
        vendor: [
            'leaflet'
        ]
    },
    output: {
        filename: '[name].[chunkhash].js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'PUBG Bravery'
        }),
        new CleanWebpackPlugin(['dist']),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'webpack-bootstrap'
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [ 'file-loader' ]
            }
        ]
    }
};