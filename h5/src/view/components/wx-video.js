// wx-video not on ios

var _slicedToArray = (function () {
  function sliceForIteratorObj (obj, length) {
    var res = []
    for (var val of obj) {
      res.push(val)
      if (length && res.length === length) break
    }
    return res
  }

  return function (obj, length) {
    if (Array.isArray(obj)) return obj
    if (Symbol.iterator in Object(obj)) return sliceForIteratorObj(obj, length)
    throw new TypeError('Invalid attempt to destructure non-iterable instance')
  }
})()
var Video
if (wx.getPlatform() !== 'ios') {
  Video = window.exparser.registerElement({
    is: 'wx-video',
    behaviors: ['wx-base', 'wx-player'],
    template:
      '\n      <div class="wx-video-container">\n        <video id="player" webkit-playsinline style="display: none;"></video>\n        <div id="default" class$="wx-video-bar {{_barType}}" style="display: none;">\n          <div id="controls" class="wx-video-controls">\n            <div id="button" class$="wx-video-button {{_buttonType}}"></div>\n            <div class="wx-video-time" parse-text-content>{{_currentTime}}</div>\n            <div id="progress" class="wx-video-progress">\n              <div id="ball" class="wx-video-ball" style$="left: {{_progressLeft}}px;">\n                <div class="wx-video-inner"></div>\n              </div>\n              <div class="wx-video-inner" style$="width: {{_progressLength}}px;"></div>\n            </div>\n            <div class="wx-video-time" parse-text-content>{{_duration}}</div>\n          </div>\n          <div id="danmuBtn" class$="wx-video-danmu-btn {{_danmuStatus}}" style="display: none">弹幕</div>\n          <div id="fullscreen" class="wx-video-fullscreen"></div>\n        </div>\n        <div id="danmu" class="wx-video-danmu" style="z-index: -9999">\n        </div>\n      </div>\n      <div id="fakebutton"></div>\n    ',
    properties: {
      hidden: {
        type: Boolean,
        value: !1,
        public: !0,
        observer: '_hiddenChanged'
      },
      autoplay: {
        type: Boolean,
        value: !1,
        public: !0
      },
      danmuBtn: {
        type: Boolean,
        value: !1,
        public: !0,
        observer: 'danmuBtnChanged'
      },
      enableDanmu: {
        type: Boolean,
        value: !1,
        observer: 'enableDanmuChanged',
        public: !0
      },
      enableFullScreen: {
        type: Boolean,
        value: !1,
        public: !0
      },
      controls: {
        type: Boolean,
        value: !0,
        public: !0,
        observer: 'controlsChanged'
      },
      danmuList: {
        type: Array,
        value: [],
        public: !0
      },
      objectFit: {
        type: String,
        value: 'contain',
        public: !0,
        observer: 'objectFitChanged'
      },
      duration: {
        type: Number,
        value: 0,
        public: !0,
        observer: 'durationChanged'
      },
      _videoId: {
        type: Number
      },
      _isLockTimeUpdateProgress: {
        type: Boolean,
        value: !1
      },
      _rate: {
        type: Number,
        value: 0
      },
      _progressLeft: {
        type: Number,
        value: -22
      },
      _progressLength: {
        type: Number,
        value: 0
      },
      _barType: {
        type: String,
        value: 'full'
      },
      _danmuStatus: {
        type: String,
        value: ''
      }
    },
    listeners: {
      'ball.touchstart': 'onBallTouchStart'
    },
    _reset: function () {
      this._buttonType = 'play'
      this._currentTime = '00:00'
      this._duration = this._formatTime(this.duration)
      this._progressLeft = -22
      this._progressLength = 0
      this._barType = this.controls ? 'full' : 'part'
    },
    _hiddenChanged: function (isHidden, t) {
      this.$.player.pause()
      this.$$.style.display = isHidden ? 'none' : ''
    },
    posterChanged: function (posterUrl, t) {
      this._isError || (this.$.player.poster = posterUrl)
    },
    srcChanged: function (srcURL, t) {
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
      if (!this._isError && srcURL) {
        var self = this
        /*
                 if (wx.getPlatform() === 'wechatdevtools') {
                 this.$.player.src = srcURL.replace(
                 'wdfile://',
                 'http://wxfile.open.weixin.qq.com/'
                 )
                 setTimeout(function () {
                 self._reset()
                 }, 0)
                 } else {
                 this.$.player.src = srcURL
                 setTimeout(function () {
                 self._reset()
                 }, 0)
                 }
                 */
        this.$.player.src = transformUrl(srcURL)
        setTimeout(function () {
          self._reset()
        }, 0)
      }
    },
    controlsChanged: function (show, t) {
      this.controls
        ? (this._barType = 'full')
        : this.danmuBtn ? (this._barType = 'part') : (this._barType = 'none')
      this.$.fullscreen.style.display = show ? 'block' : 'none'
      this.$.controls.style.display = show ? 'flex' : 'none'
    },
    objectFitChanged: function (objectFit, t) {
      this.$.player.style.objectFit = objectFit
    },
    durationChanged: function (duration, t) {
      console.log('durationChanged', duration)
      duration > 0 && (this._duration = this._formatTime(Math.floor(duration)))
    },
    danmuBtnChanged: function (isDanmuBtnShow, t) {
      this.controls
        ? (this._barType = 'full')
        : this.danmuBtn ? (this._barType = 'part') : (this._barType = 'none')
      this.$.danmuBtn.style.display = isDanmuBtnShow ? '' : 'none'
    },
    enableDanmuChanged: function (enableDanmu, t) {
      this._danmuStatus = enableDanmu ? 'active' : ''
      this.$.danmu.style.zIndex = enableDanmu ? '0' : '-9999'
    },
    actionChanged: function (action, t) {
      if (typeof action === 'object') {
        var method = action.method,
          data = action.data
        if (method === 'play') {
          this.$.player.play()
        } else if (method === 'pause') {
          this.$.player.pause()
        } else if (method === 'seek') {
          ;(this.$.player.currentTime = data[0]), this._resetDanmu()
        } else if (method === 'sendDanmu') {
          var danmuInfo = _slicedToArray(data, 2),
            txt = danmuInfo[0],
            color = danmuInfo[1],
            currentTime = parseInt(this.$.player.currentTime)
          this.danmuObject[currentTime]
            ? this.danmuObject[currentTime].push({
              text: txt,
              color: color,
              time: currentTime
            })
            : (this.danmuObject[currentTime] = [
              {
                text: txt,
                color: color,
                time: currentTime
              }
            ])
        }
      }
    },
    onPlay: function () {
      var self = this
      var damuItems = document.querySelectorAll('.wx-video-danmu-item')
      Array.prototype.forEach.apply(damuItems, [
        function (damuItem) {
          var transitionDuration =
            3 *
            (parseInt(getComputedStyle(damuItem).left) + damuItem.offsetWidth) /
            (damuItem.offsetWidth + self.$$.offsetWidth)
          damuItem.style.left = '-' + damuItem.offsetWidth + 'px'
          damuItem.style.transitionDuration = transitionDuration + 's'
          damuItem.style.webkitTransitionDuration = transitionDuration + 's'
        }
      ])
    },
    onPause: function (event) {
      var danmuItems = document.querySelectorAll('.wx-video-danmu-item')
      Array.prototype.forEach.apply(danmuItems, [
        function (danmu) {
          danmu.style.left = getComputedStyle(danmu).left
        }
      ])
    },
    onEnded: function (event) {},
    _computeRate: function (targetPos) {
      var elapsed = this.$.progress.getBoundingClientRect().left,
        totalLen = this.$.progress.offsetWidth,
        rate = (targetPos - elapsed) / totalLen
      rate < 0 ? (rate = 0) : rate > 1 && (rate = 1)
      return rate
    },
    _setProgress: function (rate) {
      this._progressLength = Math.floor(this.$.progress.offsetWidth * rate)
      this._progressLeft = this._progressLength - 22
    },
    _sendDanmu: function (data) {
      if (this.playing && !data.flag) {
        data.flag = !0
        var danmuItem = document.createElement('p')
        danmuItem.className += 'wx-video-danmu-item'
        danmuItem.textContent = data.text
        danmuItem.style.top = this._genDanmuPosition() + '%'
        danmuItem.style.color = data.color
        this.$.danmu.appendChild(danmuItem)
        danmuItem.style.left = '-' + danmuItem.offsetWidth + 'px'
      }
    },
    _genDanmuPosition: function () {
      if (this.lastDanmuPosition) {
        var danmuPos = 100 * Math.random()
        Math.abs(danmuPos - this.lastDanmuPosition) < 10
          ? (this.lastDanmuPosition = (this.lastDanmuPosition + 50) % 100)
          : (this.lastDanmuPosition = danmuPos)
      } else {
        this.lastDanmuPosition = 100 * Math.random()
      }
      return this.lastDanmuPosition
    },
    attached: function () {
      // var e = this
      var self = this
      HeraJSBridge.publish('videoPlayerInsert', {
        domId: this.id,
        videoPlayerId: 0
      })
      this.$.default.style.display = ''
      this.$.player.style.display = ''
      this.$.player.autoplay = this.autoplay
      this.$.player.style.objectFit = this.objectFit
      console.log('attached', this.objectFit)
      this.danmuObject = this.danmuList.reduce(function (acc, danmu) {
        if (
          typeof danmu.time === 'number' &&
          danmu.time >= 0 &&
          typeof danmu.text === 'string' &&
          danmu.text.length > 0
        ) {
          if (acc[danmu.time]) {
            acc[danmu.time].push({
              text: danmu.text,
              color: danmu.color || '#ffffff'
            })
          } else {
            acc[danmu.time] = [
              {
                text: danmu.text,
                color: danmu.color || '#ffffff'
              }
            ]
          }
        }
        return acc
      }, {})
      this.$.button.onclick = function (event) {
        event.stopPropagation()
        self.$.player[self._buttonType]()
      }
      this.$.progress.onclick = function (event) {
        event.stopPropagation()
        var rate = self._computeRate(event.clientX)
        self.$.player.currentTime = self.$.player.duration * rate
        self._resetDanmu()
      }
      this.$.fullscreen.onclick = function (event) {
        event.stopPropagation()
        wx.getPlatform() === 'android'
          ? (self.enableFullScreen = !0)
          : (self.enableFullScreen = !self.enableFullScreen)
        self.enableFullScreen && self.$.player.webkitEnterFullscreen()
        self.triggerEvent('togglefullscreen', {
          enable: self.enableFullScreen
        })
      }
      this.$.danmuBtn.onclick = function (event) {
        event.stopPropagation()
        self.enableDanmu = !self.enableDanmu
        self.triggerEvent('toggledanmu', {
          enable: self.enableDanmu
        })
      }

      HeraJSBridge.subscribe('video_' + this.id + '_actionChanged', function (
        res
      ) {
        self.action = res
        self.actionChanged(res)
      })
    },
    onTimeUpdate: function (event) {
      var self = this
      event.stopPropagation()
      var rate = this.$.player.currentTime / this.$.player.duration
      this._isLockTimeUpdateProgress || this._setProgress(rate)
      var danmuList = this.danmuObject[parseInt(this.$.player.currentTime)]
      void 0 !== danmuList &&
        danmuList.length > 0 &&
        danmuList.forEach(function (danmu) {
          self._sendDanmu(danmu)
        })
    },
    detached: function () {},
    onBallTouchStart: function () {
      if (!this.isLive) {
        var self = this
        self._isLockTimeUpdateProgress = !0
        var touchMoveHandler = function (event) {
          event.stopPropagation()
          event.preventDefault()
          self._rate = self._computeRate(event.touches[0].clientX)
          self._setProgress(self._rate)
        }
        var touchEndHandler = function touchEndHandler (event) {
          self.$.player.currentTime = self.$.player.duration * self._rate
          document.removeEventListener('touchmove', touchMoveHandler)
          document.removeEventListener('touchend', touchEndHandler)
          self._isLockTimeUpdateProgress = !1
          self._resetDanmu()
        }
        document.addEventListener('touchmove', touchMoveHandler)
        document.addEventListener('touchend', touchEndHandler)
      }
    },
    _resetDanmu: function () {
      var self = this
      this.$.danmu.innerHTML = ''
      Object.keys(this.danmuObject).forEach(function (danmuListKey) {
        self.danmuObject[danmuListKey].forEach(function (danmu) {
          danmu.flag = !1
        })
      })
    }
  })
}

// wx-video on ios
if (wx.getPlatform() === 'ios') {
  Video = window.exparser.registerElement({
    is: 'wx-video',
    behaviors: ['wx-base', 'wx-player', 'wx-native'],
    template:
      '\n      <div class="wx-video-container">\n        <video id="player" webkit-playsinline style="display: none;"></video>\n        <div id="default" class$="wx-video-bar {{_barType}}" style="display: none;">\n          <div id="controls" class="wx-video-controls">\n            <div id="button" class$="wx-video-button {{_buttonType}}"></div>\n            <div class="wx-video-time" parse-text-content>{{_currentTime}}</div>\n            <div id="progress" class="wx-video-progress">\n              <div id="ball" class="wx-video-ball" style$="left: {{_progressLeft}}px;">\n                <div class="wx-video-inner"></div>\n              </div>\n              <div class="wx-video-inner" style$="width: {{_progressLength}}px;"></div>\n            </div>\n            <div class="wx-video-time" parse-text-content>{{_duration}}</div>\n          </div>\n          <div id="danmuBtn" class$="wx-video-danmu-btn {{_danmuStatus}}" style="display: none">弹幕</div>\n          <div id="fullscreen" class="wx-video-fullscreen"></div>\n        </div>\n        <div id="danmu" class="wx-video-danmu" style="z-index: -9999">\n        </div>\n      </div>\n      <div id="fakebutton"></div>\n    ',
    properties: {
      autoplay: {
        type: Boolean,
        value: !1,
        public: !0
      },
      bindplay: {
        type: String,
        value: '',
        public: !0
      },
      bindpause: {
        type: String,
        value: '',
        public: !0,
        observer: 'handlersChanged'
      },
      bindended: {
        type: String,
        value: '',
        public: !0,
        observer: 'handlersChanged'
      },
      bindtimeupdate: {
        type: String,
        value: '',
        public: !0,
        observer: 'handlersChanged'
      },
      danmuBtn: {
        type: Boolean,
        value: !1,
        public: !0,
        observer: 'danmuBtnChanged'
      },
      enableDanmu: {
        type: Boolean,
        value: !1,
        observer: 'enableDanmuChanged',
        public: !0
      },
      enableFullScreen: {
        type: Boolean,
        value: !1,
        public: !0
      },
      controls: {
        type: Boolean,
        value: !0,
        public: !0,
        observer: 'controlsChanged'
      },
      danmuList: {
        type: Array,
        value: [],
        public: !0
      },
      objectFit: {
        type: String,
        value: 'contain',
        public: !0
      },
      duration: {
        type: Number,
        value: 0,
        public: !0
      },
      _videoId: {
        type: Number
      },
      _isLockTimeUpdateProgress: {
        type: Boolean,
        value: !1
      },
      _rate: {
        type: Number,
        value: 0
      },
      _progressLeft: {
        type: Number,
        value: -22
      },
      _progressLength: {
        type: Number,
        value: 0
      },
      _barType: {
        type: String,
        value: 'full'
      },
      _danmuStatus: {
        type: String,
        value: ''
      }
    },
    listeners: {
      'ball.touchstart': 'onBallTouchStart'
    },
    handlersChanged: function () {
      this._update()
    },
    _reset: function () {
      this._buttonType = 'play'
      this._currentTime = '00:00'
      this._duration = '00:00'
      this._progressLeft = -22
      this._progressLength = 0
      this._barType = this.controls ? 'full' : 'part'
    },
    _update: function () {
      var opt =
          arguments.length <= 0 || void 0 === arguments[0] ? {} : arguments[0],
        _this = this
      opt.videoPlayerId = this._videoId
      opt.hide = this.hidden
      var _data = this._getData()
      opt.needEvent = Object.keys(_data.handlers).length > 0
      opt.objectFit = this.objectFit
      opt.showBasicControls = this.controls
      opt.showDanmuBtn = this.danmuBtn
      opt.enableDanmu = this.enableDanmu
      opt.data = JSON.stringify(_data)
      this.duration > 0 && (opt.duration = this.duration)
      HeraJSBridge.invoke('updateVideoPlayer', opt, function (data) {
        ;/ok/.test(data.errMsg) ||
          _this._publish('error', {
            errMsg: data.errMsg
          })
      })
    },
    _updatePosition: function () {
      if (this._isiOS()) {
        this._update(
          {
            position: this._box
          },
          '位置'
        )
      } else {
        this.$.player.width = this._box.width
        this.$.player.height = this._box.height
      }
    },
    _hiddenChanged: function (isHidden) {
      if (this._isiOS()) {
        this.$$.style.display = isHidden ? 'none' : ''
        this._update(
          {
            hide: isHidden
          },
          isHidden ? '隐藏' : '显示'
        )
      } else {
        this.$.player.pause()
        this.$$.style.display = isHidden ? 'none' : ''
      }
    },
    posterChanged: function (posterUrl, t) {
      if (!this._isError) {
        if (this._isReady) {
          this._isiOS() &&
          (/http:\/\//.test(posterUrl) || /https:\/\//.test(posterUrl))
            ? this._update(
              {
                poster: posterUrl
              },
                '封面'
              )
            : (this.$.player.poster = posterUrl)
          return void 0
        } else {
          this._deferred.push({
            callback: 'posterChanged',
            args: [posterUrl, t]
          })
          return void 0
        }
      }
    },
    srcChanged: function (srcUrl, t) {
      if (!this._isError && srcUrl) {
        if (!this._isReady) {
          return void this._deferred.push({
            callback: 'srcChanged',
            args: [srcUrl, t]
          })
        }
        if (this._isiOS()) {
          ;/wdfile:\/\//.test(srcUrl) ||
          /http:\/\//.test(srcUrl) ||
          /https:\/\//.test(srcUrl)
            ? this._update(
              {
                filePath: srcUrl
              },
                '资源'
              )
            : this._publish('error', {
              errMsg: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
            })
        } else if (this._isDevTools()) {
          this.$.player.src = srcUrl.replace(
            'wdfile://',
            'http://wxfile.open.weixin.qq.com/'
          )
          var self = this
          setTimeout(function () {
            self._reset()
          }, 0)
        } else {
          this.$.player.src = srcUrl
          var self = this
          setTimeout(function () {
            self._reset()
          }, 0)
        }
      }
    },
    controlsChanged: function (show, t) {
      this._update({})
      this.$.controls.style.display = show ? 'flex' : 'none'
    },
    danmuBtnChanged: function (show, t) {
      this._update({})
      this.$.danmuBtn.style.display = show ? '' : 'none'
    },
    enableDanmuChanged: function (isActive, t) {
      this._update({})
      this._danmuStatus = isActive ? 'active' : ''
      this.$.danmu.style.zIndex = isActive ? '0' : '-9999'
    },
    actionChanged: function (action, t) {
      if (this._isiOS()) {
      } else {
        if (typeof action !== 'object') return
        var method = action.method,
          data = action.data
        if (method === 'play') {
          this.$.player.play()
        } else if (method === 'pause') {
          this.$.player.pause()
        } else if (method === 'seek') {
          this.$.player.currentTime = data[0]
          this._resetDanmu()
        } else if (method === 'sendDanmu') {
          var danmuData = _slicedToArray(data, 2),
            txt = danmuData[0],
            color = danmuData[1],
            time = parseInt(this.$.player.currentTime)
          this.danmuObject[time]
            ? this.danmuObject[time].push({
              text: txt,
              color: color,
              time: time
            })
            : (this.danmuObject[time] = [
              {
                text: txt,
                color: color,
                time: time
              }
            ])
        }
      }
    },
    onPlay: function (e) {
      var self = this,
        danmuItems = document.querySelectorAll('.wx-video-danmu-item')
      Array.prototype.forEach.apply(danmuItems, [
        function (danmuItem) {
          var transitionDuration =
            3 *
            (parseInt(getComputedStyle(danmuItem).left) +
              danmuItem.offsetWidth) /
            (danmuItem.offsetWidth + self.$$.offsetWidth)
          danmuItem.style.left = '-' + danmuItem.offsetWidth + 'px'
          danmuItem.style.transitionDuration =
            transitionDuration + 'checkScrollBottom'
          danmuItem.style.webkitTransitionDuration =
            transitionDuration + 'checkScrollBottom'
        }
      ])
      this.bindplay &&
        wx.publishPageEvent(this.bindplay, {
          type: 'play'
        })
    },
    onPause: function (e) {
      var danmuItems = document.querySelectorAll('.wx-video-danmu-item')
      Array.prototype.forEach.apply(danmuItems, [
        function (danmuItem) {
          danmuItem.style.left = getComputedStyle(danmuItem).left
        }
      ]),
        wx.publishPageEvent(this.bindpause, {
          type: 'pause'
        })
    },
    onEnded: function (e) {
      wx.publishPageEvent(this.bindended, {
        type: 'ended'
      })
    },
    _computeRate: function (targetPos) {
      var elapsed = this.$.progress.getBoundingClientRect().left,
        totalTime = this.$.progress.offsetWidth,
        rate = (targetPos - elapsed) / totalTime
      rate < 0 ? (rate = 0) : rate > 1 && (rate = 1)
      return rate
    },
    _setProgress: function (rate) {
      this._progressLength = Math.floor(this.$.progress.offsetWidth * rate)
      this._progressLeft = this._progressLength - 22
    },
    _sendDanmu: function (data) {
      if (this.playing && !data.flag) {
        data.flag = !0
        var danmuEle = document.createElement('p')
        danmuEle.className += 'wx-video-danmu-item'
        danmuEle.textContent = data.text
        danmuEle.style.top = this._genDanmuPosition() + '%'
        danmuEle.style.color = data.color
        this.$.danmu.appendChild(danmuEle)
        danmuEle.style.left = '-' + danmuEle.offsetWidth + 'px'
      }
    },
    _genDanmuPosition: function () {
      if (this.lastDanmuPosition) {
        var danmuPos = 100 * Math.random()
        Math.abs(danmuPos - this.lastDanmuPosition) < 10
          ? (this.lastDanmuPosition = (this.lastDanmuPosition + 50) % 100)
          : (this.lastDanmuPosition = danmuPos)
      } else {
        this.lastDanmuPosition = 100 * Math.random()
      }
      return this.lastDanmuPosition
    },
    attached: function () {
      var self2 = this,
        self = this
      if (this._isiOS()) {
        this._box = this._getBox()
        var data = this._getData()
        var opt = {
          data: JSON.stringify(data),
          needEvent: Object.keys(data.handlers).length > 0,
          position: this._box,
          hide: this.hidden,
          enableDanmu: this.enableDanmu,
          showDanmuBtn: this.danmuBtn,
          showBasicControls: this.controls,
          objectFit: this.objectFit,
          autoplay: this.autoplay,
          danmuList: this.danmuList
        }
        this.duration > 0 && (opt.duration = this.duration)
        HeraJSBridge.invoke('insertVideoPlayer', opt, function (res) {
          if (/ok/.test(res.errMsg)) {
            self._videoId = res.videoPlayerId
            self._ready()
            self.createdTimestamp = Date.now()
            document.addEventListener(
              'pageReRender',
              self._pageReRenderCallback.bind(self)
            )
            HeraJSBridge.publish('videoPlayerInsert', {
              domId: self.id,
              videoPlayerId: res.videoPlayerId
            })
          } else {
            self._isError = !0
            self.$$.style.display = 'none'
            self._publish('error', {
              errMsg: res.errMsg
            })
          }
        })
      } else {
        HeraJSBridge.publish('videoPlayerInsert', {
          domId: this.id,
          videoPlayerId: 0
        })
      }
      this.$.default.style.display = ''
      this.$.player.style.display = ''
      this.$.player.autoplay = this.autoplay
      this.danmuObject = this.danmuList.reduce(function (acc, danmuItem) {
        if (
          typeof danmuItem.time === 'number' &&
          danmuItem.time >= 0 &&
          typeof danmuItem.text === 'string' &&
          danmuItem.text.length > 0
        ) {
          if (acc[danmuItem.time]) {
            acc[danmuItem.time].push({
              text: danmuItem.text,
              color: danmuItem.color || '#ffffff'
            })
          } else {
            acc[danmuItem.time] = [
              {
                text: danmuItem.text,
                color: danmuItem.color || '#ffffff'
              }
            ]
          }
        }

        return acc
      }, {})
      this.$.button.onclick = function (event) {
        event.stopPropagation(), self.$.player[self._buttonType]()
      }
      this.$.progress.onclick = function (event) {
        event.stopPropagation()
        var rate = self._computeRate(event.clientX)
        self.$.player.currentTime = self.$.player.duration * rate
        self._resetDanmu()
      }
      this.$.fullscreen.onclick = function (event) {
        event.stopPropagation()
        self.enableFullScreen = !self.enableFullScreen
        self.enableFullScreen && self.$.player.webkitEnterFullscreen()
        self.triggerEvent('togglefullscreen', {
          enable: self.enableFullScreen
        })
      }
      this.$.danmuBtn.onclick = function (event) {
        event.stopPropagation()
        self.enableDanmu = !self.enableDanmu
        self.triggerEvent('toggledanmu', {
          enable: self.enableDanmu
        })
      }
      this._ready()
      document.addEventListener(
        'pageReRender',
        this._pageReRenderCallback.bind(this)
      )
      HeraJSBridge.subscribe('video_' + this.id + '_actionChanged', function (
        res
      ) {
        self2.action = res
        self2.actionChanged(res)
      })
    },
    onTimeUpdate: function (event) {
      var self = this
      event.stopPropagation()
      var rate = this.$.player.currentTime / this.$.player.duration
      this._isLockTimeUpdateProgress || this._setProgress(rate)
      var danmuList = this.danmuObject[parseInt(this.$.player.currentTime)]
      void 0 !== danmuList &&
        danmuList.length > 0 &&
        danmuList.forEach(function (danmu) {
          self._sendDanmu(danmu)
        })
      this.bindtimeupdate &&
        wx.publishPageEvent(this.bindtimeupdate, {
          type: 'timeupdate',
          detail: {
            currentTime: this.$.player.currentTime,
            duration: this.$.player.duration
          }
        })
    },
    detached: function () {
      this._isiOS() &&
        wx.removeVideoPlayer({
          videoPlayerId: this._videoId,
          success: function (e) {}
        }),
        HeraJSBridge.publish('videoPlayerRemoved', {
          domId: this.id,
          videoPlayerId: this.videoPlayerId
        })
    },
    onBallTouchStart: function () {
      var self = this
      self._isLockTimeUpdateProgress = !0
      var touchmove = function (event) {
        event.stopPropagation()
        event.preventDefault()
        self._rate = self._computeRate(event.touches[0].clientX)
        self._setProgress(self._rate)
      }
      var touchend = function touchend (event) {
        self.$.player.currentTime = self.$.player.duration * self._rate
        document.removeEventListener('touchmove', touchmove)
        document.removeEventListener('touchend', touchend)
        self._isLockTimeUpdateProgress = !1
        self._resetDanmu()
      }
      document.addEventListener('touchmove', touchmove)
      document.addEventListener('touchend', touchend)
    },
    _resetDanmu: function () {
      var self = this
      this.$.danmu.innerHTML = ''
      Object.keys(this.danmuObject).forEach(function (danmuListKey) {
        self.danmuObject[danmuListKey].forEach(function (danmu) {
          danmu.flag = !1
        })
      })
    },
    _getData: function () {
      var self = this
      return {
        handlers: [
          'bindplay',
          'bindpause',
          'bindended',
          'bindtimeupdate'
        ].reduce(function (acc, handlerName) {
          handlerName && (acc[handlerName] = self[handlerName])
          return acc
        }, {}),
        event: {
          target: {
            dataset: this.dataset,
            id: this.$$.id,
            offsetTop: this.$$.offsetTop,
            offsetLeft: this.$$.offsetLeft
          },
          currentTarget: {
            dataset: this.dataset,
            id: this.$$.id,
            offsetTop: this.$$.offsetTop,
            offsetLeft: this.$$.offsetLeft
          }
        },
        createdTimestamp: this.createdTimestamp
      }
    }
  })
}

export default Video
