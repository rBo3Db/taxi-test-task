const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
    entry: './src/index.js',
    devtool: 'source-map',
    optimization: {
        // We no not want to minimize our code.
        minimize: false
      },
    output: {
        path: path.resolve(__dirname, '.build'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.scss$/,
                use: [
                    // fallback to style-loader in development
                    process.env.NODE_ENV !== 'production'
                        ? 'style-loader'
                        : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(jpg|png|gif|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './index.html'
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: ".[name].css",
            chunkFilename: "[id].css"
        }),
        new CopyWebpackPlugin([{
            from: './assets',
            to: 'pics'
          }]),
          new BundleAnalyzerPlugin([{
            generateStatsFile:true
          }])
    ],
    devServer: {
        contentBase: path.join(__dirname, ''),
        port: 3001,
        historyApiFallback: true,
        overlay: true
    },
    watch : true
};
