const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  name: 'token-mold',
  entry: {
    index: path.resolve(__dirname, 'src/scripts/index.js')
  },
  mode: 'development',
  devtool: 'source-map',
  output: {
    publicPath: 'modules/token-mold/scripts/',
    filename: 'index.js',
    chunkFilename: 'bundles/[name].[chunkhash:4].js',
    path: path.resolve(__dirname, 'dist/scripts/'),
  },
  optimization: {
    minimize: true
  },
  plugins: [
    new CleanWebpackPlugin()
  ]
};