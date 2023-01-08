const HtmlWebpackPlugin = require('html-webpack-plugin');
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
	],
	resolve: {
		modules: [__dirname, 'src', 'node_modules'],
		extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
		alias: {
			'@pages': path.resolve(__dirname, 'src/pages'),
			'@components': path.resolve(__dirname, 'src/components'),
			'@atoms': path.resolve(__dirname, 'src/components/atoms'),
			'@molecules': path.resolve(__dirname, 'src/components/molecules'),
			'@organisms': path.resolve(__dirname, 'src/components/organisms'),
			'@utils': path.resolve(__dirname, 'src/utils'),
			'@assets': path.resolve(__dirname, 'src/assets'),
			'@database': path.resolve(__dirname, 'database'),
			'@interfaces': path.resolve(__dirname, 'interfaces'),
			'@objects': path.resolve(__dirname, 'objects'),
			'@custom-types': path.resolve(__dirname, 'types'),
			'@fb': path.resolve(__dirname, 'src/firebase'),
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
