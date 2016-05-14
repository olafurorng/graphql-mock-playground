var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'eval-source-map',
  entry:  [
    __dirname + "/app/index.js",
    'babel-polyfill'
  ],
  output: {
    path: __dirname + "/",
    filename: "bundle.js"
  },

  devServer: {
    contentBase: "./public",
    colors: true,
    historyApiFallback: true,
    inline: true,
    hot: true
  },

  module: {
    loaders: [
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['react','es2015']
        }
      },
      {
        test: /\.less$/,
        loader: 'style!css!less?modules!postcss'
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },

  postcss: [
    require('autoprefixer')
  ],

  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + "/app/index.html"
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
}
