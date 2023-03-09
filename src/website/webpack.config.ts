//Webpack requires this to work with directories
import * as  HtmlWebpackPlugin from 'html-webpack-plugin';
import * as  MiniCssExtractPlugin from "mini-css-extract-plugin";
const EasySeo = require('webpack-easy-seo')
import * as  ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import * as path from 'path';
import * as webpack from 'webpack';
import 'webpack-dev-server';

const seoInst = new EasySeo({
    // Application Title, which is shown in the tab bar.
    title: "URLite",
    // Application Description, which is shown in search engines and OpenGraph.
    description: "URLite url shortener",
    // Your public url, which is used to create the correct links to your images.
    publicUrl: "https://urlite.samuelbagattin.com",
    // Your thumbnail image, which is used in OpenGraph
    imagePath: "./src/assets/urlite-logo.png",
    // Your webpack build folder
    buildPath: "./dist",
    // Path in your build folder to your image.
    outputPath: "./thumbnail.png",

});

// This is main configuration object that tells Webpackw what to do.
const config: webpack.Configuration = {
    //path to entry paint
    entry: './src/index.ts',
    //path and filename of the final output
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
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
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader', // translates CSS into CommonJS
                        options: {
                            importLoaders: 1
                        }
                    },
                    'sass-loader' // compiles Sass to CSS, using Node Sass by default
                ],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.scss'],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            title: seoInst.getTitle(),
            // Meta Tags
            meta: seoInst.getMetaTags(),
            favicon: 'src/assets/favicon.ico'
        }),
        seoInst
    ],
    optimization: {
        minimizer: [
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.sharpMinify,
                    options: {
                        encodeOptions: {
                            // Your options for `sharp`
                            // https://sharp.pixelplumbing.com/api-output
                        },
                    },
                },
                generator: [
                    {
                        // You can apply generator using `?as=webp`, you can use any name and provide more options
                        preset: "webp",
                        implementation: ImageMinimizerPlugin.sharpGenerate,
                        options: {
                            encodeOptions: {
                                webp: {
                                    quality: 90,
                                },
                            },
                        },
                    },
                ],
            }),
        ],
    },
};

export default config;
