'use strict'
const fs = require('fs-extra')
const path = require('path')
const loadConfig = require('./config')
const util = require('./util')
const cache = require('./cache')
const parser = require('./parser')
const version = require('../package.json').version
const builder = require('./builder')

function escape (x) {
  return x
}

function noext (str) {
  return str.replace(/\.\w+$/, '')
}

function loadFile (p, throwErr = true) {
  if (/\.wxss$/.test(p)) throwErr = false
  return new Promise((resolve, reject) => {
    fs.stat(`./${p}`, (err, stats) => {
      if (err) {
        if (throwErr) return reject(new Error(`file ${p} not found`))
        return resolve('')
      }
      if (stats && stats.isFile()) {
        let content = cache.get(p)
        if (content) {
          return resolve(content)
        } else {
          return parser(`${p}`).then(resolve, reject)
        }
      } else {
        return resolve('')
      }
    })
  })
}
function getHeraConf () {
  return new Promise(function (resolve, reject) {
    fs.readFile('./heraConf.js', 'utf8', (err, data) => {
      if (err) return reject('')
      try {
        resolve(data.replace(/module.exports\s*=\s*/, ''))
        // resolve(conf)
      } catch (e) {
        return reject('')
      }
    })
  }).catch(function (err) {})
}
/*
exports.getIndex = co.wrap(function *() {
  let [config, rootFn] = yield [loadConfig(), util.loadTemplate('index')]
  let pageConfig = yield util.loadJSONfiles(config.pages)
  config['window'].pages = pageConfig
  let tabBar = config.tabBar || {}
  let topBar = tabBar.position == 'top';
  return rootFn({
    config: JSON.stringify(config),
    root: config.root,
    ip: util.getIp(),
    topBar: topBar,
    tabbarList:tabBar.list,
    tabStyle:`background-color: ${tabBar.backgroundColor}; border-color: ${tabBar.borderStyle}; height: `+(topBar?47 : 56)+'px;',
    tabLabelColor:tabBar.color,
    tabLabelSelectedColor:tabBar.selectedColor,
    version
  }, {}, escape)
})(true)
*/

exports.getService = async function (opts) {
  let serviceFn = await util.loadTemplate('service')
  return serviceFn(
    {
      version,
      logMethods: opts.showLog ? util.logMethods : ''
    },
    { noext },
    escape
  )
}

exports.getOtherFiles = async function (src, dest) {
  // let fileList = await util.getOtherFileList(src)
  // return util.copyFiles(fileList, dest)
  return util.copy('./', dest, {
    exclude: {
      basename: ['.git', 'node_modules', 'heraTmp', 'heraPlatforms'],
      extname: ['.js', '.json', '.wxss', '.css', '.git', '.md', '.wxml', '']
    }
  })
}

exports.getServiceConfig = async function () {
  let [config, serviceFn] = await Promise.all([
    loadConfig(),
    util.loadJSTemplate('service-config')
  ])
  let pageConfig = await util.loadJSONfiles(config.pages)
  config['window'].pages = pageConfig
  config = JSON.stringify(config)
  config = config.replace(
    /(['"](selectedIconPath|iconPath)['"]\s*:\s*['"])\//gi,
    '$1'
  )
  return serviceFn(
    {
      config: config
    },
    { noext },
    escape
  )
}

exports.getHeraConfig = async function () {
  let [config, serviceFn] = await Promise.all([
    getHeraConf(),
    util.loadJSTemplate('config')
  ])
  return serviceFn(
    {
      conf: config || null
    },
    { noext },
    escape
  )
}

exports.getServiceJs = async function () {
  return builder.load()
}

exports.getPage = function (path) {
  return Promise.all([loadFile(path + '.wxml'), loadFile(path + '.wxss')])
}

exports.getAppWxss = async function (path) {
  return loadFile(path + '.wxss')
}
