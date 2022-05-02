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
        contentBase: path.resolve(__dirname, "./src"),
        historyApiFallback: true,
        inline: true,
        open: true,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.module\.s(a|c)ss$/,
                loader: [
                    isDevelopment ? 'style-loader' : extract.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            sourceMap: isDevelopment
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: isDevelopment
                        }
                    }
                ]
            },
            {
                test: /\.s(a|c)ss$/,
                exclude: /\.module.(s(a|c)ss)$/,
                loader: [
                    isDevelopment ? 'style-loader' : extract.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: isDevelopment
                        }
                    }
                ]
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
