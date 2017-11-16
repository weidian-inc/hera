function exeWhenWXJSbridgeReady (fn) {
  window.__pageFrameEndTime__ // 首次generateFuncReady加载完毕
    ? fn()
    : document.addEventListener('generateFuncReady', fn)
}

// 转发 window 上的 animation 和 transition 相关的动画事件到 exparser
!(function (win) {
  var getOpt = function (args) {
      return {
        animationName: args.animationName,
        elapsedTime: args.elapsedTime
      }
    },
    isWebkit = null
  var animationAPIList = [
    'webkitAnimationStart',
    'webkitAnimationIteration',
    'webkitAnimationEnd',
    'animationstart',
    'animationiteration',
    'animationend',
    'webkitTransitionEnd',
    'transitionend'
  ]
  animationAPIList.forEach(function (key) {
    isWebkit = key.slice(0, 6) === 'webkit'
    if (isWebkit) {
      key = key.slice(6).toLowerCase()
    }

    win.addEventListener(
      key,
      function (event) {
        event.target.__wxElement &&
          exparser.triggerEvent(event.target.__wxElement, key, getOpt(event))
        document.dispatchEvent(new CustomEvent('pageReRender', {}))
      },
      !0
    )
  })
})(window)

// 订阅并转发 HeraJSBridge 提供的全局事件到 exparser
!(function (glob) {
  exeWhenWXJSbridgeReady(function () {
    HeraJSBridge.subscribe('onAppRouteDone', function () {
      window.__onAppRouteDone = !0
      exparser.triggerEvent(
        document,
        'routeDone',
        {},
        {
          bubbles: !0
        }
      )
      document.dispatchEvent(new CustomEvent('pageReRender', {}))
    })
    HeraJSBridge.subscribe('setKeyboardValue', function (event) {
      event &&
        event.data &&
        exparser.triggerEvent(
          document,
          'setKeyboardValue',
          {
            value: event.data.value,
            cursor: event.data.cursor,
            inputId: event.data.inputId
          },
          {
            bubbles: !0
          }
        )
    })
    HeraJSBridge.subscribe('hideKeyboard', function (e) {
      exparser.triggerEvent(
        document,
        'hideKeyboard',
        {},
        {
          bubbles: !0
        }
      )
    })
    HeraJSBridge.on('onKeyboardComplete', function (event) {
      exparser.triggerEvent(
        document,
        'onKeyboardComplete',
        {
          value: event.value,
          inputId: event.inputId
        },
        {
          bubbles: !0
        }
      )
    })
    HeraJSBridge.on('onKeyboardConfirm', function (event) {
      exparser.triggerEvent(
        document,
        'onKeyboardConfirm',
        {
          value: event.value,
          inputId: event.inputId
        },
        {
          bubbles: !0
        }
      )
    })
    HeraJSBridge.on('onTextAreaHeightChange', function (event) {
      exparser.triggerEvent(
        document,
        'onTextAreaHeightChange',
        {
          height: event.height,
          lineCount: event.lineCount,
          inputId: event.inputId
        },
        {
          bubbles: !0
        }
      )
    })
    HeraJSBridge.on('onKeyboardShow', function (event) {
      exparser.triggerEvent(
        document,
        'onKeyboardShow',
        {
          inputId: event.inputId
        },
        {
          bubbles: !0
        }
      )
    })
  })
})(window)

// 转发 window 上的 error 以及各种表单事件到 exparser
!(function (window) {
  exparser.globalOptions.renderingMode = 'native'

  window.addEventListener(
    'change',
    function (event) {
      exparser.triggerEvent(event.target, 'change', {
        value: event.target.value
      })
    },
    !0
  )

  window.addEventListener(
    'input',
    function (event) {
      exparser.triggerEvent(event.target, 'input')
    },
    !0
  )

  window.addEventListener(
    'load',
    function (event) {
      exparser.triggerEvent(event.target, 'load')
    },
    !0
  )

  window.addEventListener(
    'error',
    function (event) {
      exparser.triggerEvent(event.target, 'error')
    },
    !0
  )

  window.addEventListener(
    'focus',
    function (event) {
      exparser.triggerEvent(event.target, 'focus'), event.preventDefault()
    },
    !0
  )

  window.addEventListener(
    'blur',
    function (event) {
      exparser.triggerEvent(event.target, 'blur')
    },
    !0
  )

  window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame
  window.requestAnimationFrame ||
    (window.requestAnimationFrame = function (func) {
      typeof func === 'function' &&
        setTimeout(function () {
          func()
        }, 17)
    })
})(window),
  // touch events
  (function (win) {
    var triggerEvent = function (event, name, params) {
        exparser.triggerEvent(event.target, name, params, {
          originalEvent: event,
          bubbles: !0,
          composed: !0,
          extraFields: {
            touches: event.touches,
            changedTouches: event.changedTouches
          }
        })
      },
      distanceThreshold = 10,
      longtapGapTime = 350,
      wxScrollTimeLowestValue = 50,
      setTouches = function (event, change) {
        event[change ? 'changedTouches' : 'touches'] = [
          {
            identifier: 0,
            pageX: event.pageX,
            pageY: event.pageY,
            clientX: event.clientX,
            clientY: event.clientY,
            screenX: event.screenX,
            screenY: event.screenY,
            target: event.target
          }
        ]
        return event
      },
      isTouchstart = !1,
      oriTimeStamp = 0,
      curX = 0,
      curY = 0,
      curEvent = 0,
      longtapTimer = null,
      isCancletap = !1,
      canceltap = function (node) {
        for (; node; node = node.parentNode) {
          var element = node.__wxElement || node
          if (
            element.__wxScrolling &&
            Date.now() - element.__wxScrolling < wxScrollTimeLowestValue
          ) { return !0 }
        }
        return !1
      },
      triggerLongtap = function () {
        triggerEvent(curEvent, 'longtap', {
          x: curX,
          y: curY
        })
      },
      touchstart = function (event, x, y) {
        if (!oriTimeStamp) {
          oriTimeStamp = event.timeStamp
          curX = x
          curY = y
          if (canceltap(event.target)) {
            longtapTimer = null
            isCancletap = !0
            triggerEvent(event, 'canceltap', {
              x: x,
              y: y
            })
          } else {
            longtapTimer = setTimeout(triggerLongtap, longtapGapTime)
            isCancletap = !1
          }
          curEvent = event
          event.defaultPrevented && (oriTimeStamp = 0)
        }
      },
      touchmove = function (e, x, y) {
        if (oriTimeStamp) {
          if (
            !(
              Math.abs(x - curX) < distanceThreshold &&
              Math.abs(y - curY) < distanceThreshold
            )
          ) {
            longtapTimer && (clearTimeout(longtapTimer), (longtapTimer = null))
            isCancletap = !0
            triggerEvent(curEvent, 'canceltap', {
              x: x,
              y: y
            })
          }
        }
      },
      touchend = function (event, x, y, isTouchcancel) {
        if (oriTimeStamp) {
          oriTimeStamp = 0
          longtapTimer && (clearTimeout(longtapTimer), (longtapTimer = null))
          if (isTouchcancel) {
            event = curEvent
            x = curX
            y = curY
          } else {
            if (!isCancletap) {
              triggerEvent(curEvent, 'tap', {
                x: x,
                y: y
              })
              readyAnalyticsReport(curEvent)
            }
          }
        }
      }
    win.addEventListener(
      'scroll',
      function (event) {
        event.target.__wxScrolling = Date.now()
      },
      {
        capture: !0,
        passive: !1
      }
    )
    win.addEventListener(
      'touchstart',
      function (event) {
        isTouchstart = !0
        triggerEvent(event, 'touchstart')
        event.touches.length === 1 &&
          touchstart(event, event.touches[0].pageX, event.touches[0].pageY)
      },
      {
        capture: !0,
        passive: !1
      }
    )
    win.addEventListener(
      'touchmove',
      function (event) {
        triggerEvent(event, 'touchmove')
        event.touches.length === 1 &&
          touchmove(event, event.touches[0].pageX, event.touches[0].pageY)
      },
      {
        capture: !0,
        passive: !1
      }
    )
    win.addEventListener(
      'touchend',
      function (event) {
        triggerEvent(event, 'touchend')
        event.touches.length === 0 &&
          touchend(
            event,
            event.changedTouches[0].pageX,
            event.changedTouches[0].pageY
          )
      },
      {
        capture: !0,
        passive: !1
      }
    )
    win.addEventListener(
      'touchcancel',
      function (event) {
        triggerEvent(event, 'touchcancel')
        touchend(null, 0, 0, !0)
      },
      {
        capture: !0,
        passive: !1
      }
    )
    window.addEventListener('blur', function () {
      touchend(null, 0, 0, !0)
    })
    win.addEventListener(
      'mousedown',
      function (event) {
        if (!isTouchstart && !oriTimeStamp) {
          setTouches(event, !1)
          triggerEvent(event, 'touchstart')
          touchstart(event, event.pageX, event.pageY)
        }
      },
      {
        capture: !0,
        passive: !1
      }
    )
    win.addEventListener(
      'mousemove',
      function (event) {
        if (!isTouchstart && oriTimeStamp) {
          setTouches(event, !1)
          triggerEvent(event, 'touchmove')
          touchmove(event, event.pageX, event.pageY)
        }
      },
      {
        capture: !0,
        passive: !1
      }
    )
    win.addEventListener(
      'mouseup',
      function (event) {
        if (!isTouchstart && oriTimeStamp) {
          setTouches(event, !0)
          triggerEvent(event, 'touchend')
          touchend(event, event.pageX, event.pageY)
        }
      },
      {
        capture: !0,
        passive: !1
      }
    )
    var analyticsConfig = {},
      readyAnalyticsReport = function (event) {
        if (analyticsConfig.selector) {
          for (
            var selector = analyticsConfig.selector, target = event.target;
            target;

          ) {
            if (target.tagName && target.tagName.indexOf('WX-') === 0) {
              var classNames = target.className
                .split(' ')
                .map(function (className) {
                  return '.' + className
                })
              ;['#' + target.id]
                .concat(classNames)
                .forEach(function (curSelector) {
                  selector.indexOf(curSelector) > -1 &&
                    analyticsReport(target, curSelector)
                })
            }
            target = target.parentNode
          }
        }
      },
      analyticsReport = function (ele, selector) {
        for (var i = 0; i < analyticsConfig.data.length; i++) {
          var curData = analyticsConfig.data[i]
          if (curData.element === selector) {
            var data = {
              eventID: curData.eventID,
              page: curData.page,
              element: curData.element,
              action: curData.action,
              time: Date.now()
            }
            selector.indexOf('.') === 0 &&
              (data.index = Array.prototype.indexOf.call(
                document.body.querySelectorAll(curData.element),
                ele
              ))
            exeWhenWXJSbridgeReady(function () {
              HeraJSBridge.publish('analyticsReport', {
                data: data
              })
            })
            break
          }
        }
      }
    exeWhenWXJSbridgeReady(function () {
      HeraJSBridge.subscribe('analyticsConfig', function (params) {
        if (Object.prototype.toString.call(params.data) === '[object Array]') {
          analyticsConfig.data = params.data
          analyticsConfig.selector = []
          analyticsConfig.data.forEach(function (e) {
            e.element && analyticsConfig.selector.push(e.element)
          })
        }
      })
    })
  })(window)

require('./behaviors/wx-base')
require('./behaviors/wx-data-component')
require('./behaviors/wx-disabled')
require('./behaviors/wx-group')
require('./behaviors/wx-hover')
require('./behaviors/wx-input-base')
require('./behaviors/wx-item')
require('./behaviors/wx-label-target')
require('./behaviors/wx-mask-Behavior')
require('./behaviors/wx-native')
require('./behaviors/wx-player')
require('./behaviors/wx-touchtrack')

require('./components/wx-action-sheet-cancel')
require('./components/wx-action-sheet')
require('./components/wx-action-sheet-item')
require('./components/wx-audio')
require('./components/wx-button')
require('./components/wx-canvas')
require('./components/wx-checkbox')
require('./components/wx-checkbox-Group')
require('./components/wx-form')
require('./components/wx-icon')
require('./components/wx-image')
require('./components/wx-input')
require('./components/wx-label')
require('./components/wx-loading')
require('./components/wx-map')
require('./components/wx-mask')
require('./components/wx-modal')
require('./components/wx-navigator')
require('./components/wx-picker')
require('./components/wx-picker-view')
require('./components/wx-picker-view-column')
require('./components/wx-progress')
require('./components/wx-radio')
require('./components/wx-radio-group')
require('./components/wx-scroll-view')
require('./components/wx-slider')
require('./components/wx-swiper')
require('./components/wx-swiper-item')
require('./components/wx-switch')
require('./components/wx-text')
require('./components/wx-textarea')
require('./components/wx-toast')
require('./components/wx-video')
require('./components/wx-view')
require('./components/wx-contact-button')
// import ContactButton from './wx-contact-button'
