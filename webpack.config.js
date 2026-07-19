const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => ({
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        },
    },
    
    mode: argv.mode || 'production',
    devtool: argv.mode === 'development' ? 'cheap-module-source-map' : false,
    entry: {
        mainPage: path.resolve(__dirname, "./src/index.tsx"),
        // popup: path.resolve(__dirname, "./src/popup.tsx"),
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: ['html-loader'],
            },
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true  // 只进行语法转换，不进行类型校验，提高构建速度
                        }
                    }
                ],
                include: [
                    path.resolve(__dirname, 'src')
                ],
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
            {
                test: /\.mp3$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/FocusSounds/[name][ext]'
                }
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: '云开诗词新标签页',
            filename: 'mainPage.html',
            template: 'public/index.html',
            chunks: ['vendors', 'mainPage'],
            minify: {
                collapseWhitespace: true,
                removeComments: true
            }
        }),
        // new HtmlWebpackPlugin({
        //     title: '云开诗词新标签页弹窗',
        //     filename: 'popup.html',
        //     template: 'public/popup.html',
        //     chunks: ['vendors', 'popup'],
        //     minify: {
        //         collapseWhitespace: true,
        //         removeComments: true
        //     }
        // }),
        new MiniCssExtractPlugin({
            filename: '[name].bundle.css',
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/Assets'),
                    to: path.resolve(__dirname, 'dist/assets'),
                },
                {
                    from: path.resolve(__dirname, 'src/ExtensionFiles'),
                    to: path.resolve(__dirname, 'dist/'),
                },
            ]
        })
    ]
});

