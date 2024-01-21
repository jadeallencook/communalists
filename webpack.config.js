const HtmlWebPackPlugin = require('html-webpack-plugin');

const htmlPlugin = new HtmlWebPackPlugin({
    template: './public/index.html',
    filename: './index.html',
});

module.exports = {
    mode: 'development',
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
            '@base': path.resolve(__dirname, 'src/base/'),
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.(ts|tsx)$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [htmlPlugin],
};
