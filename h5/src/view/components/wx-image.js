// wx-image
export default window.exparser.registerElement({
  is: 'wx-image',
  template: '<div id="div"></div>',
  behaviors: ['wx-base'],
  properties: {
    src: {
      type: String,
      observer: 'srcChanged',
      public: !0
    },
    mode: {
      type: String,
      observer: 'modeChanged',
      public: !0
    },
    _disableSizePositionRepeat: {
      type: Boolean,
      value: !1
    },
    backgroundSize: {
      type: String,
      observer: 'backgroundSizeChanged',
      value: '100% 100%',
      public: !0
    },
    backgroundPosition: {
      type: String,
      observer: 'backgroundPositionChanged',
      public: !0
    },
    backgroundRepeat: {
      type: String,
      observer: 'backgroundRepeatChanged',
      value: 'no-repeat',
      public: !0
    },
    _img: {
      type: Object
    }
  },
  _publishError: function (errMsg) {
    this.triggerEvent('error', errMsg)
  },
  _ready: function () {
    if (!(this._img && this._img instanceof Image)) {
      this._img = new Image()
      var self = this
      this._img.onerror = function (event) {
        event.stopPropagation()
        var data = {
          errMsg: 'GET ' + self._img.src + ' 404 (Not Found)'
        }
        self._publishError(data)
      }
      this._img.onload = function (event) {
        event.stopPropagation()
        self.triggerEvent('load', {
          width: this.width,
          height: this.height
        })
        if (self.mode === 'widthFix') {
          self.rate = this.width / this.height
          self.$$.style.height =
            (self.$.div.offsetWidth || self.$$.offsetWidth) / self.rate + 'px'
        }
      }
      document.addEventListener(
        'pageReRender',
        this._pageReRenderCallback.bind(this)
      )
    }
  },
  attached: function () {
    this._ready()
    this.backgroundSizeChanged(this.backgroundSize)
    this.backgroundRepeatChanged(this.backgroundRepeat)
  },
  detached: function () {
    document.removeEventListener(
      'pageReRender',
      this._pageReRenderCallback.bind(this)
    )
  },
  _pageReRenderCallback: function () {
    this.mode === 'widthFix' &&
      typeof this.rate !== 'undefined' &&
      (this.$$.style.height = this.$$.offsetWidth / this.rate + 'px')
  },
  _srcChanged: function (url) {
    function transformUrl (uri) {
      if (!/(https?|file|wdfile):/i.test(uri)) {
        if (uri.substring(0, 1) === '/') {
          uri = uri.substr(1)
        } else {
          const currPath = window.__path__.split('/').slice(0, -1)
          if (currPath.length) {
            uri = `${currPath.join('/')}/${uri}`
          }
        }
      }
      return uri
    }

    const srcImg = transformUrl(url)
    this._img.src = srcImg
    this.$.div.style.backgroundImage = 'url(' + srcImg + ')'
  },
  srcChanged: function (filePath, t) {
    if (filePath) {
      var ua = (this.$.div, window.navigator.userAgent.toLowerCase()),
        self = this
      this._ready()
      var opts = {
        success: function (e) {
          self._srcChanged(e.localData)
        },
        fail: function (e) {
          self._publishError(e)
        }
      } //! /wechatdevtools/.test(ua)
      false && /iphone/.test(ua)
        ? /^(http|https):\/\//.test(filePath) ||
          /^\s*data:image\//.test(filePath)
          ? this._srcChanged(filePath)
          : /^wdfile:\/\//.test(filePath)
            ? ((opts.filePath = filePath), wx.getLocalImgData(opts))
            : ((opts.path = filePath), wx.getLocalImgData(opts))
        : false && /android/.test(ua)
          ? /^wdfile:\/\//.test(filePath) ||
            /^(http|https):\/\//.test(filePath) ||
            /^\s*data:image\//.test(filePath)
            ? this._srcChanged(filePath)
            : wx.getCurrentRoute({
              success: function (t) {
                var n = wx.getRealRoute(t.route, filePath)
                self._srcChanged(n)
              }
            })
          : this._srcChanged(
              filePath /* .replace(
                     'wdfile://',
                     'http://wxfile.open.weixin.qq.com/'
                     ) */
            )
    }
  },
  _checkMode: function (styleKey) {
    var styles = [
        'scaleToFill',
        'aspectFit',
        'aspectFill',
        'top',
        'bottom',
        'center',
        'left',
        'right',
        'top left',
        'top right',
        'bottom left',
        'bottom right'
      ],
      res = !1,
      i = 0
    for (; i < styles.length; i++) {
      if (styleKey == styles[i]) {
        res = !0
        break
      }
    }
    return res
  },
  modeChanged: function (mode, t) {
    if (!this._checkMode(mode)) {
      return void (this._disableSizePositionRepeat = !1)
    }
    this._disableSizePositionRepeat = !0
    this.$.div.style.backgroundSize = 'auto auto'
    this.$.div.style.backgroundPosition = '0% 0%'
    this.$.div.style.backgroundRepeat = 'no-repeat'
    switch (mode) {
      case 'scaleToFill':
        this.$.div.style.backgroundSize = '100% 100%'
        break
      case 'aspectFit':
        ;(this.$.div.style.backgroundSize = 'contain'),
          (this.$.div.style.backgroundPosition = 'center center')
        break
      case 'aspectFill':
        ;(this.$.div.style.backgroundSize = 'cover'),
          (this.$.div.style.backgroundPosition = 'center center')
        break
      case 'widthFix':
        this.$.div.style.backgroundSize = '100% 100%'
        break
      case 'top':
        this.$.div.style.backgroundPosition = 'top center'
        break
      case 'bottom':
        this.$.div.style.backgroundPosition = 'bottom center'
        break
      case 'center':
        this.$.div.style.backgroundPosition = 'center center'
        break
      case 'left':
        this.$.div.style.backgroundPosition = 'center left'
        break
      case 'right':
        this.$.div.style.backgroundPosition = 'center right'
        break
      case 'top left':
        this.$.div.style.backgroundPosition = 'top left'
        break
      case 'top right':
        this.$.div.style.backgroundPosition = 'top right'
        break
      case 'bottom left':
        this.$.div.style.backgroundPosition = 'bottom left'
        break
      case 'bottom right':
        this.$.div.style.backgroundPosition = 'bottom right'
    }
  },
  backgroundSizeChanged: function (value, t) {
    this._disableSizePositionRepeat || (this.$.div.style.backgroundSize = value)
  },
  backgroundPositionChanged: function (value, t) {
    this._disableSizePositionRepeat ||
      (this.$.div.style.backgroundPosition = value)
  },
  backgroundRepeatChanged: function (value, t) {
    this._disableSizePositionRepeat ||
      (this.$.div.style.backgroundRepeat = value)
  }
})
