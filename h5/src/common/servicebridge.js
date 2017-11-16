// 在 iOS 上，小程序的 javascript 代码是运行在 JavaScriptCore 中，是由 WKWebView 来渲染的，环境有 iOS8、iOS9、iOS10
// 在 Android 上，小程序的 javascript 代码是通过 X5 JSCore来解析，是由 X5 基于 Mobile Chrome 37 内核来渲染的
// 在 开发工具上， 小程序的 javascript 代码是运行在 nwjs 中，是由 Chrome Webview 来渲染的

!(function (global) {
  // ServiceJSBridge 对象兼容层
  if (
    (typeof logxx === 'function' && logxx('jsbridge start'),
    !global.ServiceJSBridge)
  ) {
    var hasDocument = global.hasOwnProperty('document'),
      isIOS = !1,
      callbacks = {},
      callbackIndex = 0,
      defaultEventHandlers = {},
      eventPrefix = 'custom_event_',
      handlers = {},
      PROTOCAL = 'wdhybrid',
      IFRAME_PREFIX = 'hybridjsbrige_'
    if (hasDocument) {
      var userAgent = global.navigator.userAgent,
        isAndroid = userAgent.indexOf('Android') != -1
      isIOS = !isAndroid
    }
    var utils = {
      parseData: function (str) {
        var result
        if (str && typeof str === 'string') {
          try {
            result = JSON.parse(str)
          } catch (e) {
            result = {
              status: {
                code: 1,
                msg: 'PARAM_PARSE_ERROR'
              }
            }
          }
        } else {
          result = str || {}
        }
        return result
      }
    }
    var postMessage = function (event, paramsString, callbackId) {
        // postMessage
        if (isIOS) {
          global.webkit.messageHandlers.invokeHandler.postMessage({
            C: event,
            paramsString: paramsString,
            callbackId: callbackId
          })
        } else {
          var jsCoreHandleResult = HeraJSCore.invokeHandler(
            event,
            paramsString,
            callbackId
          )
          if (
            typeof jsCoreHandleResult !== 'undefined' &&
            typeof callbacks[callbackId] === 'function' &&
            jsCoreHandleResult !== ''
          ) {
            try {
              jsCoreHandleResult = JSON.parse(jsCoreHandleResult)
            } catch (e) {
              jsCoreHandleResult = {}
            }
            callbacks[callbackId](jsCoreHandleResult),
              delete callbacks[callbackId]
          }
        }
      },
      createIframe = function (uri, sid) {
        var iframe = document.createElement('iframe'),
          iframeId = IFRAME_PREFIX + sid
        iframe.style.display = 'none'
        iframe.setAttribute('id', iframeId)
        iframe.setAttribute('frameborder', '0')
        iframe.setAttribute('src', uri)
        document.documentElement.appendChild(iframe)
        // this.messageIframe = messageIframe
      },
      retrieveIframe = function (sid) {
        var iframeId = IFRAME_PREFIX + sid,
          iframe = document.querySelector('#' + iframeId)
        if (iframe) {
          document.documentElement.removeChild(iframe)
        }
      },
      publishHandler = function (event, paramsString, webviewIds) {
        // publishHandler
        isIOS
          ? global.webkit.messageHandlers.publishHandler.postMessage({
            event: event,
            paramsString: paramsString,
            webviewIds: webviewIds
          })
          : HeraJSCore.publishHandler(event, paramsString, webviewIds)
      },
      invoke = function (event, params, callback) {
        // postMessage
        var paramsString = JSON.stringify(params || {}),
          callbackId = ++callbackIndex
        // reportLog(event,params,'','invoke');
        callbacks[callbackId] = callback
        postMessage(event, paramsString, callbackId)
      },
      invokeCallbackHandler = function (callbackId, params) {
        var callback = callbacks[callbackId]
        // reportLog('invokeCallbackHandler:'+callbackId,params,'','api2app2service_get');
        typeof callback === 'function' && callback(params),
          delete callbacks[callbackId]
        if (isIOS) retrieveIframe(callbackId)
      },
      oldCallbackHandler = function (data) {
        // {"bridgeParam":{"action":"call","callbackID":"1468927578039","status":{"status_code":-5,"status_reason":"'module' or 'identifier' is unsupported."}}}
        if (data) {
          if (typeof data === 'string') {
            data = utils.parseData(data)
          }
          var callbackId = data.bridgeParam.callbackID
          // 延迟是为了避免：
          // 在 ios 中，如果 onComplete 回调中有 alert 等有阻塞作用的代码时，会导致页面“卡死”（Native UI层级覆盖导致点击无效）
          if (callbackId) {
            setTimeout(function () {
              invokeCallbackHandler(callbackId, data.param)
            }, 1)
          }
        }
      },
      publishCallbackHandler = function (callbackId) {
        if (isIOS) retrieveIframe(callbackId)
      },
      on = function (eventName, handler) {
        defaultEventHandlers[eventName] = handler
      },
      publish = function (eventName, params, webviewIds) {
        // publishHandler
        webviewIds = webviewIds || []
        var paramsString,
          event = eventPrefix + eventName

        paramsString = JSON.stringify(params)
        webviewIds = JSON.stringify(webviewIds)
        publishHandler(event, paramsString, webviewIds)
      },
      subscribe = function (eventName, handler) {
        handlers[eventPrefix + eventName] = handler
      },
      subscribeHandler = function (eventName, data, webviewId, reportParams) {
        // 执行注册的回调
        var handler
        // reportLog('subscribeHandler:'+eventName,data,[webviewId||''],'app2view_get');
        ;(handler =
          eventName.indexOf(eventPrefix) != -1
            ? handlers[eventName]
            : defaultEventHandlers[eventName]),
          typeof handler === 'function' &&
            handler(data, webviewId, reportParams)
      }
    global.ServiceJSBridge = {
      invoke: invoke,
      invokeCallbackHandler: invokeCallbackHandler,
      oldCallbackHandler: oldCallbackHandler,
      publishCallbackHandler: publishCallbackHandler,
      on: on,
      publish: publish,
      subscribe: subscribe,
      subscribeHandler: subscribeHandler
    }
  }
})(window)
