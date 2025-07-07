const path = require('path');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: './src/renderer.js',
  devServer: {
  static: {
    directory: path.join(__dirname),
  },
  devMiddleware: {
    publicPath: '/dist/',
  },
  hot: true,
  compress: true,
  port: 3000,
},
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      }
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css'],
  },
  target: 'electron-renderer',
};
