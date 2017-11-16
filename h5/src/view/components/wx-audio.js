// wx-audio

export default window.exparser.registerElement({
  is: 'wx-audio',
  behaviors: ['wx-base', 'wx-player'],
  template:
    '<audio id="player" loop$="{{loop}}" style="display: none;"></audio>\n  <div id="default" class="wx-audio-default" style="display: none;">\n    <div id="poster" class="wx-audio-left">\n      <div id="button" class$="wx-audio-button {{_buttonType}}"></div>\n    </div>\n    <div class="wx-audio-right">\n      <div class="wx-audio-time" parse-text-content>{{_currentTime}}</div>\n      <div class="wx-audio-info">\n        <div class="wx-audio-name" parse-text-content>{{name}}</div>\n        <div class="wx-audio-author" parse-text-content>{{author}}</div>\n      </div>\n    </div>\n  </div>\n  <div id="fakebutton"></div>',
  properties: {
    action: {
      type: Object,
      observer: 'actionChanged',
      public: !0
    },
    name: {
      type: String,
      value: '未知歌曲',
      public: !0
    },
    author: {
      type: String,
      value: '未知作者',
      public: !0
    },
    loop: {
      type: Boolean,
      value: !1,
      public: !0
    },
    controls: {
      type: Boolean,
      value: !1,
      observer: 'controlsChanged',
      public: !0
    },
    _srcTimer: {
      type: Number
    },
    _actionTimer: {
      type: Number
    },
    _canSrc: {
      type: Boolean,
      value: !0
    },
    _deferredSrc: {
      type: String,
      value: ''
    },
    _canAction: {
      type: Boolean,
      value: !1
    },
    _deferredAction: {
      type: Array,
      value: []
    }
  },
  _reset: function () {
    ;(this._buttonType = 'play'),
      (this._currentTime = '00:00'),
      (this._duration = '00:00')
  },
  _readySrc: function () {
    this._canSrc = !0
    this.srcChanged(this._deferredSrc)
    this._deferredSrc = ''
  },
  _readyAction: function () {
    var self = this
    this._canAction = !0
    this._deferredAction.forEach(function (t) {
      self.actionChanged(t)
    }, this)
    this._deferredAction = []
  },
  srcChanged: function (src, t) {
    function transformUrl (uri) {
      if (!/https?:/i.test(uri)) {
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
    if (src) {
      clearTimeout(this._srcTimer)
      this._canAction = !1
      this.$.player.src = transformUrl(src)
      var self = this
      this._srcTimer = setTimeout(function () {
        self._reset()
        self._readyAction()
      }, 0)
    }
  },
  posterChanged: function (url, t) {
    this.$.poster.style.backgroundImage = "url('" + url + "')"
  },
  controlsChanged: function (show, t) {
    this.$.default.style.display = show ? '' : 'none'
  },
  actionChanged: function (act, t) {
    var self = this
    if (act) {
      var method = act.method
      this.action = act
      if (!this._canAction && method !== 'setSrc') {
        return void this._deferredAction.push(act)
      }
      var pattern = null
      if ((pattern = /^set([a-z|A-Z]*)/.exec(method)) != null) {
        var mkey = pattern[1],
          data = act.data
        mkey = mkey[0].toLowerCase() + mkey.slice(1)
        mkey == 'currentTime'
          ? this.$.player.readyState === 0 || this.$.player.readyState === 1
            ? !(function () {
              var fn = function () {
                self.$.player[mkey] = data
                self.$.player.removeEventListener('canplay', fn, !1)
              }
              self.$.player.addEventListener('canplay', fn, !1)
            })()
            : (this.$.player[mkey] = data)
          : mkey === 'src'
            ? this.srcChanged(data)
            : this.triggerEvent('error', {
              errMsg: method + ' is not an action'
            })
      } else if (method == 'play' || method == 'pause') {
        if (this.isBackground === !0 && method === 'play') return
        this.$.fakebutton.click()
      } else {
        this.triggerEvent('error', {
          errMsg: method + ' is not an action'
        })
      }
      this.action = null
    }
  },
  attached: function () {
    var self = this,
      player = this.$.player
    this.$.button.onclick = function (e) {
      e.stopPropagation()
      self.action = {
        method: self._buttonType
      }
    }
    this.$.fakebutton.onclick = function (event) {
      event.stopPropagation()
      self.action &&
        typeof player[self.action.method] === 'function' &&
        player[self.action.method]()
    }
    HeraJSBridge.subscribe('audio_' + this.id + '_actionChanged', function (t) {
      self.action = t
    })
    HeraJSBridge.publish('audioInsert', {
      audioId: this.id
    })
    wx.onAppEnterBackground(function (t) {
      self.$.player.pause()
      self.isBackground = !0
    })
    wx.onAppEnterForeground(function (t) {
      self.isBackground = !1
    })
  }
})
