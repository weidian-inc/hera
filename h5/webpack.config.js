const webpack = require('webpack')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const DIST_PATH = './tmp/public/script'
const isProd = process.env.NODE_ENV === 'production'
const showAnalysis = process.env.ANA === 'true'
const watch = process.env.WATCH === 'true'
let plugins = [new ExtractTextPlugin('../css/index.css')]
if (showAnalysis) {
  plugins = plugins.concat([new BundleAnalyzerPlugin()])
}
if (isProd) {
  plugins = plugins.concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.AggressiveMergingPlugin(), // Merge chunks
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_debugger: true,
        dead_code: true,
        properties: true,
        evaluate: true
      },
      output: {
        comments: false
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ])
}

function getPath (rPath) {
  return path.resolve(__dirname, rPath)
}

function getSourcePath (rPath) {
  return getPath(`./src/${rPath}`)
}

module.exports = {
  entry: {
    view: getSourcePath('view.js'),
    service: getSourcePath('service.js')
  },
  output: {
    filename: '[name].js',
    publicPath: 'script/',
    chunkFilename: '[name].wd.chunk.js',
    path: getPath(DIST_PATH)
  },
  watch: watch,
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['env', 'stage-0']
        }
      },
      {
        test: /\.html/,
        loader: 'html-loader'
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: {
            loader: 'css-loader',
            options: { minimize: isProd }
          }
        })
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file-loader?name=[name].[ext]&publicPath=&outputPath=../images/'
        ]
      },
      {
        test: /\.et/,
        loader: 'ei-loader'
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  stats: {
    modulesSort: 'size',
    chunksSort: 'size',
    assetsSort: 'size'
  },
  plugins: plugins
}
