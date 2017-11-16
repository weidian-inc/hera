// wx-scroll-view
export default window.exparser.registerElement({
  is: 'wx-scroll-view',
  template:
    '\n    <div id="main" class="wx-scroll-view" style$="overflow-x: hidden; overflow-y: hidden;">\n      <slot></slot>\n    </div>\n  ',
  behaviors: ['wx-base', 'wx-touchtrack'],
  properties: {
    scrollX: {
      type: Boolean,
      value: !1,
      public: !0,
      observer: '_scrollXChanged'
    },
    scrollY: {
      type: Boolean,
      value: !1,
      public: !0,
      observer: '_scrollYChanged'
    },
    upperThreshold: {
      type: Number,
      value: 50,
      public: !0
    },
    lowerThreshold: {
      type: Number,
      value: 50,
      public: !0
    },
    scrollTop: {
      type: Number,
      coerce: '_scrollTopChanged',
      public: !0
    },
    scrollLeft: {
      type: Number,
      coerce: '_scrollLeftChanged',
      public: !0
    },
    scrollIntoView: {
      type: String,
      coerce: '_srollIntoViewChanged',
      public: !0
    }
  },
  created: function () {
    this._lastScrollTop = this.scrollTop || 0
    this._lastScrollLeft = this.scrollLeft || 0
    this.touchtrack(this.$.main, '_handleTrack')
  },
  attached: function () {
    var self = this
    this._scrollTopChanged(this.scrollTop)
    this._scrollLeftChanged(this.scrollLeft)
    this._srollIntoViewChanged(this.scrollIntoView)
    this.__handleScroll = function (t) {
      t.preventDefault(),
        t.stopPropagation(),
        self._handleScroll.bind(self, t)()
    }
    this.__handleTouchMove = function (t) {
      self._checkBounce()
      var py = t.touches[0].pageY,
        main = self.$.main
      self.__touchStartY < py
        ? main.scrollTop > 0 && t.stopPropagation()
        : main.scrollHeight > main.offsetHeight + main.scrollTop &&
          t.stopPropagation()
    }
    this.__handleTouchStart = function (t) {
      ;(self.__touchStartY = t.touches[0].pageY),
        HeraJSBridge.invoke(
          'disableScrollBounce',
          {
            disable: !0
          },
          function () {}
        )
      var main = self.$.main
      ;(self._touchScrollTop = self.$.main.scrollTop),
        (self._touchScrollLeft = self.$.main.scrollLeft),
        (self._touchScrollBottom =
          self._touchScrollTop + main.offsetHeight === main.scrollHeight),
        (self._touchScrollRight =
          self._touchScrollLeft + main.offsetWidth === main.scrollWidth)
    }
    this.__handleTouchEnd = function () {
      HeraJSBridge.invoke(
        'disableScrollBounce',
        {
          disable: !1
        },
        function () {}
      )
    }
    this.$.main.addEventListener('touchstart', this.__handleTouchStart)
    this.$.main.addEventListener('touchmove', this.__handleTouchMove)
    this.$.main.addEventListener('touchend', this.__handleTouchEnd)
    this.$.main.addEventListener('scroll', this.__handleScroll)
    this.$.main.style.overflowX = this.scrollX ? 'auto' : 'hidden'
    this.$.main.style.overflowY = this.scrollY ? 'auto' : 'hidden'
    var ua = window.navigator.userAgent.toLowerCase()
    if (/iphone/.test(ua)) {
      document.getElementById('__scroll_view_hack') &&
        document.body.removeChild(document.getElementById('__scroll_view_hack'))
      var div = document.createElement('div')
      div.setAttribute(
        'style',
        'position: fixed; left: 0; bottom: 0; line-height: 1; font-size: 1px; z-index: 10000; border-radius: 4px; box-shadow: 0 0 8px rgba(0,0,0,.4); width: 1px; height: 1px; overflow: hidden;'
      )
      div.innerText = '.'
      div.id = '__scroll_view_hack'
      document.body.appendChild(div)
    }
  },
  detached: function () {
    this.$.main.removeEventListener('scroll', this.__handleScroll),
      this.$.main.removeEventListener('touchstart', this.__handleTouchStart),
      this.$.main.removeEventListener('touchmove', this.__handleTouchMove),
      this.$.main.removeEventListener('touchend', this.__handleTouchEnd)
  },
  _getStyle: function (e, t) {
    var ox = e ? 'auto' : 'hidden',
      oy = t ? 'auto' : 'hidden'
    return 'overflow-x: ' + ox + '; overflow-y: ' + oy + ';'
  },
  _handleTrack: function (e) {
    return e.detail.state === 'start'
      ? ((this._x = e.detail.x),
        (this._y = e.detail.y),
        void (this._noBubble = null))
      : (e.detail.state === 'end' && (this._noBubble = !1),
        this._noBubble === null &&
          this.scrollY &&
          (Math.abs(this._y - e.detail.y) / Math.abs(this._x - e.detail.x) > 1
            ? (this._noBubble = !0)
            : (this._noBubble = !1)),
        this._noBubble === null &&
          this.scrollX &&
          (Math.abs(this._x - e.detail.x) / Math.abs(this._y - e.detail.y) > 1
            ? (this._noBubble = !0)
            : (this._noBubble = !1)),
        (this._x = e.detail.x),
        (this._y = e.detail.y),
        void (this._noBubble && e.stopPropagation()))
  },
  _handleScroll: function (e) {
    this._bounce ||
      (clearTimeout(this._timeout),
      (this._timeout = setTimeout(
        function () {
          var main = this.$.main
          if (
            (this.triggerEvent('scroll', {
              scrollLeft: main.scrollLeft,
              scrollTop: main.scrollTop,
              scrollHeight: main.scrollHeight,
              scrollWidth: main.scrollWidth,
              deltaX: this._lastScrollLeft - main.scrollLeft,
              deltaY: this._lastScrollTop - main.scrollTop
            }),
            this.scrollY)
          ) {
            var goTop = this._lastScrollTop - main.scrollTop > 0,
              goBottom = this._lastScrollTop - main.scrollTop < 0
            main.scrollTop <= this.upperThreshold &&
              goTop &&
              this.triggerEvent('scrolltoupper', {
                direction: 'top'
              })
            main.scrollTop + main.offsetHeight + this.lowerThreshold >=
              main.scrollHeight &&
              goBottom &&
              this.triggerEvent('scrolltolower', {
                direction: 'bottom'
              })
          }
          if (this.scrollX) {
            var goLeft = this._lastScrollLeft - main.scrollLeft > 0,
              goRight = this._lastScrollLeft - main.scrollLeft < 0
            main.scrollLeft <= this.upperThreshold &&
              goLeft &&
              this.triggerEvent('scrolltoupper', {
                direction: 'left'
              })
            main.scrollLeft +
              main.offset__wxConfigWidth +
              this.lowerThreshold >=
              main.scrollWidth &&
              goRight &&
              this.triggerEvent('scrolltolower', {
                direction: 'right'
              })
          }
          ;(this.scrollTop = this._lastScrollTop = main.scrollTop),
            (this.scrollLeft = this._lastScrollLeft = main.scrollLeft)
        }.bind(this),
        50
      )))
  },
  _checkBounce: function () {
    var self = this,
      main = self.$.main
    self._touchScrollTop === 0 &&
      (!self._bounce && main.scrollTop < 0 && (self._bounce = !0),
      self._bounce && main.scrollTop > 0 && (self._bounce = !1))
    self._touchScrollLeft === 0 &&
      (!self._bounce && main.scrollLeft < 0 && (self._bounce = !0),
      self._bounce && main.scrollLeft > 0 && (self._bounce = !1))
    self._touchScrollBottom &&
      (!self._bounce &&
        main.scrollTop > self._touchScrollTop &&
        (self._bounce = !0),
      self._bounce &&
        main.scrollTop < self._touchScrollTop &&
        (self._bounce = !1))
    self._touchScrollRight &&
      (!self._bounce &&
        main.scrollLeft > self._touchScrollLeft &&
        (self._bounce = !0),
      self._bounce &&
        main.scrollLeft < self._touchScrollLeft &&
        (self._bounce = !1))
  },
  _scrollXChanged: function (e) {
    this.$.main.style.overflowX = e ? 'auto' : 'hidden'
  },
  _scrollYChanged: function (e) {
    this.$.main.style.overflowY = e ? 'auto' : 'hidden'
  },
  _scrollTopChanged: function (e) {
    this.scrollY && (this.$.main.scrollTop = e)
  },
  _scrollLeftChanged: function (e) {
    this.scrollX && (this.$.main.scrollLeft = e)
  },
  _srollIntoViewChanged: function (id) {
    if (id) {
      if (Number(id[0]) >= 0 && Number(id[0]) <= 9) {
        return (
          console.group('scroll-into-view="' + id + '" 有误'),
          console.warn('id属性不能以数字开头'),
          void console.groupEnd()
        )
      }
      var ele = this.$$.querySelector('#' + id)
      ele && (this.$.main.scrollTop = ele.offsetTop)
    }
  }
})
