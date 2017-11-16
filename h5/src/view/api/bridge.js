function execOnJSBridgeReady (callback) {
  typeof HeraJSBridge !== 'undefined'
    ? callback()
    : document.addEventListener('HeraJSBridgeReady', callback, !1)
}

function invoke () {
  var params = arguments
  execOnJSBridgeReady(function () {
    HeraJSBridge.invoke.apply(HeraJSBridge, params)
  })
}

function on () {
  var params = arguments
  execOnJSBridgeReady(function () {
    HeraJSBridge.on.apply(HeraJSBridge, params)
  })
}

function publish () {
  var params = Array.prototype.slice.call(arguments)
  params[1] = {
    data: params[1],
    options: {
      timestamp: Date.now()
    }
  }
  execOnJSBridgeReady(function () {
    HeraJSBridge.publish.apply(HeraJSBridge, params)
  })
}

function subscribe () {
  var params = Array.prototype.slice.call(arguments),
    callback = params[1]
  params[1] = function (args, ext) {
    var data = args.data,
      opt = args.options,
      timeMark =
        arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
      timestamp = (opt && opt.timestamp) || 0,
      endTime = Date.now()
    typeof callback === 'function' && callback(data, ext)
    Reporter.speedReport({
      key: 'appService2Webview',
      data: data || {},
      timeMark: {
        startTime: timestamp,
        endTime: endTime,
        nativeTime: timeMark.nativeTime
      }
    })
  }
  execOnJSBridgeReady(function () {
    HeraJSBridge.subscribe.apply(HeraJSBridge, params)
  })
}

function invokeMethod (eventName) {
  // invoke 事件
  var params =
      arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
    innerParams =
      arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
    callbacks = {}
  for (var r in params) {
    typeof params[r] === 'function' &&
      ((callbacks[r] = params[r]), delete params[r])
  }
  invoke(eventName, params, function (res) {
    res.errMsg = res.errMsg || eventName + ':ok'
    var isOk = res.errMsg.indexOf(eventName + ':ok') === 0,
      isCancel = res.errMsg.indexOf(eventName + ':cancel') === 0,
      isFail = res.errMsg.indexOf(eventName + ':fail') === 0
    typeof innerParams.beforeAll === 'function' && innerParams.beforeAll(res)
    isOk
      ? (typeof innerParams.beforeSuccess === 'function' &&
          innerParams.beforeSuccess(res),
        typeof callbacks.success === 'function' && callbacks.success(res),
        typeof innerParams.afterSuccess === 'function' &&
          innerParams.afterSuccess(res))
      : isCancel
        ? (typeof callbacks.cancel === 'function' && callbacks.cancel(res),
          typeof innerParams.cancel === 'function' && innerParams.cancel(res))
        : isFail &&
          (typeof callbacks.fail === 'function' && callbacks.fail(res),
          typeof innerParams.fail === 'function' && innerParams.fail(res)),
      typeof callbacks.complete === 'function' && callbacks.complete(res),
      typeof innerParams.complete === 'function' && innerParams.complete(res)
  })
}

function onMethod (eventName, callback) {
  on(eventName, callback)
}

export default {
  invoke: invoke,
  on: on,
  publish: publish,
  subscribe: subscribe,
  invokeMethod: invokeMethod,
  onMethod: onMethod
}
