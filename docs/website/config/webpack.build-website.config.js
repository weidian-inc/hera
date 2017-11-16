const path = require('path')
const HtmlwebpackPlugin = require('html-webpack-plugin')
const autoprefixer = require('autoprefixer')
const webpack = require('webpack')

module.exports = {
  entry: {
    'hera-website/js/index': path.resolve(
      path.resolve(path.resolve(__dirname), '../page'),
      './index.js'
    )
  },
  output: {
    path: path.resolve(path.resolve(__dirname), '../temp'),
    filename: '[name].[hash:8].js',
    chunkFilename: 'hera-website/js/[name].[hash:8].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loaders: [
          {
            loader: 'vue-loader',
            options: {
              postcss: {
                plugins: [
                  autoprefixer({
                    browsers: ['> 1%', 'ie >= 9', 'iOS >= 6', 'Android >= 2.1']
                  })
                ]
              }
            }
          }
        ]
      },
      {
        test: /\.(css|scss|sass)$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'html-loader'
          },
          {
            loader: 'markdown-loader',
            options: {
              /* your options here */
            }
          }
        ]
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpe?g|gif|svg)(\?t=\d+)?$/,
        loaders: [
          {
            loader: 'url-loader?limit=8192&name=hera-website/assets/[name]-[hash].[ext]'
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),
    new HtmlwebpackPlugin({
      template: path.resolve(__dirname, '../page/index.html'),
      filename: 'index.html',
      inject: 'body'
    }),
    new webpack.ProvidePlugin({
      hljs: path.resolve(
        path.resolve(path.resolve(__dirname), '../page'),
        './assets/js/highlight/highlight.pack.js'
      )
    }),
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false
      },
      compress: {
        warnings: false
      }
    })
  ]
}
