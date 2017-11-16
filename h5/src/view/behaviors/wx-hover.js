// wx-hover
export default window.exparser.registerBehavior({
    is: 'wx-hover',
    properties: {
        hoverStartTime: {
            type: Number,
            value: 50,
            public: !0
        },
        hoverStayTime: {
            type: Number,
            value: 400,
            public: !0
        },
        hoverClass: {
            type: String,
            value: '',
            public: !0,
            observer: '_hoverClassChange'
        },
        hoverStyle: {
            type: String,
            value: '',
            public: !0
        },
        hover: {
            type: Boolean,
            value: !1,
            public: !0,
            observer: '_hoverChanged'
        }
    },
    attached: function () {
        this.hover &&
        this.hoverStyle != 'none' &&
        this.hoverClass != 'none' &&
        (this.bindHover(), this._hoverClassChange(this.hoverClass))
    },
    isScrolling: function () {
        for (var ele = this.$$; ele; ele = ele.parentNode) {
            var wxElement = ele.__wxElement || ele
            if (
                wxElement.__wxScrolling &&
                Date.now() - wxElement.__wxScrolling < 50
            ) {
                return !0
            }
        }
        return !1
    },
    detached: function () {
        this.unbindHover()
    },
    _hoverChanged: function (bind, t) {
        bind ? this.bindHover() : this.unbindHover()
    },
    _hoverClassChange: function (className) {
        var classArr = className.split(/\s/)
        this._hoverClass = []
        for (var n = 0; n < classArr.length; n++) {
            classArr[n] && this._hoverClass.push(classArr[n])
        }
    },
    bindHover: function () {
        this._hoverTouchStart = this.hoverTouchStart.bind(this)
        this._hoverTouchEnd = this.hoverTouchEnd.bind(this)
        this._hoverCancel = this.hoverCancel.bind(this)
        this._hoverTouchMove = this.hoverTouchMove.bind(this)
        this.$$.addEventListener('touchstart', this._hoverTouchStart)
        window.__DOMTree__.addListener('canceltap', this._hoverCancel)
        window.addEventListener('touchcancel', this._hoverCancel, !0)
        window.addEventListener('touchmove', this._hoverTouchMove, !0)
        window.addEventListener('touchend', this._hoverTouchEnd, !0)
    },
    unbindHover: function () {
        this.$$.removeEventListener('touchstart', this._hoverTouchStart)
        window.__DOMTree__.removeListener('canceltap', this._hoverCancel)
        window.removeEventListener('touchcancel', this._hoverCancel, !0)
        window.removeEventListener('touchmove', this._hoverTouchMove, !0)
        window.removeEventListener('touchend', this._hoverTouchEnd, !0)
    },
    hoverTouchMove: function (e) {
        this.hoverCancel()
    },
    hoverTouchStart: function (event) {
        var self = this
        if (!this.isScrolling()) {
            this.__touch = !0
            if (
                this.hoverStyle == 'none' ||
                this.hoverClass == 'none' ||
                this.disabled
            );
            else {
                if (event.touches.length > 1) return
                if (window.__hoverElement__) {
                    window.__hoverElement__._hoverReset()
                    window.__hoverElement__ = void 0
                }
                this.__hoverStyleTimeId = setTimeout(function () {
                    self.__hovering = !0
                    window.__hoverElement__ = self
                    if (self._hoverClass && self._hoverClass.length > 0) {
                        for (var e = 0; e < self._hoverClass.length; e++) {
                            self.$$.classList.add(self._hoverClass[e])
                        }
                    } else {
                        self.$$.classList.add(self.is.replace('wx-', '') + '-hover')
                    }
                    self.__touch ||
                    window.requestAnimationFrame(function () {
                        clearTimeout(self.__hoverStayTimeId)
                        self.__hoverStayTimeId = setTimeout(function () {
                            self._hoverReset()
                        }, self.hoverStayTime)
                    })
                }, this.hoverStartTime)
            }
        }
    },
    hoverTouchEnd: function () {
        var self = this
        this.__touch = !1
        if (this.__hovering) {
            clearTimeout(this.__hoverStayTimeId)
            window.requestAnimationFrame(function () {
                self.__hoverStayTimeId = setTimeout(function () {
                    self._hoverReset()
                }, self.hoverStayTime)
            })
        }
    },
    hoverCancel: function () {
        this.__touch = !1
        clearTimeout(this.__hoverStyleTimeId)
        this.__hoverStyleTimeId = void 0
        this._hoverReset()
    },
    _hoverReset: function () {
        if (this.__hovering) {
            this.__hovering = !1
            window.__hoverElement__ = void 0
            if (this.hoverStyle == 'none' || this.hoverClass == 'none');
            else if (this._hoverClass && this._hoverClass.length > 0) {
                for (var e = 0; e < this._hoverClass.length; e++) {
                    this.$$.classList.contains(this._hoverClass[e]) &&
                    this.$$.classList.remove(this._hoverClass[e])
                }
            } else {
                this.$$.classList.remove(this.is.replace('wx-', '') + '-hover')
            }
        }
    }
})