//Webpack requires this to work with directories
const path = require('path');
const extract = require('mini-css-extract-plugin');
const isDevelopment = process.env.NODE_ENV === 'development'

// This is main configuration object that tells Webpackw what to do.
module.exports = {
    //path to entry paint
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    //path and filename of the final output
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
    },

    mode: 'development',
    devServer: {
        static: {
            directory: path.join(__dirname, 'src'),
        },
        compress: true,
        port: 9000,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    "style-loader",
                    // Translates CSS into CommonJS
                    "css-loader",
                    // Compiles Sass to CSS
                    "sass-loader",
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.scss'],
    },
    plugins: [
        new extract({
            filename: "main.css",
            chunkFilename: isDevelopment ? '[id].css' : '[id].[hash].css'
        }),
    ],
};
