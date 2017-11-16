import bridge from './bridge'
import utils from './utils'
import Animation from './Animation'
import createAudio from './createAudio'
import createVideo from './createVideo'
import map from './map'

import configFlags from './configFlags'
import context from './context'
import canvas from './canvas'
import appContextSwitch from './appContextSwitch'

import './evalGeneratorFunction'
import './funcRewrite'
import './initConsole'

function addGetterForWX (apiKey) {
  WX.__defineGetter__(apiKey, function () {
    return utils.surroundByTryCatchFactory(apiObj[apiKey], 'wd.' + apiKey)
  })
}

function paramCheck (apiName, params, paramTpl) {
  var res = utils.paramCheck(params, paramTpl)
  return (
    !res ||
    (logErr(apiName, params, apiName + ':fail parameter error: ' + res), !1)
  )
}

function paramCheckFail (apiName) {
  var res = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
    n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : '',
    errMsg = apiName + ':fail ' + n
  console.error(errMsg)
  var fail = Reporter.surroundThirdByTryCatch(
      options.fail || emptyFn,
      'at api ' + apiName + ' fail callback function'
    ),
    complete = Reporter.surroundThirdByTryCatch(
      options.complete || emptyFn,
      'at api ' + apiName + ' complete callback function'
    )
  fail({
    errMsg: errMsg
  })
  complete({
    errMsg: errMsg
  })
}

function checkUrl (apiName, params) {
  // 判断当前页面是否在app.json里
  var matchArr = /^(.*)\.html/gi.exec(params.url)
  return (
    !matchArr ||
    __wxConfig__.pages.indexOf(matchArr[1]) !== -1 ||
    (logErr(apiName, params, apiName + ':fail url not in app.json'), !1)
  )
}

typeof logxx === 'function' && logxx('sdk start')

var emptyFn = function () {},
  pageData = {},
  currUrl = '',
  SDKVersion = '1.4.2',
  appRouteCallbacks = [],
  appRouteDoneCallback = [],
  pageEventFn = void 0,
  WX = {},
  hasInvokeEnableAccelerometer = !1,
  hasInvokeEnableCompass = !1,
  accelerometerChangeFns = [],
  compassChangeFns = [],
  refreshSessionTimeHander = void 0,
  curWebViewId = void 0,
  currentClipBoardData = void 0,
  loginSourceUrl = ''

bridge.subscribe('SPECIAL_PAGE_EVENT', function (params) {
  var data = params.data,
    eventName = params.eventName,
    ext = params.ext,
    webViewId =
      arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0
  if (data && data.type == 'input' && typeof pageEventFn === 'function') {
    var res = pageEventFn({
        data: data,
        eventName: eventName,
        webviewId: webViewId
      }),
      value = data.detail.value
    if (ext && ext.setKeyboardValue) {
      if (res === undefined) {
      } else if (utils.getDataType(res) === 'Object') {
        var params = {}
        value != res.value && (params.value = res.value + '')
        isNaN(parseInt(res.cursor)) || (params.cursor = parseInt(res.cursor))
        bridge.publish('setKeyboardValue', params, [webViewId])
      } else {
        value != res &&
          bridge.publish(
            'setKeyboardValue',
            {
              value: res + '',
              cursor: -1
            },
            [webViewId]
          )
      }
    }
  }
})

var logErr = function (apiName) {
  var options =
      arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
    errMsg = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : ''
  console.error(errMsg)
  Reporter.triggerErrorMessage(errMsg)
  var fail = Reporter.surroundThirdByTryCatch(
      options.fail || emptyFn,
      'at api ' + apiName + ' fail callback function'
    ),
    complete = Reporter.surroundThirdByTryCatch(
      options.complete || emptyFn,
      'at api ' + apiName + ' complete callback function'
    )
  fail({
    errMsg: errMsg
  })
  complete({
    errMsg: errMsg
  })
}

var apiObj = {
  // wx对象
  invoke: bridge.invoke,
  on: bridge.on,
  drawCanvas: canvas.drawCanvas,
  createContext: canvas.createContext,
  createCanvasContext: canvas.createCanvasContext,
  canvasToTempFilePath: canvas.canvasToTempFilePath,
  reportIDKey: function (e, t) {},
  reportKeyValue: function (e, t) {},
  onPullDownRefresh: function (e) {
    console.log('onPullDownRefresh has been removed from api list')
  },
  setNavigationBarColor: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    if (
      paramCheck('setNavigationBarColor', params, {
        frontColor: '',
        backgroundColor: ''
      })
    ) {
      if (['#ffffff', '#000000'].indexOf(params.frontColor) === -1) {
        logErr(
          'setNavigationBarColor',
          params,
          'invalid frontColor "' + params.frontColor + '"'
        )
      }

      params.frontColor === '#ffffff'
        ? bridge.invokeMethod('setStatusBarStyle', {
          color: 'white'
        })
        : params.frontColor === '#000000' &&
          bridge.invokeMethod('setStatusBarStyle', {
            color: 'black'
          })

      var t = Object.assign({}, params)
      delete t.alpha
      bridge.invokeMethod('setNavigationBarColor', t)
    }
  },
  setNavigationBarTitle: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    paramCheck('setNavigationBarTitle', params, {
      title: ''
    }) && bridge.invokeMethod('setNavigationBarTitle', params)
  },
  showNavigationBarLoading: function (e) {
    bridge.invokeMethod('showNavigationBarLoading', e)
  },
  hideNavigationBarLoading: function (e) {
    bridge.invokeMethod('hideNavigationBarLoading', e)
  },
  stopPullDownRefresh: function (e) {
    bridge.invokeMethod('stopPullDownRefresh', e)
  },
  redirectTo: function (params) {
    arguments.length > 1 && void 0 !== arguments[1] && arguments[1]
    if (paramCheck('redirectTo', params, { url: '' })) {
      params.url = utils.getRealRoute(currUrl, params.url)
      params.url = utils.encodeUrlQuery(params.url)
      checkUrl('redirectTo', params) &&
        bridge.invokeMethod('redirectTo', params, {
          afterSuccess: function () {
            currUrl = params.url
          }
        })
    }
  },
  // 关闭所有页面，打开到应用内的某个页面
  reLaunch: function (params) {
    arguments.length > 1 && void 0 !== arguments[1] && arguments[1]
    if (utils.defaultRunningStatus != 'active') {
      return paramCheckFail(
        'reLaunch',
        params,
        'can not invoke reLaunch in background'
      )
    }
    if (paramCheck('reLaunch', params, { url: '' })) {
      params.url = utils.getRealRoute(currUrl, params.url)
      params.url = utils.encodeUrlQuery(params.url)
      checkUrl('reLaunch', params) &&
        bridge.invokeMethod('reLaunch', params, {
          afterSuccess: function () {
            currUrl = params.url
          },
          afterFail: function () {
            console.log('failed')
          }
        })
    }
  },
  createSelectorQuery: function (e) {
    // 返回一个SelectorQuery对象实例
    var t = null
    if (e && e.page) {
      t.e.page__wxWebViewId__
    } else {
      var n = getCurrentPages()
      t = n[n.length - 1].__wxWebviewId__
    }
    console.log(111)
    return new utils.wxQuerySelector(t)
  },

  pageScrollTo: function (param) {
    // 将页面滚动到目标位置
    var target = getCurrentPages(),
      viewId = target[target.length - 1].__wxWebviewId__
    if (
      param.hasOwnProperty('page') &&
      param.page.hasOwnProperty('__wxWebviewId__')
    ) {
      viewId = param.page.__wxWebviewId__
    }

    bridge.invokeMethod('pageScrollTo', param, [viewId])
  },

  navigateTo: function (params) {
    arguments.length > 1 && void 0 !== arguments[1] && arguments[1]
    if (paramCheck('navigateTo', params, { url: '' })) {
      params.url = utils.getRealRoute(currUrl, params.url)
      params.url = utils.encodeUrlQuery(params.url)
      checkUrl('navigateTo', params) &&
        bridge.invokeMethod('navigateTo', params, {
          afterSuccess: function () {
            currUrl = params.url
            context.notifyCurrentRoutetoContext(currUrl)
          }
        })
    }
  },
  switchTab: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    if (paramCheck('switchTab', params, { url: '' })) {
      ;/\?.*$/.test(params.url) &&
        (console.warn('wd.switchTab: url 不支持 queryString'),
        (params.url = params.url.replace(/\?.*$/, '')))
      params.url = utils.getRealRoute(currUrl, params.url)
      params.url = utils.encodeUrlQuery(params.url)
      checkUrl('switchTab', params) &&
        bridge.invokeMethod('switchTab', params, {
          afterSuccess: function () {
            currUrl = params.url
            context.notifyCurrentRoutetoContext(currUrl)
          }
        })
    }
  },
  navigateBack: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    typeof params.delta !== 'number'
      ? (params.delta = 1)
      : ((params.delta = parseInt(params.delta)),
        params.delta < 1 && (params.delta = 1))
    bridge.invokeMethod('navigateBack', params)
  },
  getStorage: function (params) {
    if (paramCheck('getStorage', params, { key: '' })) {
      bridge.invokeMethod('getStorage', params, {
        beforeSuccess: function (res) {
          res.data = utils.stringToAnyType(res.data, res.dataType)
          delete res.dataType
        },
        afterFail: function () {
          var res =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
          if (res.errMsg && res.errMsg.indexOf('data not found') > 0) return !1
        }
      })
    }
  },
  getStorageSync: function (key) {
    if (paramCheck('getStorageSync', key, '')) {
      var rt
      bridge.invokeMethod(
        'getStorageSync',
        { key: key },
        {
          beforeAll: function (res) {
            res = res || {}
            rt = utils.stringToAnyType(res.data, res.dataType)
          },
          afterFail: function () {
            var res =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : {}
            if (res.errMsg && res.errMsg.indexOf('data not found') > 0) { return !1 }
          }
        }
      )
      return rt
    }
  },
  setStorage: function (params) {
    if (paramCheck('setStorage', params, { key: '' })) {
      try {
        var opt = utils.anyTypeToString(params.data),
          data = opt.data,
          dataType = opt.dataType
        bridge.invokeMethod('setStorage', {
          key: params.key,
          data: data,
          dataType: dataType,
          success: params.success,
          fail: params.fail,
          complete: params.complete
        })
      } catch (e) {
        typeof params.fail === 'function' &&
          params.fail({
            errMsg: 'setStorage:fail ' + e.message
          }),
          typeof params.complete === 'function' &&
            params.complete({
              errMsg: 'setStorage:fail ' + e.message
            })
      }
    }
  },
  setStorageSync: function (key, value) {
    value = value || ''
    if (paramCheck('setStorageSync', key, '')) {
      var dataObj = utils.anyTypeToString(value),
        data = dataObj.data,
        dataType = dataObj.dataType
      bridge.invokeMethod('setStorageSync', {
        key: key,
        data: data,
        dataType: dataType
      })
    }
  },
  removeStorage: function (params) {
    paramCheck('removeStorage', params, { key: '' }) &&
      bridge.invokeMethod('removeStorage', params)
  },
  removeStorageSync: function (key) {
    paramCheck('removeStorageSync', key, '') &&
      bridge.invokeMethod('removeStorageSync', { key: key })
  },
  clearStorage: function () {
    bridge.invokeMethod('clearStorage')
  },
  clearStorageSync: function () {
    bridge.invokeMethod('clearStorageSync')
  },
  getStorageInfo: function (params) {
    bridge.invokeMethod('getStorageInfo', params)
  },
  getStorageInfoSync: function () {
    var rt = void 0
    bridge.invokeMethod(
      'getStorageInfoSync',
      {},
      {
        beforeAll: function (t) {
          rt = t
          delete t.errMsg
        }
      }
    )
    return rt
  },
  request: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    if (paramCheck('request', params, { url: '' })) {
      if (utils.validateUrl(params.url) === !1) {
        return logErr(
          'request',
          params,
          'request:fail invalid url "' + params.url + '"'
        )
      }
      if (params.data === 'function') {
        return logErr(
          'request',
          params,
          'request:fail data should not be Function'
        )
      }
      var headerType = utils.getDataType(params.header)
      params.header = params.header || {}
      params.header = utils.convertObjectValueToString(params.header)
      headerType !== 'Undefined' &&
        headerType !== 'Object' &&
        (console.warn('wd.request: header must be an object'),
        (params.header = {}))
      params.header = Object.keys(params.header).reduce(function (res, cur) {
        cur.toLowerCase() === 'content-type'
          ? (res[cur.toLowerCase()] = params.header[cur])
          : (res[cur] = params.header[cur])
        return res
      }, {})
      params.method && (params.method = params.method.toUpperCase())
      var headers = params.header || {},
        requestMethod = 'GET'
      typeof params.method === 'string' &&
        (requestMethod = params.method.toUpperCase())
      var data
      params.dataType = params.dataType || 'json'
      headers['content-type'] = headers['content-type'] || 'application/json'
      data = !params.data
        ? ''
        : typeof params.data !== 'string'
          ? headers['content-type'].indexOf(
              'application/x-www-form-urlencoded'
            ) > -1
            ? utils.urlEncodeFormData(params.data, !0)
            : headers['content-type'].indexOf('application/json') > -1
              ? JSON.stringify(params.data)
              : typeof params.data === 'object'
                ? JSON.stringify(params.data)
                : data.toString()
          : params.data
      requestMethod == 'GET' &&
        (params.url = utils.addQueryStringToUrl(params.url, params.data))
      bridge.invokeMethod(
        'request',
        {
          url: params.url,
          data: data,
          header: headers,
          method: requestMethod,
          success: params.success,
          fail: params.fail,
          complete: params.complete
        },
        {
          beforeSuccess: function (res) {
            if (params.dataType === 'json') {
              try {
                res.data = JSON.parse(res.data)
              } catch (e) {}
            }
            res.statusCode = parseInt(res.statusCode)
          }
        }
      )
    }
  },
  connectSocket: function (params) {
    if (paramCheck('connectSocket', params, { url: '' })) {
      typeof params.header !== 'object' &&
        typeof params.header !== 'undefined' &&
        (console.warn('connectSocket: header must be an object'),
        delete params.header)
      var header = {}
      params.header &&
        (header = utils.convertObjectValueToString(params.header))

      bridge.invokeMethod(
        'connectSocket',
        utils.assign({}, params, {
          header: header
        }),
        {
          beforeSuccess: function (e) {
            e.statusCode = parseInt(e.statusCode)
          }
        }
      )
    }
  },
  closeSocket: function (e) {
    bridge.invokeMethod('closeSocket', e)
  },
  sendSocketMessage: function (params) {
    var paramType = utils.getDataType(params.data)
    utils.getPlatform() === 'devtools'
      ? bridge.invokeMethod('sendSocketMessage', params)
      : paramType === 'String'
        ? bridge.invokeMethod('sendSocketMessage', params)
        : paramType === 'ArrayBuffer' &&
          bridge.invokeMethod(
            'sendSocketMessage',
            utils.assign(params, {
              data: utils.arrayBufferToBase64(params.data),
              isBuffer: !0
            })
          )
  },
  onSocketOpen: function (callback) {
    paramCheck('onSocketOpen', callback, emptyFn) &&
      bridge.onMethod(
        'onSocketOpen',
        Reporter.surroundThirdByTryCatch(
          callback,
          'at onSocketOpen callback function'
        )
      )
  },
  onSocketClose: function (callback) {
    paramCheck('onSocketClose', callback, emptyFn) &&
      bridge.onMethod(
        'onSocketClose',
        Reporter.surroundThirdByTryCatch(
          callback,
          'at onSocketClose callback function'
        )
      )
  },
  onSocketMessage: function (callback) {
    if (paramCheck('onSocketMessage', callback, emptyFn)) {
      callback = Reporter.surroundThirdByTryCatch(
        callback,
        'at onSocketMessage callback function'
      )
      bridge.onMethod('onSocketMessage', function (params) {
        utils.getPlatform() !== 'devtools' &&
          params.isBuffer === !0 &&
          (params.data = utils.base64ToArrayBuffer(params.data))
        delete params.isBuffer
        utils.getPlatform() === 'devtools' &&
        utils.getDataType(params.data) === 'Blob'
          ? utils.blobToArrayBuffer(params.data, function (data) {
            ;(params.data = data), callback(params)
          })
          : callback(params)
      })
    }
  },
  onSocketError: function (callback) {
    bridge.onMethod(
      'onSocketError',
      Reporter.surroundThirdByTryCatch(
        callback,
        'at onSocketError callback function'
      )
    )
  },
  uploadFile: function (params) {
    if (paramCheck('uploadFile', params, { url: '', filePath: '', name: '' })) {
      typeof params.header !== 'object' &&
        typeof params.header !== 'undefined' &&
        (console.warn('uploadFile: header must be an object'),
        delete params.header),
        typeof params.formData !== 'object' &&
          typeof params.formData !== 'undefined' &&
          (console.warn('uploadFile: formData must be an object'),
          delete params.formData)
      var header = {},
        formData = {}
      params.header &&
        (header = utils.convertObjectValueToString(params.header))
      params.formData &&
        (formData = utils.convertObjectValueToString(params.formData))
      bridge.invokeMethod(
        'uploadFile',
        utils.assign({}, params, {
          header: header,
          formData: formData
        }),
        {
          beforeSuccess: function (res) {
            res.statusCode = parseInt(res.statusCode)
          }
        }
      )
    }
  },
  downloadFile: function (params) {
    paramCheck('downloadFile', params, { url: '' }) &&
      bridge.invokeMethod('downloadFile', params, {
        beforeSuccess: function (res) {
          res.statusCode = parseInt(res.statusCode)
          var statusArr = [200, 304]
          statusArr.indexOf(res.statusCode) === -1 && delete res.tempFilePath
        }
      })
  },
  chooseImage: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    bridge.invokeMethod(
      'chooseImage',
      utils.assign(
        {
          count: 9,
          sizeType: ['original', 'compressed'],
          sourceType: ['album', 'camera']
        },
        params
      )
    )
  },
  previewImage: function (params) {
    paramCheck('previewImage', params, { urls: [''] }) &&
      bridge.invokeMethod('previewImage', params)
  },
  getImageInfo: function (params) {
    paramCheck('getImageInfo', params, { src: '' }) &&
      (/^(http|https):\/\//.test(params.src)
        ? bridge.invokeMethod(
            'downloadFile',
            { url: params.src },
          {
            afterSuccess: function (res) {
              params.src = res.tempFilePath
              bridge.invokeMethod('getImageInfo', params, {
                beforeSuccess: function (rt) {
                  rt.path = params.src
                }
              })
            },
            afterFail: function () {
              logErr(
                  'getImageInfo',
                  params,
                  'getImageInfo:fail download image fail'
                )
            }
          }
          )
        : /^wdfile:\/\//.test(params.src)
          ? bridge.invokeMethod('getImageInfo', params, {
            beforeSuccess: function (rt) {
              rt.path = params.src
            }
          })
          : ((params.src = utils.getRealRoute(currUrl, params.src, !1)),
            bridge.invokeMethod('getImageInfo', params, {
              beforeSuccess: function (rt) {
                rt.path = params.src
              }
            })))
  },
  startRecord: function (params) {
    ;(apiObj.appStatus === configFlags.AppStatus.BACK_GROUND &&
      apiObj.hanged === !1) ||
      bridge.invokeMethod('startRecord', params)
  },
  stopRecord: function (params) {
    bridge.invokeMethod('stopRecord', params)
  },
  playVoice: function (params) {
    paramCheck('playVoice', params, { filePath: '' }) &&
      bridge.invokeMethod('playVoice', params)
  },
  pauseVoice: function (e) {
    bridge.invokeMethod('pauseVoice', e)
  },
  stopVoice: function (e) {
    bridge.invokeMethod('stopVoice', e)
  },
  onVoicePlayEnd: function (callback) {
    bridge.onMethod(
      'onVoicePlayEnd',
      Reporter.surroundThirdByTryCatch(
        callback,
        'at onVoicePlayEnd callback function'
      )
    )
  },
  chooseVideo: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    params.sourceType = params.sourceType || ['album', 'camera']
    params.camera = params.camera || ['front', 'back']
    bridge.invokeMethod('chooseVideo', params)
  },
  getLocation: function (params) {
    console.log('getLocation', params, apiObj.appStatus, apiObj.hanged)

    ;(apiObj.appStatus === configFlags.AppStatus.BACK_GROUND &&
      apiObj.hanged === !1) ||
      bridge.invokeMethod('getLocation', params)
  },
  openLocation: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    paramCheck('openLocation', params, { latitude: 0.1, longitude: 0.1 }) &&
      bridge.invokeMethod('openLocation', params)
  },
  chooseLocation: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    bridge.invokeMethod('chooseLocation', params)
  },
  getNetworkType: function (params) {
    bridge.invokeMethod('getNetworkType', params)
  },
  getSystemInfo: function (params) {
    var platform = utils.getPlatform()
    bridge.invokeMethod('getSystemInfo', params, {
      beforeSuccess: function (rt) {
        rt.platform = platform
      }
    })
  },
  getSystemInfoSync: function (params) {
    var rt = {},
      platform = utils.getPlatform()
    bridge.invokeMethod(
      'getSystemInfo',
      {},
      {
        beforeSuccess: function (res) {
          rt = res || {}
          rt.platform = platform
          delete rt.errMsg
        }
      }
    )
    return rt
  },
  onAccelerometerChange: function (callback) {
    hasInvokeEnableAccelerometer ||
      (bridge.invokeMethod('enableAccelerometer', { enable: !0 }),
      (hasInvokeEnableAccelerometer = !0))
    accelerometerChangeFns.push(
      Reporter.surroundThirdByTryCatch(
        callback,
        'at onAccelerometerChange callback function'
      )
    )
  },
  onCompassChange: function (callback) {
    hasInvokeEnableCompass ||
      (bridge.invokeMethod('enableCompass', { enable: !0 }),
      (hasInvokeEnableCompass = !0))
    compassChangeFns.push(
      Reporter.surroundThirdByTryCatch(
        callback,
        'at onCompassChange callback function'
      )
    )
  },
  reportAction: function (params) {
    bridge.invokeMethod('reportAction', params)
  },
  getBackgroundAudioPlayerState: function (params) {
    bridge.invokeMethod('getMusicPlayerState', params, {
      beforeAll: function (res) {
        res.errMsg = res.errMsg.replace(
          'getBackgroundAudioPlayerState',
          'getMusicPlayerState'
        )
      }
    })
  },
  playBackgroundAudio: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    ;(apiObj.appStatus === configFlags.AppStatus.BACK_GROUND &&
      apiObj.hanged === !1) ||
      bridge.invokeMethod(
        'operateMusicPlayer',
        utils.assign({ operationType: 'play' }, params),
        {
          beforeAll: function (res) {
            res.errMsg = res.errMsg.replace(
              'operateMusicPlayer',
              'playBackgroundAudio'
            )
          }
        }
      )
  },
  pauseBackgroundAudio: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    bridge.invokeMethod(
      'operateMusicPlayer',
      utils.assign({ operationType: 'pause' }, params),
      {
        beforeAll: function (res) {
          res.errMsg = res.errMsg.replace(
            'operateMusicPlayer',
            'pauseBackgroundAudio'
          )
        }
      }
    )
  },
  seekBackgroundAudio: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    paramCheck('seekBackgroundAudio', params, { position: 1 }) &&
      bridge.invokeMethod(
        'operateMusicPlayer',
        utils.assign({ operationType: 'seek' }, params),
        {
          beforeAll: function (res) {
            res.errMsg = res.errMsg.replace(
              'operateMusicPlayer',
              'seekBackgroundAudio'
            )
          }
        }
      )
  },
  stopBackgroundAudio: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    console.log('stopBackgroundAudio')
    bridge.invokeMethod(
      'operateMusicPlayer',
      utils.assign({ operationType: 'stop' }, params),
      {
        beforeAll: function (res) {
          res.errMsg = res.errMsg.replace(
            'operateMusicPlayer',
            'stopBackgroundAudio'
          )
        }
      }
    )
  },
  onBackgroundAudioPlay: function (callback) {
    bridge.onMethod(
      'onMusicPlay',
      Reporter.surroundThirdByTryCatch(
        callback,
        'at onBackgroundAudioPlay callback function'
      )
    )
  },
  onBackgroundAudioPause: function (callback) {
    bridge.onMethod(
      'onMusicPause',
      Reporter.surroundThirdByTryCatch(
        callback,
        'at onBackgroundAudioPause callback function'
      )
    )
  },
  onBackgroundAudioStop: function (callback) {
    bridge.onMethod(
      'onMusicEnd',
      Reporter.surroundThirdByTryCatch(
        callback,
        'at onBackgroundAudioStop callback function'
      )
    )
  },
  login: function (params) {
    if (__wxConfig__ && __wxConfig__.weweb && __wxConfig__.weweb.loginUrl) {
      // 引导到自定义的登录页面
      if (__wxConfig__.weweb.loginUrl.indexOf('/') != 0) {
        __wxConfig__.weweb.loginUrl = '/' + __wxConfig__.weweb.loginUrl
      }
      var curPages = getCurrentPages()

      loginSourceUrl = curPages[curPages.length - 1].__route__
      apiObj.redirectTo({
        url: __wxConfig__.weweb.loginUrl
      })
    } else {
      bridge.invokeMethod('login', params)
    }
  },
  loginSuccess: function () {
    const url =
      (loginSourceUrl &&
        (loginSourceUrl.indexOf('/') === 0
          ? loginSourceUrl
          : '/' + loginSourceUrl)) ||
      '/' + __root__
    loginSourceUrl = ''
    apiObj.redirectTo({
      url: url
    })
  },
  checkLogin: function (params) {
    bridge.invokeMethod('checkLogin', params)
  },
  checkSession: function (params) {
    refreshSessionTimeHander && clearTimeout(refreshSessionTimeHander)
    bridge.invokeMethod('refreshSession', params, {
      beforeSuccess: function (res) {
        refreshSessionTimeHander = setTimeout(function () {
          bridge.invokeMethod('refreshSession')
        }, 1e3 * res.expireIn)
        delete res.err_code
        delete res.expireIn
      },
      beforeAll: function (res) {
        res.errMsg = res.errMsg.replace('refreshSession', 'checkSession')
      }
    })
  },
  authorize: function (params) {
    bridge.invokeMethod('authorize', params)
  },
  getUserInfo: function (params) {
    bridge.invokeMethod(
      'operateWXData',
      utils.assign(
        {
          data: {
            api_name: 'webapi_getuserinfo',
            data: params.data || {}
          }
        },
        params
      ),
      {
        beforeAll: function (res) {
          res.errMsg = res.errMsg.replace('operateWXData', 'getUserInfo')
        },
        beforeSuccess: function (res) {
          // "android" ===  utils.getPlatform() && (res.data = JSON.parse(res.data))
          res.rawData = res.data.data
          try {
            res.userInfo = JSON.parse(res.data.data)
            res.signature = res.data.signature
            res.data.encryptData &&
              (console.group(new Date() + ' encryptData 字段即将废除'),
              console.warn(
                '请使用 encryptedData 和 iv 字段进行解密，详见：https://mp.weixin.qq.com/debug/wxadoc/dev/api/open.html'
              ),
              console.groupEnd(),
              (res.encryptData = res.data.encryptData))
            res.data.encryptedData &&
              ((res.encryptedData = res.data.encryptedData),
              (res.iv = res.data.iv))
            delete res.data
          } catch (e) {}
        }
      }
    )
  },
  getFriends: function (params) {
    bridge.invokeMethod(
      'operateWXData',
      {
        data: {
          api_name: 'webapi_getfriends',
          data: params.data || {}
        },
        success: params.success,
        fail: params.fail,
        complete: params.complete
      },
      {
        beforeAll: function (res) {
          res.errMsg = res.errMsg.replace('operateWXData', 'getFriends')
        },
        beforeSuccess: function (res) {
          // "android" ===  utils.getPlatform() && (res.data = JSON.parse(res.data))
          res.rawData = res.data.data
          try {
            res.friends = JSON.parse(res.data.data)
            res.signature = res.data.signature
            delete res.data
          } catch (e) {}
        }
      }
    )
  },
  requestPayment: function (params) {
    paramCheck('requestPayment', params, {
      timeStamp: '',
      nonceStr: '',
      package: '',
      signType: '',
      paySign: ''
    }) && bridge.invokeMethod('requestPayment', params)
  },
  verifyPaymentPassword: function (params) {
    bridge.invokeMethod('verifyPaymentPassword', params)
  },
  bindPaymentCard: function (params) {
    bridge.invokeMethod('bindPaymentCard', params)
  },
  requestPaymentToBank: function (params) {
    bridge.invokeMethod('requestPaymentToBank', params)
  },
  addCard: function (params) {
    paramCheck('addCard', params, { cardList: [] }) &&
      bridge.invokeMethod('addCard', params)
  },
  openCard: function (params) {
    paramCheck('openCard', params, { cardList: [] }) &&
      bridge.invokeMethod('openCard', params)
  },
  scanCode: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    paramCheck('scanCode', params, {}) &&
      bridge.invokeMethod('scanCode', params, {
        beforeSuccess: function (res) {
          typeof res.path === 'string' &&
            ((res.path = res.path.replace(/\.html$/, '')),
            (res.path = res.path.replace(/\.html\?/, '?')))
        }
      })
  },
  openAddress: function (params) {
    bridge.invokeMethod('openAddress', params)
  },
  saveFile: function (params) {
    paramCheck('saveFile', params, { tempFilePath: '' }) &&
      bridge.invokeMethod('saveFile', params)
  },
  openDocument: function (params) {
    paramCheck('openDocument', params, { filePath: '' }) &&
      bridge.invokeMethod('openDocument', params)
  },
  chooseContact: function (params) {
    bridge.invokeMethod('chooseContact', params)
  },
  makePhoneCall: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    paramCheck('makePhoneCall', params, { phoneNumber: '' }) &&
      bridge.invokeMethod('makePhoneCall', params)
  },
  onAppRoute: function (params, t) {
    appRouteCallbacks.push(params)
  },
  onAppRouteDone: function (params, t) {
    appRouteDoneCallback.push(params)
  },
  onAppEnterBackground: function (params) {
    appContextSwitch.onAppEnterBackground.call(apiObj, params)
  },
  onAppEnterForeground: function (params) {
    appContextSwitch.onAppEnterForeground.call(apiObj, params)
  },
  onAppRunningStatusChange: function (params) {
    appContextSwitch.onAppRunningStatusChange.call(apiObj, params)
  },
  setAppData: function (data) {
    var options =
        arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
      webviewIds = arguments[2]
    arguments[3]
    options.forceUpdate =
      typeof options.forceUpdate !== 'undefined' && options.forceUpdate
    if (utils.isObject(data) === !1) {
      throw new utils.AppServiceSdkKnownError(
        'setAppData:data should be an object'
      )
    }
    !(function () {
      var hasUpdate = !1,
        tmpData = {},
        setCurData = function (key, value, type) {
          hasUpdate = !0
          tmpData[key] = value
          type === 'Array' || type === 'Object'
            ? (pageData[key] = JSON.parse(JSON.stringify(value)))
            : (pageData[key] = value)
        }
      for (var oKey in data) {
        var curValue = data[oKey],
          gValue = pageData[oKey],
          gValueType = utils.getDataType(gValue),
          curValueType = utils.getDataType(curValue)
        gValueType !== curValueType
          ? setCurData(oKey, curValue, curValueType)
          : gValueType == 'Array' || gValueType == 'Object'
            ? JSON.stringify(gValue) !== JSON.stringify(curValue) &&
              setCurData(oKey, curValue, curValueType)
            : gValueType == 'String' ||
              gValueType == 'Number' ||
              gValueType == 'Boolean'
              ? gValue.toString() !== curValue.toString() &&
                setCurData(oKey, curValue, curValueType)
              : gValueType == 'Date'
                ? gValue.getTime().toString() !==
                    curValue.getTime().toString() &&
                  setCurData(oKey, curValue, curValueType)
                : gValue !== curValue &&
                  setCurData(oKey, curValue, curValueType)
      }
      options.forceUpdate
        ? bridge.publish(
            'appDataChange',
          {
            data: data,
            option: {
              timestamp: Date.now(),
              forceUpdate: !0
            }
          },
            webviewIds
          )
        : hasUpdate &&
          bridge.publish(
            'appDataChange',
            {
              data: tmpData
            },
            webviewIds
          )
    })()
  },
  onPageEvent: function (e, t) {
    console.warn("'onPageEvent' is deprecated, use 'Page[eventName]'")
  },
  createAnimation: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    if (paramCheck('createAnimation', params, {})) return new Animation(params)
  },
  createAudioContext: function (e) {
    return createAudio.call(apiObj, e, curWebViewId)
  },
  createVideoContext: function (e) {
    return createVideo.call(apiObj, e, curWebViewId)
  },
  createMapContext: function (e) {
    return new map.MapContext(e)
  },
  onWebviewEvent: function (fn, t) {
    pageEventFn = fn
    bridge.subscribe('PAGE_EVENT', function (params) {
      var data = params.data,
        eventName = params.eventName,
        webviewId =
          arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0
      fn({
        data: data,
        eventName: eventName,
        webviewId: webviewId
      })
    })
  },
  onNativeEvent: function (fn) {
    ;[
      'onCanvasTouchStart',
      'onCanvasTouchMove',
      'onCanvasTouchEnd'
    ].forEach(function (key) {
      bridge.onMethod(key, function (data, webviewId) {
        fn({
          data: data,
          eventName: key,
          webviewId: webviewId
        })
      })
    })
  },
  hideKeyboard: function (params) {
    bridge.publish('hideKeyboard', {}) // "devtools" ==  utils.getPlatform() ? bridge.publish("hideKeyboard", {}) :  bridge.invokeMethod("hideKeyboard", params)
  },
  getPublicLibVersion: function () {
    var rt
    bridge.invokeMethod('getPublicLibVersion', {
      complete: function (res) {
        res.version ? (rt = res.version) : ((rt = res), delete rt.errMsg)
      }
    })
    return rt
  },
  showModal: function () {
    var params =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
      options = {
        title: '',
        content: '',
        confirmText: '确定',
        cancelText: '取消',
        showCancel: !0,
        confirmColor: '#3CC51F',
        cancelColor: '#000000'
      }
    options = utils.extend(options, params)
    if (
      paramCheck('showModal', options, {
        title: '',
        content: '',
        confirmText: '',
        cancelText: '',
        confirmColor: '',
        cancelColor: ''
      })
    ) {
      return options.confirmText.length > 4
        ? void logErr(
            'showModal',
            params,
            'showModal:fail confirmText length should not large then 4'
          )
        : options.cancelText.length > 4
          ? void logErr(
              'showModal',
              params,
              'showModal:fail cancelText length should not large then 4'
            )
          : bridge.invokeMethod('showModal', options, {
            beforeSuccess: function (rt) {
              rt.confirm = Boolean(rt.confirm)
            }
          })
    }
  },
  showToast: function () {
    var params =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
      options = {
        duration: 1500,
        title: '',
        icon: 'success',
        mask: !1
      }
    options = utils.extend(options, params)
    delete options.image
    ;['success', 'loading'].indexOf(options.icon) < 0 &&
      (options.icon = 'success')
    options.duration > 1e4 && (options.duration = 1e4)
    paramCheck('showToast', options, {
      duration: 1,
      title: '',
      icon: ''
    }) && bridge.invokeMethod('showToast', options)
  },
  hideToast: function (e) {
    bridge.invokeMethod('hideToast', e)
  },
  showLoading: function () {
    var params =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
      defaultArgs = { title: '', icon: 'loading', mask: !1, duration: 1e8 }
    defaultArgs = utils.extend(defaultArgs, params)
    params.image &&
      (defaultArgs.image = utils.getRealRoute(currUrl, params.image, !1))
    paramCheck('showLoading', defaultArgs, {
      duration: 1,
      title: ''
    }) &&
      bridge.invokeMethod('showToast', defaultArgs, {
        beforeAll: function (res) {
          res.errMsg = res.errMsg.replace('showToast', 'showLoading')
        }
      })
  },
  hideLoading: function (args) {
    bridge.invokeMethod('hideToast', args, {
      beforeAll: function (res) {
        res.errMsg = res.errMsg.replace('hideToast', 'hideLoading')
      }
    })
  },
  showActionSheet: function () {
    var params =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
      options = {
        itemList: [],
        itemColor: '#000000'
      }
    options = utils.extend(options, params)
    options.cancelText = '取消'
    options.cancelColor = '#000000'
    if (
      paramCheck('showActionSheet', options, { itemList: ['1'], itemColor: '' })
    ) {
      return params.itemList.length > 6
        ? void logErr(
            'showActionSheet',
            params,
            'showActionSheet:fail parameter error: itemList should not be large than 6'
          )
        : bridge.invokeMethod('showActionSheet', options, {
          beforeCancel: function (t) {
            try {
              typeof params.success === 'function' &&
                  params.success({
                    errMsg: 'showActionSheet:ok',
                    cancel: !0
                  })
            } catch (e) {
              Reporter.thirdErrorReport({
                error: e,
                extend: 'showActionSheet success callback error'
              })
            }
          }
        })
    }
  },
  getSavedFileList: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    bridge.invokeMethod('getSavedFileList', params)
  },
  getSavedFileInfo: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    paramCheck('getSavedFileInfo', params, { filePath: '' }) &&
      bridge.invokeMethod('getSavedFileInfo', params)
  },
  getFileInfo: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    if (bridge.beforeInvoke('getFileInfo', params, { filePath: '' })) {
      if (void 0 !== params.digestAlgorithm) {
        var res = utils.paramCheck(params, { digestAlgorithm: '' })
        if (res) {
          bridge.beforeInvokeFail(
            'getFileInfo',
            params,
            'parameter error: ' + res
          )
        }
        if (['md5', 'sha1'].indexOf(params.digestAlgorithm) === -1) {
          bridge.beforeInvokeFail(
            'getFileInfo',
            params,
            'parameter error: invalid digestAlgorithm "' +
              params.digestAlgorithm +
              '"'
          )
        }
      }
      bridge.invokeMethod('getFileInfo', params, {})
    }
  },
  removeSavedFile: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    paramCheck('removeSavedFile', params, { filePath: '' }) &&
      bridge.invokeMethod('removeSavedFile', params)
  },
  getExtConfig: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    setTimeout(function () {
      var res = {
        errMsg: 'getExtConfig: ok',
        extConfig: (0, apiObj.getExtConfigSync)()
      }
      typeof params.success === 'function' && params.success(res)
      typeof params.complete === 'function' && params.complete(res)
    }, 0)
  },
  getClipboardData: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    bridge.invokeMethod('getClipboardData', params, {})
    // bridge.invokeMethod("getClipboardData",params,{})
  },
  setClipboardData: function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    paramCheck('setClipboardData', params, { data: '' }) &&
      bridge.invokeMethod('setClipboardData', params, {
        beforeSuccess: function () {
          currentClipBoardData = params.data
          apiObj.reportClipBoardData(!0)
        }
      })
  },
  reportClipBoardData: function (param) {
    if (currentClipBoardData !== '') {
      var t =
          getCurrentPages().find(function (e) {
            return e.__wxWebviewId__ === curWebViewId
          }) || {},
        value = [
          currentClipBoardData,
          t.__route__,
          param ? 1 : 0,
          Object.keys(t.options)
            .map(function (e) {
              return (
                encodeURIComponent(e) + '=' + encodeURIComponent(t.options[e])
              )
            })
            .join('&')
        ]
          .map(encodeURIComponent)
          .join(',')
      Reporter.reportKeyValue({
        key: 'Clipboard',
        value: value,
        force: !0
      })
    }
  },
  getExtConfigSync: function () {
    if (!__wxConfig__.ext) return {}
    try {
      return JSON.parse(JSON.stringify(__wxConfig__.ext))
    } catch (e) {
      return {}
    }
  },
  chooseAddress: function (params) {
    bridge.invokeMethod('openAddress', params, {
      beforeSuccess: function (res) {
        utils.renameProperty(res, 'addressPostalCode', 'postalCode')
        utils.renameProperty(res, 'proviceFirstStageName', 'provinceName')
        utils.renameProperty(res, 'addressCitySecondStageName', 'cityName')
        utils.renameProperty(res, 'addressCountiesThirdStageName', 'countyName')
        utils.renameProperty(res, 'addressDetailInfo', 'detailInfo')
      },
      beforeAll: function (res) {
        res.errMsg = res.errMsg.replace('openAddress', 'chooseAddress')
        delete res.err_msg
      }
    })
  },
  canIuse: function () {
    var param1 =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : '',
      param2 =
        arguments.length > 1 && void 0 !== arguments[1]
          ? arguments[1]
          : SDKVersion
    if (typeof param1 !== 'string') {
      throw new utils.AppServiceSdkKnownError(
        'canIUse: schema should be an object'
      )
    }
    var params = param1.split('.')
    return utils.canIUse(utils.toArray(params), param2)
  },
  reportLog: function (name, data) {
    bridge.publish('H5_USER_LOG', { event: name, desc: data || '' })
  }
}

apiObj.onAppEnterBackground(function () {
  apiObj.getClipboardData({
    success: function (e) {
      e.data !== currentClipBoardData &&
        ((currentClipBoardData = e.data), apiObj.reportClipBoardData)(!1)
    }
  })
}),
  apiObj.onAppEnterForeground(),
  (apiObj.appStatus = configFlags.AppStatus.FORE_GROUND),
  (apiObj.hanged = !1),
  bridge.subscribe('INVOKE_METHOD', function (params, t) {
    var name = params.name,
      args = params.args
    apiObj[name](args, !0)
  }),
  bridge.subscribe('WEBVIEW_ERROR_MSG', function (params, t) {
    var msg = params.msg
    Reporter.triggerErrorMessage(msg)
  }),
  bridge.onMethod('onAppRoute', function (params) {
    var webviewId =
      arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0
    params.path = params.path.replace(/\.\w+(\?|$)/, '$1') // .substring(0, params.path.length - 5);
    params.webviewId = params.webviewId ? params.webviewId : webviewId
    currUrl = params.path
    if (params.openType !== 'appLaunch') {
      for (var n in params.query) {
        params.query[n] = decodeURIComponent(params.query[n])
      }
    }
    if (params.openType == 'navigateBack' || params.openType == 'redirectTo') {
      canvas.clearOldWebviewCanvas()
    }
    canvas.notifyWebviewIdtoCanvas(params.webviewId)
    map.notifyWebviewIdtoMap(params.webviewId)
    curWebViewId = params.webviewId
    appRouteCallbacks.forEach(function (callback) {
      callback(params)
    })
  }),
  bridge.onMethod('onAppRouteDone', function (params) {
    var webviewId =
      arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0
    params.path = params.path.replace(/\.\w+(\?|$)/, '$1') // params.path.substring(0, params.path.length - 5);
    params.webviewId =
      typeof params.webviewId !== 'undefined' ? params.webviewId : webviewId
    currUrl = params.path
    appRouteDoneCallback.forEach(function (fn) {
      fn(params)
    })
    bridge.publish('onAppRouteDone', {}, [webviewId])
  }),
  bridge.onMethod('onKeyboardValueChange', function (params) {
    var webviewId =
        arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
      pValue = params.value,
      pCursor = params.cursor
    if (params.data && typeof pageEventFn === 'function') {
      var data = JSON.parse(params.data)
      if (data.bindinput) {
        var peRes
        try {
          peRes = pageEventFn({
            data: {
              type: 'input',
              target: data.target,
              currentTarget: data.target,
              timeStamp: Date.now(),
              touches: [],
              detail: {
                value: params.value,
                cursor: params.cursor
              }
            },
            eventName: data.bindinput,
            webviewId: webviewId
          })
        } catch (e) {
          throw new utils.AppServiceSdkKnownError('bind key input error')
        }
        if (data.setKeyboardValue) {
          if (void 0 === peRes || peRes === null || peRes === !1);
          else if (utils.getDataType(peRes) === 'Object') {
            var opt = {
              inputId: params.inputId
            }
            pValue != peRes.value && (opt.value = peRes.value + '')
            isNaN(parseInt(peRes.cursor)) ||
              ((opt.cursor = parseInt(peRes.cursor)),
              typeof opt.value === 'undefined' && (opt.value = pValue),
              opt.cursor > opt.value.length && (opt.cursor = -1))
            bridge.invokeMethod('setKeyboardValue', opt)
          } else {
            pValue != peRes &&
              bridge.invokeMethod('setKeyboardValue', {
                value: peRes + '',
                cursor: -1,
                inputId: params.inputId
              })
          }
        }
      }
    }
    bridge.publish(
      'setKeyboardValue',
      {
        value: pValue,
        cursor: pCursor,
        inputId: params.inputId
      },
      [webviewId]
    )
  })

var getTouchInfo = function (touchInfo, eventKey, eventInfo) {
    // 返回touch信息
    var touches = [],
      changedTouches = []
    if (eventKey === 'onTouchStart') {
      for (var i in touchInfo) touches.push(touchInfo[i])
      var touchObj = {
        x: eventInfo.touch.x,
        y: eventInfo.touch.y,
        identifier: eventInfo.touch.id
      }
      changedTouches.push(touchObj)
      touches.push(touchObj)
    } else if (eventKey === 'onTouchMove') {
      for (var s in touchInfo) {
        var curTouchInfo = touchInfo[s],
          hasUpdate = !1
        for (var f in eventInfo.touches) {
          var touchObj = {
            x: eventInfo.touches[f].x,
            y: eventInfo.touches[f].y,
            identifier: eventInfo.touches[f].id
          }
          if (
            touchObj.identifier === curTouchInfo.identifier &&
            (curTouchInfo.x !== touchObj.x || curTouchInfo.y !== touchObj.y)
          ) {
            touches.push(touchObj)
            changedTouches.push(touchObj)
            hasUpdate = !0
            break
          }
        }
        hasUpdate || touches.push(curTouchInfo)
      }
    } else if (eventKey === 'onTouchEnd') {
      var touchObj = {
        x: eventInfo.touch.x,
        y: eventInfo.touch.y,
        identifier: eventInfo.touch.id
      }
      for (var p in touchInfo) {
        var curTouchInfo = touchInfo[p]
        curTouchInfo.identifier === touchObj.identifier
          ? changedTouches.push(touchObj)
          : touches.push(curTouchInfo)
      }
    } else if (eventKey === 'onTouchCancel') {
      for (var v in eventInfo.touches) {
        var touchObj = {
          x: eventInfo.touches[v].x,
          y: eventInfo.touches[v].y,
          identifier: eventInfo.touches[v].id
        }
        changedTouches.push(touchObj)
      }
    } else if (eventKey === 'onLongPress') {
      var touchObj = {
        x: eventInfo.touch.x,
        y: eventInfo.touch.y,
        identifier: eventInfo.touch.id
      }
      for (var b in touchInfo) {
        touchInfo[b].identifier === touchObj.identifier
          ? touches.push(touchObj)
          : touches.push(touchInfo[b])
      }
      changedTouches.push(touchObj)
    }
    return {
      touches: touches,
      changedTouches: changedTouches
    }
  },
  touchEvents = {
    onTouchStart: 'touchstart',
    onTouchMove: 'touchmove',
    onTouchEnd: 'touchend',
    onTouchCancel: 'touchcancel',
    onLongPress: 'longtap'
  }

  ;[
    'onTouchStart',
    'onTouchMove',
    'onTouchEnd',
    'onTouchCancel',
    'onLongPress'
  ].forEach(function (eventName) {
    bridge.onMethod(eventName, function (params) {
      var webviewId =
        arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
        data = JSON.parse(params.data),
        canvasNumber = data.canvasNumber
      canvas.canvasInfo.hasOwnProperty(canvasNumber) ||
      console.error(
        'No such canvas ' +
          canvasNumber +
          ' register in ' +
          webviewId +
          ', but trigger ' +
          eventName +
          ' event.'
      )
      var canvasData = canvas.canvasInfo[canvasNumber].data
      if (canvasData[eventName] && typeof pageEventFn === 'function') {
        var touchInfo = getTouchInfo(canvasData.lastTouches, eventName, params),
          touches = touchInfo.touches,
          changedTouches = touchInfo.changedTouches
          ;(canvasData.lastTouches = touches),
        (eventName === 'onTouchMove' && changedTouches.length === 0) ||
          pageEventFn({
            data: {
              type: touchEvents[eventName],
              timeStamp: new Date() - canvasData.startTime,
              target: canvasData.target,
              touches: touches,
              changedTouches: changedTouches
            },
            eventName: canvasData[eventName],
            webviewId: webviewId
          })
      }
    })
  }),
  [
    'onVideoPlay',
    'onVideoPause',
    'onVideoEnded',
    'onVideoTimeUpdate',
    'onVideoClickFullScreenBtn',
    'onVideoClickDanmuBtn'
  ].forEach(function (eventName) {
    bridge.onMethod(eventName, function () {
      var params =
          arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
        webviewId = arguments[1],
        bindEventName = 'bind' + eventName.substring(7).toLowerCase(),
        dataObj = JSON.parse(params.data),
        handlers = dataObj.handlers,
        event = dataObj.event,
        createdTimestamp = dataObj.createdTimestamp
      if (handlers[bindEventName] && typeof pageEventFn === 'function') {
        var data = {
          type: bindEventName.substring(4),
          target: event.target,
          currentTarget: event.currentTarget,
          timeStamp: Date.now() - createdTimestamp,
          detail: {}
        }
        bindEventName === 'bindtimeupdate' &&
          (data.detail = { currentTime: params.position })
        pageEventFn({
          data: data,
          eventName: handlers[bindEventName],
          webviewId: webviewId
        })
      }
    })
  }),
  bridge.onMethod('onAccelerometerChange', function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0
    accelerometerChangeFns.forEach(function (fn) {
      typeof fn === 'function' && fn(params)
    })
  }),
  bridge.onMethod('onCompassChange', function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0
    compassChangeFns.forEach(function (fn) {
      typeof fn === 'function' && fn(params)
    })
  }),
  bridge.onMethod('onError', function () {
    var params =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0
    console.error(
      'thirdScriptError',
      '\n',
      'sdk uncaught third Error',
      '\n',
      params.message,
      '\n',
      params.stack
    )
  }),
  bridge.onMethod('onMapMarkerClick', function () {
    var params =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
      webViewId =
        arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0
    if (params.data && typeof pageEventFn === 'function') {
      var data = JSON.parse(params.data)
      data.bindmarkertap &&
        pageEventFn({
          data: {
            markerId: data.markerId
          },
          eventName: data.bindmarkertap,
          webviewId: webViewId
        })
    }
  }),
  bridge.onMethod('onMapControlClick', function () {
    var params =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
      webviewId =
        arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0
    if (params.data && typeof pageEventFn === 'function') {
      var data = JSON.parse(params.data)
      data.bindcontroltap &&
        pageEventFn({
          data: {
            controlId: data.controlId
          },
          eventName: data.bindcontroltap,
          webviewId: webviewId
        })
    }
  }),
  bridge.onMethod('onMapRegionChange', function () {
    var params =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
      webviewId =
        arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
      mapInfo = map.mapInfo[webviewId + '_' + params.mapId]
    mapInfo &&
      mapInfo.bindregionchange &&
      typeof pageEventFn === 'function' &&
      pageEventFn({
        data: {
          type: params.type
        },
        eventName: mapInfo.bindregionchange,
        webviewId: webviewId
      })
  }),
  bridge.onMethod('onMapClick', function () {
    var params =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
      webviewId =
        arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
      mapInfo = map.mapInfo[webviewId + '_' + params.mapId]
    mapInfo &&
      mapInfo.bindtap &&
      typeof pageEventFn === 'function' &&
      pageEventFn({
        data: {},
        eventName: mapInfo.bindtap,
        webviewId: webviewId
      })
  })
for (var key in apiObj) addGetterForWX(key)

function bindApi (item) {
  if (!item.name) {
    return
  }
  WX[item.name] = function (params) {
    params = params || {}
    if (item.params && !paramCheck(item.name, params, item.params)) {
      return
    }
    if (item.fn) {
      item.fn.call(apiObj, params)
    } else {
      bridge.invokeMethod(item.name, params, item.option)
    }
  }
}
WX.loadExtApi = function (conf) {
  if (conf) {
    const type = utils.getDataType(conf)
    if (type == 'Array') {
      for (let item of conf) {
        bindApi(item)
      }
    } else if (type == 'Object') {
      bindApi(conf)
    }
  }
}
window.HeraExtApiConf && WX.loadExtApi(window.HeraExtApiConf)

window.wd = WX
module.exports = WX
