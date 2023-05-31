const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
	entry: './src/index.tsx',
	output: {
		filename: 'bundle.[hash].js',
		path: path.resolve(__dirname, 'build'),
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './public/index.html',
		}),

        new webpack.EnvironmentPlugin({
			// null here indicates an optional environment variable;
			// this one is used by init-app.ts, and defaults to
			// the `communalists-test` backend when not provided.
			 FIREBASE_CONFIG: null,
        }),
	],
	resolve: {
		modules: [__dirname, 'src', 'node_modules'],
		extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
		alias: {
			'@pages': path.resolve(__dirname, 'src/pages'),
			'@components': path.resolve(__dirname, 'src/components'),
			'@utils': path.resolve(__dirname, 'src/utils'),
			'@assets': path.resolve(__dirname, 'src/assets'),
			'@database': path.resolve(__dirname, 'database'),
			'@interfaces': path.resolve(__dirname, 'interfaces'),
			'@objects': path.resolve(__dirname, 'objects'),
			'@custom-types': path.resolve(__dirname, 'types'),
			'@api': path.resolve(__dirname, 'src/api'),
			'@forms': path.resolve(__dirname, 'src/forms'),
		},
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: require.resolve('babel-loader'),
			},
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				loader: require.resolve('ts-loader'),
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.png|svg|jpg|gif$/,
				use: ['file-loader'],
			},
		],
	},
};
