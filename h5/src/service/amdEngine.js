var statusDefineFlag = 1
var statusRequireFlag = 2
var moduleArr = {}

const define = function (path, fun) {
  moduleArr[path] = {
    status: statusDefineFlag,
    factory: fun
  }
}

var getPathPrefix = function (pathname) {
  // 返回path
  var res = pathname.match(/(.*)\/([^\/]+)?$/)
  return res && res[1] ? res[1] : './'
}

var getRequireFun = function (pathname) {
  // e:path 返回相对e的require
  var pathPrefix = getPathPrefix(pathname)
  return function (path) {
    if (typeof path !== 'string') {
      throw new Error('require args must be a string')
    }
    var floderArr = []
    var folders = (pathPrefix + '/' + path).split('/')
    var pathLength = folders.length
    for (var i = 0; i < pathLength; ++i) {
      var folder = folders[i]
      if (folder != '' && folder != '.') {
        if (folder == '..') {
          if (floderArr.length == 0) {
            throw new Error("can't find module : " + path)
          }
          floderArr.pop()
        } else {
          i + 1 < pathLength && folders[i + 1] == '..'
            ? i++
            : floderArr.push(folder)
        }
      }
    }
    try {
      var pathname = floderArr.join('/')
      if (!/\.js$/.test(pathname)) {
        pathname += '.js'
      }
      return require(pathname)
    } catch (e) {
      throw e
    }
  }
}
const require = function (path) {
  // exports o
  if (typeof path !== 'string') {
    throw new Error('require args must be a string')
  }
  var moduleObj = moduleArr[path]
  if (!moduleObj) throw new Error('module "' + path + '" is not defined')
  if (moduleObj.status === statusDefineFlag) {
    var factoryFun = moduleObj.factory
    var module = {
      exports: {}
    }
    var exports
    if (factoryFun) {
      exports = factoryFun(getRequireFun(path), module, module.exports)
    }

    moduleObj.exports = module.exports || exports
    moduleObj.status = statusRequireFlag
  }
  return moduleObj.exports
}

export { define, require }
window.define = define
window.require = require

wd.version = {
  updateTime: '2017.1.13 16:51:56',
  info: '',
  version: 32
}
// 导出全局方法

window.__WAServiceEndTime__ = Date.now()
