import bridge from './bridge'
import contactButton from './contactButton'
import onAppStateChange from './onAppStateChange'
import utils from './utils'
import './init'

function injectAttr (attrName) {
  isInDevtools
    ? (wx[attrName] = apiObj[attrName])
    : wx.__defineGetter__(attrName, function () {
      return function () {
        try {
          return apiObj[attrName].apply(this, arguments)
        } catch (e) {
          errReport(e)
        }
      }
    })
}

function errReport (obj, extend) {
  if (Object.prototype.toString.apply(obj) === '[object Error]') {
    if (obj.type == 'WebviewSdkKnownError') throw obj
    Reporter.errorReport({
      key: 'webviewSDKScriptError',
      error: obj,
      extend: extend
    })
  }
}

var localImgDataIng = !1,
  imgData = [],
  wx = {},
  isInDevtools = utils.getPlatform() === 'devtools',
  defInvoke = function (name, args) {
    // publish
    bridge.publish('INVOKE_METHOD', {
      name: name,
      args: args
    })
  },
  apiObj = {
    invoke: bridge.invoke,
    on: bridge.on,
    getPlatform: utils.getPlatform,
    onAppEnterForeground: onAppStateChange.onAppEnterForeground,
    onAppEnterBackground: onAppStateChange.onAppEnterBackground,
    reportIDKey: function (e, t) {
      console.warn('reportIDKey has been removed wx')
    },
    reportKeyValue: function (e, t) {
      console.warn('reportKeyValue has been removed from wx')
    },
    initReady: function () {
      bridge.invokeMethod('initReady')
    },
    redirectTo: function (params) {
      defInvoke('redirectTo', params)
    },
    navigateTo: function (params) {
      defInvoke('navigateTo', params)
    },
    reLaunch: function (params) {
      defInvoke('reLaunch', params)
    },
    switchTab: function (params) {
      defInvoke('switchTab', params)
    },
    clearStorage: function () {
      defInvoke('clearStorage', {})
    },
    showKeyboard: function (params) {
      bridge.invokeMethod('showKeyboard', params)
    },
    showDatePickerView: function (params) {
      bridge.invokeMethod('showDatePickerView', params)
    },
    hideKeyboard: function (params) {
      bridge.invokeMethod('hideKeyboard', params)
    },
    insertMap: function (params) {
      bridge.invokeMethod('insertMap', params)
    },
    removeMap: function (params) {
      bridge.invokeMethod('removeMap', params)
    },
    updateMapCovers: function (params) {
      bridge.invokeMethod('updateMapCovers', params)
    },
    insertContactButton: contactButton.insertContactButton,
    updateContactButton: contactButton.updateContactButton,
    removeContactButton: contactButton.removeContactButton,
    enterContact: contactButton.enterContact,
    getRealRoute: utils.getRealRoute,
    getCurrentRoute: function (params) {
      bridge.invokeMethod('getCurrentRoute', params, {
        beforeSuccess: function (res) {
          res.route = res.route.split('?')[0]
        }
      })
    },
    getLocalImgData: function (params) {
      function beforeAllFn () {
        localImgDataIng = !1
        if (imgData.length > 0) {
          var item = imgData.shift()
          apiObj.getLocalImgData(item)
        }
      }

      if (localImgDataIng === !1) {
        localImgDataIng = !0
        if (typeof params.path === 'string') {
          apiObj.getCurrentRoute({
            success: function (res) {
              var route = res.route
              params.path = utils.getRealRoute(
                route || 'index.html',
                params.path
              )
              bridge.invokeMethod('getLocalImgData', params, {
                beforeAll: beforeAllFn
              })
            }
          })
        } else {
          bridge.invokeMethod('getLocalImgData', params, {
            beforeAll: beforeAllFn
          })
        }
      } else {
        imgData.push(params)
      }
    },
    insertVideoPlayer: function (e) {
      bridge.invokeMethod('insertVideoPlayer', e)
    },
    removeVideoPlayer: function (e) {
      bridge.invokeMethod('removeVideoPlayer', e)
    },
    insertShareButton: function (e) {
      bridge.invokeMethod('insertShareButton', e)
    },
    updateShareButton: function (e) {
      bridge.invokeMethod('updateShareButton', e)
    },
    removeShareButton: function (e) {
      bridge.invokeMethod('removeShareButton', e)
    },
    onAppDataChange: function (callback) {
      bridge.subscribe('appDataChange', function (params) {
        callback(params)
      })
    },
    onPageScrollTo: function (callback) {
      bridge.subscribe('pageScrollTo', function (params) {
        callback(params)
      })
    },
    publishPageEvent: function (eventName, data) {
      bridge.publish('PAGE_EVENT', {
        eventName: eventName,
        data: data
      })
    },
    animationToStyle: utils.animationToStyle
  }

for (var key in apiObj) injectAttr(key)

// export default wx
module.exports = wx
window.wx = wx
