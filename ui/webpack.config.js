const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack'); // Import the dotenv-webpack plugin

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/', // Ensure this is set to serve from the root
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
        "path": require.resolve("path-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "vm": require.resolve("vm-browserify"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  mode: 'development',
  devServer: {
    static: './dist', // Ensure this points to the correct directory
    port: 9000,
    open: true, // Automatically open the browser
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/template.html', // Path to your template file
      filename: 'index.html', // Output file name
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser', // Add this line
      Buffer: ['buffer', 'Buffer'], // If you also need Buffer
    }),
    new Dotenv(), // Add this line to use dotenv-webpack
  ],
};
