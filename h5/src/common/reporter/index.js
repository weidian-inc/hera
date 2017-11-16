import * as errorType from './errorType'

let jsBridge, bridgeName, logEventName
if (typeof ServiceJSBridge !== 'undefined') {
  jsBridge = window.ServiceJSBridge
  bridgeName = 'Service'
  logEventName = 'H5_JS_SERVICE_ERR'
} else if (typeof HeraJSBridge !== 'undefined') {
  jsBridge = window.HeraJSBridge
  bridgeName = 'Weixin'
  logEventName = 'H5_JS_VIEW_ERR'
}
if (typeof __wxConfig === 'undefined') {
  let __wxConfig = (typeof __wxConfig__ !== 'undefined' && __wxConfig__) || {}
}
function onBridgeReady (fn) {
  typeof jsBridge !== 'undefined'
    ? fn()
    : document.addEventListener(bridgeName + 'JSBridgeReady', fn, !1)
}
function invoke () {
  // invoke
  var args = arguments
  onBridgeReady(function () {
    jsBridge.invoke.apply(jsBridge, args)
  })
}
function publish () {
  // publish
  var args = arguments
  onBridgeReady(function () {
    jsBridge.publish.apply(jsBridge, args)
  })
}
function getUpdateTime () {
  // get wx.version.updateTime
  return typeof wx !== 'undefined'
    ? (wx.version && wx.version.updateTime) || ''
    : ''
}
function reportKeyValue () {
  // 以key/value的形式上报日志
  !reportKeyValues ||
    reportKeyValues.length <= 0 ||
    (invoke('reportKeyValue', {
      dataArray: reportKeyValues
    }),
    (reportKeyValues = []))
}
function reportIDKey () {
  !reportIDKeys ||
    reportIDKeys.length <= 0 ||
    (invoke('reportIDKey', { dataArray: reportIDKeys }), (reportIDKeys = []))
}
function systemLog () {
  !systemLogs ||
    systemLogs.length <= 0 ||
    (invoke('systemLog', { dataArray: systemLogs }), (systemLogs = []))
}
function getPlatName () {
  // get platname
  return 'devtools'
}
function safeCall (fn) {
  //
  return function () {
    try {
      return fn.apply(fn, arguments)
    } catch (e) {
      console.error('reporter error:' + e.message)
    }
  }
}
function _defindGeter (key) {
  defineObj.__defineGetter__(key, function () {
    return safeCall(utils[key])
  })
}
var reportIDKeyLength = 1,
  reportKeyValueLengthThreshold = 20,
  systemLogLength = 50,
  submitTLThreshold = 50,
  reportKeyTLThreshold = 50,
  reportIDKeyTLThreshold = 20,
  logTLThreshold = 50,
  speedReportThreshold = 500,
  slowReportThreshold = 500,
  errorReportTemp = 3,
  errorReportSize = 3,
  slowReportLength = 3,
  errorReportLength = 50,
  slowReportValueLength = 50,
  reportKeyValues = [],
  reportIDKeys = [],
  systemLogs = [],
  reportKeyTimePreTime = 0,
  reportIDKeyPreTime = 0,
  logPreTime = 0,
  submitPreTime = 0,
  slowReportTime = 0,
  speedReportMap = {},
  errorReportMap = {},
  slowReportMap = {}
typeof logxx === 'function' && logxx('reporter-sdk start')
var isIOS = getPlatName() === 'ios'
var errListenerFns = function () {}
var utils = {
  // log report obj
  surroundThirdByTryCatch: function (fn, ext) {
    return function () {
      var res
      try {
        var startTime = Date.now()
        res = fn.apply(fn, arguments)
        var doTime = Date.now() - startTime
        doTime > 1e3 &&
          utils.slowReport({
            key: 'apiCallback',
            cost: doTime,
            extend: ext
          })
      } catch (e) {
        utils.thirdErrorReport({
          error: e,
          extend: ext
        })
      }
      return res
    }
  },
  slowReport: function (params) {
    var key = params.key,
      cost = params.cost,
      extend = params.extend,
      force = params.force,
      slowValueType = errorType.SlowValueType[key],
      now = Date.now()
    // 指定类型 强制或上报间隔大于＝指定阀值 extend类型数不超出阀值&当前extend上报数不超出阀值
    var flag =
      slowValueType &&
      (force || !(now - slowReportTime < slowReportThreshold)) &&
      !(
        Object.keys(slowReportMap).length > slowReportValueLength ||
        (slowReportMap[extend] || (slowReportMap[extend] = 0),
        slowReportMap[extend]++,
        slowReportMap[extend] > slowReportLength)
      )
    if (flag) {
      slowReportTime = now
      var value = cost + ',' + encodeURIComponent(extend) + ',' + slowValueType
      utils.reportKeyValue({
        key: 'Slow',
        value: value,
        force: !0
      })
    }
  },
  speedReport: function (params) {
    var key = params.key,
      data = params.data,
      timeMark = params.timeMark,
      force = params.force,
      SpeedValueType = errorType.SpeedValueType[key],
      now = Date.now(),
      dataLength = 0,
      nativeTime = timeMark.nativeTime,
      flag =
        SpeedValueType &&
        (force ||
          !(
            now - (speedReportMap[SpeedValueType] || 0) <
            speedReportThreshold
          )) &&
        timeMark.startTime &&
        timeMark.endTime &&
        ((SpeedValueType != 1 && SpeedValueType != 2) || nativeTime)
    if (flag) {
      data && (dataLength = JSON.stringify(data).length)
      speedReportMap[SpeedValueType] = now
      var value =
        SpeedValueType +
        ',' +
        timeMark.startTime +
        ',' +
        nativeTime +
        ',' +
        nativeTime +
        ',' +
        timeMark.endTime +
        ',' +
        dataLength
      utils.reportKeyValue({
        key: 'Speed',
        value: value,
        force: true
      })
    }
  },
  reportKeyValue: function (params) {
    var key = params.key,
      value = params.value,
      force = params.force
    errorType.KeyValueType[key] &&
      ((!force && Date.now() - reportKeyTimePreTime < reportKeyTLThreshold) ||
        ((reportKeyTimePreTime = Date.now()),
        reportKeyValues.push({
          key: errorType.KeyValueType[key],
          value: value
        }),
        reportKeyValues.length >= reportKeyValueLengthThreshold &&
          reportKeyValue()))
  },
  reportIDKey: function (params) {
    var id = params.id,
      key = params.key,
      force = params.force
    errorType.IDKeyType[key] &&
      ((!force && Date.now() - reportIDKeyPreTime < reportIDKeyTLThreshold) ||
        ((reportIDKeyPreTime = Date.now()),
        reportIDKeys.push({
          id: id || isIOS ? '356' : '358',
          key: errorType.IDKeyType[key],
          value: 1
        }),
        reportIDKeys.length >= reportIDKeyLength && reportIDKey()))
  },
  thirdErrorReport: function (params) {
    var error = params.error,
      extend = params.extend
    utils.errorReport({
      key: 'thirdScriptError',
      error: error,
      extend: extend
    })
  },
  errorReport: function (params) {
    var data = {},
      error = params.error || {},
      extend = params.extend
    data.msg = extend ? error.message + ';' + extend : error.message
    data.stack = error.stack
    if (errorType.ErrorType[params.key]) {
      data.key = params.key
    } else {
      data.key = 'unknowErr'
    }
    jsBridge.publish('H5_LOG_MSG', { event: logEventName, desc: data }, [
      params.webviewId || ''
    ])
  },
  log: function (log, debug) {
    log &&
      typeof log === 'string' &&
      ((!debug && Date.now() - logPreTime < logTLThreshold) ||
        ((logPreTime = Date.now()),
        systemLogs.push(log + ''),
        systemLogs.length >= systemLogLength && systemLog()))
  },
  submit: function () {
    Date.now() - submitPreTime < submitTLThreshold ||
      ((submitPreTime = Date.now()),
      reportIDKey(),
      reportKeyValue(),
      systemLog())
  },
  registerErrorListener: function (fn) {
    typeof fn === 'function' && (errListenerFns = fn)
  },
  unRegisterErrorListener: function () {
    errListenerFns = function () {}
  },
  triggerErrorMessage: function (params) {
    errListenerFns(params)
  }
}
var defineObj = {}
for (var key in utils) {
  _defindGeter(key)
}

typeof window !== 'undefined' &&
  (window.onbeforeunload = function () {
    utils.submit()
  })
window.Reporter = defineObj
module.exports = defineObj
