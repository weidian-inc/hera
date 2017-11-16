import Enums from './Enums'

const objAssign = Object.assign ||
  function (originObj) {
    for (let idx = 1; idx < arguments.length; idx++) {
      let argObj = arguments[idx]
      for (let arg in argObj) {
        Object.prototype.hasOwnProperty.call(argObj, arg) &&
          (originObj[arg] = argObj[arg])
      }
    }
    return originObj
  }

const isString = function (target) {
  return Object.prototype.toString.call(target) === '[object String]'
}

const isIphone = navigator.userAgent.match('iPhone')
const screenWidth = window.screen && window.screen.width || 375
const devicePixelRatio = window.devicePixelRatio || 2
const SMALL_NUM = 1e-4
const rpxToPxNum = function (rpxNum) {
  rpxNum = rpxNum / Enums.BASE_DEVICE_WIDTH * screenWidth
  rpxNum = Math.floor(rpxNum + SMALL_NUM)
  return rpxNum === 0 ? devicePixelRatio !== 1 && isIphone ? 0.5 : 1 : rpxNum
}
const parseRpx = function (matches) {
  let num = 0, decimalRadix = 1, isHandlingDecimal = !1, isNeg = !1, idx = 0
  for (; idx < matches.length; ++idx) {
    let ch = matches[idx]
    if (ch >= '0' && ch <= '9') {
      if (isHandlingDecimal) {
        decimalRadix *= 0.1
        num += (ch - '0') * decimalRadix
      } else {
        num = 10 * num + (ch - '0')
      }
    } else {
      ch === '.' ? (isHandlingDecimal = !0) : ch === '-' && (isNeg = !0)
    }
  }
  isNeg && (num = -num)
  return rpxToPxNum(num)
}
const rpxInTemplate = /%%\?[+-]?\d+(\.\d+)?rpx\?%%/g
const rpxInCSS = /(:|\s)[+-]?\d+(\.\d+)?rpx/g

export default {
  isString,
  isArray: function (target) {
    return Array.isArray
      ? Array.isArray(target)
      : Object.prototype.toString.call(target) === '[object Array]'
  },
  getPrototype: function (obj) {
    return Object.getPrototypeOf
      ? Object.getPrototypeOf(obj)
      : obj.__proto__
          ? obj.__proto__
          : obj.constructor ? obj.constructor.prototype : void 0
  },
  isObject: function (obj) {
    return typeof(obj) === 'object' && obj !== null
  },
  isEmptyObject: function (obj) {
    for (let key in obj) {
      return !1
    }
    return !0
  },
  isVirtualNode: function (node) {
    return node && node.type === 'WxVirtualNode'
  },
  isVirtualText: function (node) {
    return node && node.type === 'WxVirtualText'
  },
  isUndefined: function (obj) {
    return Object.prototype.toString.call(obj) === '[object Undefined]'
  },
  transformRpx: function (propValue, isInCSS) {
    if (!isString(propValue)) return propValue
    let matches = void 0
    matches = isInCSS
      ? propValue.match(rpxInCSS)
      : propValue.match(rpxInTemplate)
    matches &&
      matches.forEach(function (match) {
        const pxNum = parseRpx(match)
        const cssValue = (isInCSS ? match[0] : '') + pxNum + 'px'
        propValue = propValue.replace(match, cssValue)
      })
    return propValue
  },
  uuid: function () {
    let uuidPart = function () {
      return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1)
    }
    return uuidPart() +
      uuidPart() +
      '-' +
      uuidPart() +
      '-' +
      uuidPart() +
      '-' +
      uuidPart() +
      '-' +
      uuidPart() +
      uuidPart() +
      uuidPart()
  },
  getDataType: function (obj) {
    return Object.prototype.toString.call(obj).split(' ')[1].split(']')[0]
  },
  getPageConfig: function () {
    let configs = {}
    if (window.__wxConfig && window.__wxConfig.window) {
      configs = window.__wxConfig.window
    } else {
      let globConfig = {}
      window.__wxConfig &&
        window.__wxConfig.global &&
        window.__wxConfig.global.window &&
        (globConfig = window.__wxConfig.global.window)

      let pageConfig = {}
      window.__wxConfig &&
        window.__wxConfig.page &&
        window.__wxConfig.page[window.__route__] &&
        window.__wxConfig.page[window.__route__].window &&
        (pageConfig = window.__wxConfig.page[window.__route__].window)
      configs = objAssign({}, globConfig, pageConfig)
    }
    return configs
  }
}
