function _toArray (args) {
  return Array.isArray(args) ? args : Array.from(args)
}

function _toCopyArray (args) {
  if (Array.isArray(args)) {
    for (var t = 0, res = new Array(args.length); t < args.length; t++) {
      res[t] = args[t]
    }
    return res
  }
  return Array.from(args)
}
var touchEventNames = [
    'touchstart',
    'touchmove',
    'touchend',
    'touchcancel',
    'longtap'
  ],
  touchEventMap = {
    touchstart: 'onTouchStart',
    touchmove: 'onTouchMove',
    touchend: 'onTouchEnd',
    touchcancel: 'onTouchCancel',
    longtap: 'onLongPress'
  },
  LONG_PRESS_TIME_THRESHOLD = 300,
  LONG_PRESS_DISTANCE_THRESHOLD = 5,
  format = function (obj, method, arr, key) {
    arr = Array.prototype.slice.call(arr)
    var res =
      obj +
      '.' +
      method +
      '(' +
      arr
        .map(function (val) {
          return typeof val === 'string' ? "'" + val + "'" : val
        })
        .join(', ') +
      ')'
    key && (res = key + ' = ' + res)
    return res
  },
  resolveColor = function (color) {
    var arr = color.slice(0)
    arr[3] = arr[3] / 255
    return 'rgba(' + arr.join(',') + ')'
  },
  getCanvasTouches = function (args) {
    var self = this
    return [].concat(_toCopyArray(args)).map(function (e) {
      return {
        identifier: e.identifier,
        x: e.pageX - self._box.left,
        y: e.pageY - self._box.top
      }
    })
  },
  calcDistance = function (end, start) {
    var dx = end.x - start.x,
      dy = end.y - start.y
    return dx * dx + dy * dy
  }

// wx-canvas
export default window.exparser.registerElement({
  is: 'wx-canvas',
  behaviors: ['wx-base', 'wx-native'],
  template: '<canvas id="canvas" width="300" height="150"></canvas>',
  properties: {
    canvasId: {
      type: String,
      public: !0
    },
    bindtouchstart: {
      type: String,
      value: '',
      public: !0
    },
    bindtouchmove: {
      type: String,
      value: '',
      public: !0
    },
    bindtouchend: {
      type: String,
      value: '',
      public: !0
    },
    bindtouchcancel: {
      type: String,
      value: '',
      public: !0
    },
    bindlongtap: {
      type: String,
      value: '',
      public: !0
    },
    disableScroll: {
      type: Boolean,
      value: !1,
      public: !0,
      observer: 'disableScrollChanged'
    }
  },
  _updatePosition: function () {
    this.$.canvas.width = this._box.width
    this.$.canvas.height = this._box.height
    this._isMobile()
      ? HeraJSBridge.invoke(
          'updateCanvas',
        {
          canvasId: this._canvasNumber,
          position: this._box
        },
          function (e) {}
        )
      : this.actionsChanged(this.actions)
  },
  attached: function () {
    var self = this
    this._images = {}
    this._box = this._getBox()
    this.$.canvas.width = this.$$.offsetWidth
    this.$.canvas.height = this.$$.offsetHeight
    if (!this.canvasId) {
      this.triggerEvent('error', {
        errMsg: 'canvas-id attribute is undefined'
      })
      this._isError = !0
      return void (this.$$.style.display = 'none')
    }
    window.__canvasNumbers__ = window.__canvasNumbers__ || {}
    var canvasId = window.__webviewId__ + 'canvas' + this.canvasId
    return window.__canvasNumbers__.hasOwnProperty(canvasId)
      ? (this.triggerEvent('error', {
        errMsg:
            'canvas-id ' + self.canvasId + ' in this page has already existed'
      }),
        (this._isError = !0),
        void (this.$$.style.display = 'none'))
      : ((window.__canvasNumber__ = window.__canvasNumber__ || 1e5),
        (window.__canvasNumbers__[canvasId] =
          window.__canvasNumber__ + __webviewId__),
        (window.__canvasNumber__ += 1e5),
        (this._canvasNumber = window.__canvasNumbers__[canvasId]),
        void (0 && this._isMobile()
          ? !(function () {
            self._isReady = !1
            var eventObj = {
                target: {
                  target: self.$$.id,
                  dataset: self.dataset,
                  offsetTop: self.$$.offsetTop,
                  offsetLeft: self.$$.offsetLeft
                },
                startTime: +new Date()
              },
              gesture = !1
            touchEventNames.forEach(function (eventKey) {
              self['bind' + eventKey] &&
                  ((eventObj[touchEventMap[eventKey]] =
                    self['bind' + eventKey]),
                  (gesture = !0))
            })
            HeraJSBridge.invoke(
                'insertCanvas',
              {
                data: JSON.stringify({
                  type: 'canvas',
                  webviewId: window.__webviewId__,
                  canvasNumber: self._canvasNumber
                }),
                gesture: gesture,
                canvasId: self._canvasNumber,
                position: self._box,
                hide: self.hidden,
                disableScroll: self.disableScroll
              },
                function (e) {
                  HeraJSBridge.publish('canvasInsert', {
                    canvasId: self.canvasId,
                    canvasNumber: self._canvasNumber,
                    data: eventObj
                  })
                  self._ready()
                  document.addEventListener(
                    'pageReRender',
                    self._pageReRenderCallback.bind(self)
                  )
                }
              )
          })()
          : (HeraJSBridge.publish('canvasInsert', {
            canvasId: self.canvasId,
            canvasNumber: self._canvasNumber
          }),
            HeraJSBridge.subscribe(
              'canvas' + self._canvasNumber + 'actionsChanged',
              function (params) {
                var actions = params.actions,
                  reserve = params.reserve
                self.actions = actions
                self.actionsChanged(actions, reserve)
              }
            ),
            HeraJSBridge.subscribe(
              'invokeCanvasToDataUrl_' + self._canvasNumber,
              function () {
                var dataUrl = self.$.canvas.toDataURL()
                HeraJSBridge.publish(
                  'onCanvasToDataUrl_' + self._canvasNumber,
                  {
                    dataUrl: dataUrl
                  }
                )
              }
            ),
            self._ready(),
            document.addEventListener(
              'pageReRender',
              self._pageReRenderCallback.bind(self)
            ),
            this.addTouchEventForWebview())))
  },
  detached: function () {
    var canvasId = __webviewId__ + 'canvas' + this.canvasId
    delete window.__canvasNumbers__[canvasId]
    this._isMobile() &&
      HeraJSBridge.invoke(
        'removeCanvas',
        { canvasId: this._canvasNumber },
        function (e) {}
      )
    HeraJSBridge.publish('canvasRemove', {
      canvasId: this.canvasId,
      canvasNumber: this._canvasNumber
    })
  },
  addTouchEventForWebview: function () {
    var self = this
    touchEventNames.forEach(function (eventName) {
      self.$$.addEventListener(eventName, function (event) {
        var touches = getCanvasTouches.call(self, event.touches),
          changedTouches = getCanvasTouches.call(self, event.changedTouches)
        self.bindlongtap &&
          ((self._touchInfo = self._touchInfo || {}),
          (self._disableScroll = self._disableScroll || 0),
          eventName === 'touchstart'
            ? changedTouches.forEach(function (curEvent) {
              ;(self._touchInfo[curEvent.identifier] = {}),
                  (self._touchInfo[curEvent.identifier].x = curEvent.x),
                  (self._touchInfo[curEvent.identifier].y = curEvent.y),
                  (self._touchInfo[curEvent.identifier].timeStamp =
                    event.timeStamp),
                  (self._touchInfo[
                    curEvent.identifier
                  ].handler = setTimeout(function () {
                    if (self._touchInfo.hasOwnProperty(curEvent.identifier)) {
                      ;(self._touchInfo[curEvent.identifier].longPress = !0),
                        ++self._disableScroll
                      var _touches = [],
                        _changedTouches = []
                      for (var ide in self._touchInfo) {
                        var curTouche = {
                          identifier: ide,
                          x: self._touchInfo[ide].x,
                          y: self._touchInfo[ide].y
                        }
                        _touches.push(curTouche)
                        ide === String(curEvent.identifier) &&
                          _changedTouches.push(curTouche)
                      }
                      wx.publishPageEvent(self.bindlongtap, {
                        type: 'bindlongtap',
                        timeStamp:
                          self._touchInfo[curEvent.identifier].timeStamp +
                          LONG_PRESS_TIME_THRESHOLD,
                        target: {
                          id: event.target.parentElement.id,
                          offsetLeft: event.target.offsetLeft,
                          offsetTop: event.target.offsetTop,
                          dataset: self.dataset
                        },
                        touches: _touches,
                        changedTouches: _changedTouches
                      })
                    }
                  }, LONG_PRESS_TIME_THRESHOLD))
            })
            : eventName === 'touchend' || eventName === 'touchcancel'
              ? changedTouches.forEach(function (n) {
                self._touchInfo.hasOwnProperty(n.identifier) ||
                    console.error(
                      'in ' +
                        eventName +
                        ', can not found ' +
                        n.identifier +
                        ' in ' +
                        JSON.stringify(self._touchInfo)
                    ),
                    self._touchInfo[n.identifier].longPress &&
                      --self._disableScroll,
                    clearTimeout(self._touchInfo[n.identifier].handler),
                    delete self._touchInfo[n.identifier]
              })
              : changedTouches.forEach(function (n) {
                self._touchInfo.hasOwnProperty(n.identifier) ||
                    console.error(
                      'in ' +
                        eventName +
                        ', can not found ' +
                        n.identifier +
                        ' in ' +
                        JSON.stringify(self._touchInfo)
                    ),
                    calcDistance(self._touchInfo[n.identifier], n) >
                      LONG_PRESS_DISTANCE_THRESHOLD &&
                      !self._touchInfo[n.identifier].longPress &&
                      clearTimeout(self._touchInfo[n.identifier].handler),
                    (self._touchInfo[n.identifier].x = n.x),
                    (self._touchInfo[n.identifier].y = n.y)
              })),
          self['bind' + eventName] &&
            touches.length + changedTouches.length > 0 &&
            wx.publishPageEvent(self['bind' + eventName], {
              type: eventName,
              timeStamp: event.timeStamp,
              target: {
                id: event.target.parentElement.id,
                offsetLeft: event.target.offsetLeft,
                offsetTop: event.target.offsetTop,
                dataset: self.dataset
              },
              touches: touches,
              changedTouches: changedTouches
            })
        ;(self.disableScroll || self._disableScroll) &&
          (event.preventDefault(), event.stopPropagation())
      })
    })
  },
  actionsChanged: function (actions) {
    var flag =
      !(arguments.length <= 1 || void 0 === arguments[1]) && arguments[1]
    if (!this._isMobile() && actions) {
      var __canvas = this.$.canvas,
        ctx = __canvas.getContext('2d')
      if (flag === !1) {
        ctx.fillStyle = '#000000'
        ctx.strokeStyle = '#000000'
        ctx.shadowColor = '#000000'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, __canvas.width, __canvas.height)
        actions.forEach(function (act) {
          var self = this,
            _method = act.method,
            _data = act.data
          if (/^set/.test(_method)) {
            var styleKey = _method[3].toLowerCase() + _method.slice(4),
              styleVal = void 0
            if (styleKey === 'fillStyle' || styleKey === 'strokeStyle') {
              if (_data[0] === 'normal') {
                styleVal = resolveColor(_data[1])
              } else if (_data[0] === 'linear') {
                var _gradient = ctx.createLinearGradient.apply(ctx, _data[1])
                _data[2].forEach(function (arr) {
                  var t = arr[0],
                    n = resolveColor(arr[1])
                  _gradient.addColorStop(t, n)
                })
              } else if (_data[0] === 'radial') {
                var s = _data[1][0],
                  l = _data[1][1],
                  c = _data[1][2],
                  d = [s, l, 0, s, l, c],
                  _gradient = ctx.createRadialGradient.apply(ctx, d)
                _data[2].forEach(function (arr) {
                  var t = arr[0],
                    n = resolveColor(arr[1])
                  _gradient.addColorStop(t, n)
                })
              }
              ctx[styleKey] = styleVal
            } else if (styleKey === 'globalAlpha') {
              ctx[styleKey] = _data[0] / 255
            } else if (styleKey === 'shadow') {
              var _keys = [
                'shadowOffsetX',
                'shadowOffsetY',
                'shadowBlur',
                'shadowColor'
              ]
              _data.forEach(function (e, t) {
                _keys[t] === 'shadowColor'
                  ? (ctx[_keys[t]] = resolveColor(e))
                  : (ctx[_keys[t]] = e)
              })
            } else {
              styleKey === 'fontSize'
                ? (ctx.font = ctx.font.replace(/\d+\.?\d*px/, _data[0] + 'px'))
                : (ctx[styleKey] = _data[0])
            }
          } else {
            if (_method === 'fillPath' || _method === 'strokePath') {
              _method = _method.replace(/Path/, '')
              ctx.beginPath()
              _data.forEach(function (e) {
                ctx[e.method].apply(ctx, e.data)
              })
              ctx[_method]()
            } else {
              if (_method === 'fillText') {
                ctx.fillText.apply(ctx, _data)
              } else {
                if (_method === 'drawImage') {
                  !(function () {
                    var _arr = _toArray(_data),
                      _url = _arr[0],
                      params = _arr.slice(1)
                    self._images = self._images || {}
                    /*
                                         _url = _url.replace(
                                         'wdfile://',
                                         'http://wxfile.open.weixin.qq.com/'
                                         )
                                         */

                    if (self._images[_url]) {
                      ctx.drawImage.apply(
                        ctx,
                        [self._images[_url]].concat(_toCopyArray(params))
                      )
                    } else {
                      self._images[_url] = new Image()
                      self._images[_url].src = _url
                      self._images[_url].onload = function () {
                        ctx.drawImage.apply(
                          ctx,
                          [self._images[_url]].concat(_toCopyArray(params))
                        )
                      }
                    }
                  })()
                } else {
                  ctx[_method].apply(ctx, _data)
                }
              }
            }
          }
        }, this)
      }
    }
  },
  _hiddenChanged: function (hidden, t) {
    this._isMobile()
      ? ((this.$$.style.display = hidden ? 'none' : ''),
        HeraJSBridge.invoke(
          'updateCanvas',
          { canvasId: this._canvasNumber, hide: hidden },
          function (e) {}
        ))
      : (this.$$.style.display = hidden ? 'none' : '')
  },
  disableScrollChanged: function (disScroll, t) {
    this._isMobile() &&
      HeraJSBridge.invoke(
        'updateCanvas',
        {
          canvasId: this._canvasNumber,
          disableScroll: disScroll
        },
        function (e) {}
      )
  }
})
