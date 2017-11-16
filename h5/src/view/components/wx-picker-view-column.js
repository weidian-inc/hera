// wx-picker-view-column
export default  !(function () {
    function _Animation (model, t, n) {
        function i (t, n, o, r) {
            if (!t || !t.cancelled) {
                o(n)
                var a = model.done()
                a ||
                t.cancelled ||
                (t.id = requestAnimationFrame(i.bind(null, t, n, o, r))), a &&
                r &&
                r(n)
            }
        }

        function cancelAnimation (e) {
            e && e.id && cancelAnimationFrame(e.id)
            e && (e.cancelled = !0)
        }

        var r = {
            id: 0,
            cancelled: !1
        }

        i(r, model, t, n)

        return {
            cancel: cancelAnimation.bind(null, r),
            model: model
        }
    }

    function Friction (drag) {
        this._drag = drag
        this._dragLog = Math.log(drag)
        this._x = 0
        this._v = 0
        this._startTime = 0
    }

    function n (e, t, n) {
        return e > t - n && e < t + n
    }

    function i (e, t) {
        return n(e, 0, t)
    }

    function Spring (m, k, c) {
        this._m = m
        this._k = k
        this._c = c
        this._solution = null
        this._endPosition = 0
        this._startTime = 0
    }

    function Scroll (extent) {
        this._extent = extent
        this._friction = new Friction(0.01)
        this._spring = new Spring(1, 90, 20)
        this._startTime = 0
        this._springing = !1
        this._springOffset = 0
    }

    function Handler (element, current, itemHeight) {
        this._element = element
        this._extent =
            this._element.offsetHeight - this._element.parentElement.offsetHeight
        var disY = -current * itemHeight
        disY > 0 ? (disY = 0) : disY < -this._extent && (disY = -this._extent)
        this._position = disY
        this._scroll = new Scroll(this._extent)
        this._onTransitionEnd = this.onTransitionEnd.bind(this)
        this._itemHeight = itemHeight
        var transform = 'translateY(' + disY + 'px)'
        this._element.style.webkitTransform = transform
        this._element.style.transform = transform
    }

    Friction.prototype.set = function (x, v) {
        this._x = x
        this._v = v
        this._startTime = new Date().getTime()
    }
    Friction.prototype.x = function (e) {
        void 0 === e && (e = (new Date().getTime() - this._startTime) / 1e3)
        var t
        return (t = e === this._dt && this._powDragDt
            ? this._powDragDt
            : (this._powDragDt = Math.pow(this._drag, e))), (this._dt = e), this._x +
        this._v * t / this._dragLog -
        this._v / this._dragLog
    }
    Friction.prototype.dx = function (e) {
        void 0 === e && (e = (new Date().getTime() - this._startTime) / 1e3)
        var t
        return (t = e === this._dt && this._powDragDt
            ? this._powDragDt
            : (this._powDragDt = Math.pow(this._drag, e))), (this._dt = e), this._v *
        t
    }
    Friction.prototype.done = function () {
        return Math.abs(this.dx()) < 3
    }
    Friction.prototype.reconfigure = function (e) {
        var t = this.x(), n = this.dx()
        ;(this._drag = e), (this._dragLog = Math.log(e)), this.set(t, n)
    }
    Friction.prototype.configuration = function () {
        var e = this
        return [
            {
                label: 'Friction',
                read: function () {
                    return e._drag
                },
                write: function (t) {
                    e.reconfigure(t)
                },
                min: 0.001,
                max: 0.1,
                step: 0.001
            }
        ]
    }
    var s = 0.1
    Spring.prototype._solve = function (e, t) {
        var n = this._c, i = this._m, o = this._k, r = n * n - 4 * i * o
        if (r == 0) {
            var a = -n / (2 * i), s = e, l = t / (a * e)
            return {
                x: function (e) {
                    return (s + l * e) * Math.pow(Math.E, a * e)
                },
                dx: function (e) {
                    var t = Math.pow(Math.E, a * e)
                    return a * (s + l * e) * t + l * t
                }
            }
        }
        if (r > 0) {
            var c = (-n - Math.sqrt(r)) / (2 * i),
                d = (-n + Math.sqrt(r)) / (2 * i),
                l = (t - c * e) / (d - c),
                s = e - l
            return {
                x: function (e) {
                    var t, n
                    return e === this._t &&
                    ((t = this._powER1T), (n = this._powER2T)), (this._t = e), t ||
                    (t = this._powER1T = Math.pow(Math.E, c * e)), n ||
                    (n = this._powER2T = Math.pow(Math.E, d * e)), s * t + l * n
                },
                dx: function (e) {
                    var t, n
                    return e === this._t &&
                    ((t = this._powER1T), (n = this._powER2T)), (this._t = e), t ||
                    (t = this._powER1T = Math.pow(Math.E, c * e)), n ||
                    (n = this._powER2T = Math.pow(Math.E, d * e)), s * c * t + l * d * n
                }
            }
        }
        var u = Math.sqrt(4 * i * o - n * n) / (2 * i),
            a = -(n / 2 * i),
            s = e,
            l = (t - a * e) / u
        return {
            x: function (e) {
                return (
                    Math.pow(Math.E, a * e) * (s * Math.cos(u * e) + l * Math.sin(u * e))
                )
            },
            dx: function (e) {
                var t = Math.pow(Math.E, a * e),
                    n = Math.cos(u * e),
                    i = Math.sin(u * e)
                return t * (l * u * n - s * u * i) + a * t * (l * i + s * n)
            }
        }
    }
    Spring.prototype.x = function (e) {
        return void 0 == e &&
        (e = (new Date().getTime() - this._startTime) / 1e3), this._solution
            ? this._endPosition + this._solution.x(e)
            : 0
    }
    Spring.prototype.dx = function (e) {
        return void 0 == e &&
        (e = (new Date().getTime() - this._startTime) / 1e3), this._solution
            ? this._solution.dx(e)
            : 0
    }
    Spring.prototype.setEnd = function (e, t, n) {
        if ((n || (n = new Date().getTime()), e != this._endPosition || !i(t, s))) {
            t = t || 0
            var o = this._endPosition
            this._solution &&
            (i(t, s) &&
            (t = this._solution.dx(
                (n - this._startTime) / 1e3
            )), (o = this._solution.x((n - this._startTime) / 1e3)), i(t, s) &&
            (t = 0), i(o, s) && (o = 0), (o += this._endPosition)), (this
                ._solution &&
            i(o - e, s) &&
            i(t, s)) ||
            ((this._endPosition = e), (this._solution = this._solve(
                o - this._endPosition,
                t
            )), (this._startTime = n))
        }
    }
    Spring.prototype.snap = function (e) {
        ;(this._startTime = new Date().getTime()), (this._endPosition = e), (this._solution = {
            x: function () {
                return 0
            },
            dx: function () {
                return 0
            }
        })
    }
    Spring.prototype.done = function (e) {
        return e || (e = new Date().getTime()), n(this.x(), this._endPosition, s) &&
        i(this.dx(), s)
    }
    Spring.prototype.reconfigure = function (e, t, n) {
        ;(this._m = e), (this._k = t), (this._c = n), this.done() ||
        ((this._solution = this._solve(
            this.x() - this._endPosition,
            this.dx()
        )), (this._startTime = new Date().getTime()))
    }
    Spring.prototype.springConstant = function () {
        return this._k
    }
    Spring.prototype.damping = function () {
        return this._c
    }
    Spring.prototype.configuration = function () {
        function e (e, t) {
            e.reconfigure(1, t, e.damping())
        }

        function t (e, t) {
            e.reconfigure(1, e.springConstant(), t)
        }

        return [
            {
                label: 'Spring Constant',
                read: this.springConstant.bind(this),
                write: e.bind(this, this),
                min: 100,
                max: 1e3
            },
            {
                label: 'Damping',
                read: this.damping.bind(this),
                write: t.bind(this, this),
                min: 1,
                max: 500
            }
        ]
    }
    Scroll.prototype.snap = function (e, t) {
        ;(this._springOffset = 0), (this._springing = !0), this._spring.snap(
            e
        ), this._spring.setEnd(t)
    }
    Scroll.prototype.set = function (e, t) {
        this._friction.set(e, t)
        if (e > 0 && t >= 0) {
            ;(this._springOffset = 0), (this._springing = !0), this._spring.snap(
                e
            ), this._spring.setEnd(0)
        } else {
            e < -this._extent && t <= 0
                ? ((this._springOffset = 0), (this._springing = !0), this._spring.snap(
                e
            ), this._spring.setEnd(-this._extent))
                : (this._springing = !1), (this._startTime = new Date().getTime())
        }
    }
    Scroll.prototype.x = function (e) {
        if (!this._startTime) return 0
        if (
            (e || (e = (new Date().getTime() - this._startTime) / 1e3), this
                ._springing)
        ) {
            return this._spring.x() + this._springOffset
        }
        var t = this._friction.x(e), n = this.dx(e)
        return ((t > 0 && n >= 0) || (t < -this._extent && n <= 0)) &&
        ((this._springing = !0), this._spring.setEnd(0, n), t < -this._extent
            ? (this._springOffset = -this._extent)
            : (this._springOffset = 0), (t =
            this._spring.x() + this._springOffset)), t
    }
    Scroll.prototype.dx = function (e) {
        return this._springing ? this._spring.dx(e) : this._friction.dx(e)
    }
    Scroll.prototype.done = function () {
        return this._springing ? this._spring.done() : this._friction.done()
    }
    Scroll.prototype.configuration = function () {
        var e = this._friction.configuration()
        return e.push.apply(e, this._spring.configuration()), e
    }
    var l = 0.5
    Handler.prototype.onTouchStart = function () {
        this._startPosition = this._position
        this._startPosition > 0
            ? (this._startPosition /= l)
            : this._startPosition < -this._extent &&
            (this._startPosition =
                (this._startPosition + this._extent) / l - this._extent)
        this._animation && this._animation.cancel()
        var pos = this._position, transform = 'translateY(' + pos + 'px)'
        this._element.style.webkitTransform = transform
        this._element.style.transform = transform
    }
    Handler.prototype.onTouchMove = function (e, t) {
        var pos = t + this._startPosition
        pos > 0
            ? (pos *= l)
            : pos < -this._extent &&
            (pos = (pos + this._extent) * l - this._extent)
        this._position = pos
        var transform = 'translateY(' + pos + 'px) translateZ(0)'
        ;(this._element.style.webkitTransform = transform), (this._element.style.transform = transform)
    }
    Handler.prototype.onTouchEnd = function (t, n, i) {
        var self = this
        if (this._position > -this._extent && this._position < 0) {
            if ((Math.abs(n) < 34 && Math.abs(i.y) < 300) || Math.abs(i.y) < 150) {
                return void self.snap()
            }
        }

        this._scroll.set(this._position, i.y)

        this._animation = _Animation(
            this._scroll,
            function () {
                var e = self._scroll.x()
                self._position = e
                var t = 'translateY(' + e + 'px) translateZ(0)'
                self._element.style.webkitTransform = t
                self._element.style.transform = t
            },
            function () {
                self.snap()
            }
        )

        return void 0
    }

    Handler.prototype.onTransitionEnd = function () {
        ;(this._snapping = !1), (this._element.style.transition =
            ''), (this._element.style.webkitTransition =
            ''), this._element.removeEventListener(
            'transitionend',
            this._onTransitionEnd
        ), this._element.removeEventListener(
            'webkitTransitionEnd',
            this._onTransitionEnd
        ), typeof this.snapCallback === 'function' &&
        this.snapCallback(Math.floor(Math.abs(this._position) / this._itemHeight))
    }
    Handler.prototype.snap = function () {
        var height = this._itemHeight,
            t = this._position % height,
            n = Math.abs(t) > 17
                ? this._position - (height - Math.abs(t))
                : this._position - t
        this._element.style.transition = 'transform .2s ease-out'
        this._element.style.webkitTransition = '-webkit-transform .2s ease-out'
        this._element.style.transform = 'translateY(' + n + 'px) translateZ(0)'
        this._element.style.webkitTransform =
            'translateY(' + n + 'px) translateZ(0)'
        this._position = n
        this._snapping = !0
        this._element.addEventListener('transitionend', this._onTransitionEnd)
        this._element.addEventListener('webkitTransitionEnd', this._onTransitionEnd)
    }
    Handler.prototype.update = function (e) {
        var t =
            this._element.offsetHeight - this._element.parentElement.offsetHeight
        typeof e === 'number' && (this._position = -e * this._itemHeight), this
            ._position < -t
            ? (this._position = -t)
            : this._position > 0 &&
            (this._position = 0), (this._element.style.transform =
            'translateY(' +
            this._position +
            'px) translateZ(0)'), (this._element.style.webkitTransform =
            'translateY(' +
            this._position +
            'px) translateZ(0)'), (this._extent = t), (this._scroll._extent = t)
    }
    Handler.prototype.configuration = function () {
        return this._scroll.configuration()
    }

    window.exparser.registerElement({
        is: 'wx-picker-view-column',
        template: '\n      <div id="main" class="wx-picker__group">\n        <div id="mask" class="wx-picker__mask"></div>\n        <div id="indicator" class="wx-picker__indicator"></div>\n        <div id="content" class="wx-picker__content"><slot></slot></div>\n      </div>\n    ',
        attached: function () {
            var self = this
            this._observer = exparser.Observer.create(function () {
                self._handlers.update()
            })
            this._observer.observe(this, {
                childList: !0,
                subtree: !0
            })
        },
        detached: function () {
            this.$.main.removeEventListener('touchstart', this.__handleTouchStart)
            document.body.removeEventListener('touchmove', this.__handleTouchMove)
            document.body.removeEventListener('touchend', this.__handleTouchEnd)
            document.body.removeEventListener('touchcancel', this.__handleTouchEnd)
        },
        _getCurrent: function () {
            return this._current || 0
        },
        _setCurrent: function (indicator) {
            this._current = indicator
        },
        _setStyle: function (style) {
            this.$.indicator.setAttribute('style', style)
        },
        _setHeight: function (height) {
            var indicatorHeight = this.$.indicator.offsetHeight,
                contents = this.$.content.children,
                idx = 0,
                len = contents.length
            for (; idx < len; idx++) {
                var contentItem = contents.item(idx)
                contentItem.style.height = indicatorHeight + 'px'
                contentItem.style.overflow = 'hidden'
            }

            this._itemHeight = indicatorHeight
            this.$.main.style.height = height + 'px'
            var indicatorTopPos = (height - indicatorHeight) / 2
            this.$.mask.style.backgroundSize = '100% ' + indicatorTopPos + 'px'
            this.$.indicator.style.top = indicatorTopPos + 'px'
            this.$.content.style.padding = indicatorTopPos + 'px 0'
        },
        _init: function () {
            var that = this
            this._touchInfo = {
                trackingID: -1,
                maxDy: 0,
                maxDx: 0
            }
            this._handlers = new Handler(
                this.$.content,
                this._current,
                this._itemHeight
            )
            this._handlers.snapCallback = function (idx) {
                idx !== that._current &&
                ((that._current = idx), that.triggerEvent(
                    'wxPickerColumnValueChanged',
                    {
                        idx: idx
                    },
                    {
                        bubbles: !0
                    }
                ))
            }
            this.__handleTouchStart = this._handleTouchStart.bind(this)
            this.__handleTouchMove = this._handleTouchMove.bind(this)
            this.__handleTouchEnd = this._handleTouchEnd.bind(this)
            this.$.main.addEventListener('touchstart', this.__handleTouchStart)
            document.body.addEventListener('touchmove', this.__handleTouchMove)
            document.body.addEventListener('touchend', this.__handleTouchEnd)
            document.body.addEventListener('touchcancel', this.__handleTouchEnd)
        },
        _update: function () {
            this._handlers.update(this._current)
        },
        _findDelta: function (event) {
            var touchInfo = this._touchInfo
            if (event.type != 'touchmove' && event.type != 'touchend') {
                return {
                    x: event.screenX - touchInfo.x,
                    y: event.screenY - touchInfo.y
                }
            }
            for (
                var touches = event.changedTouches || event.touches, i = 0;
                i < touches.length;
                i++
            ) {
                if (touches[i].identifier == touchInfo.trackingID) {
                    return {
                        x: touches[i].pageX - touchInfo.x,
                        y: touches[i].pageY - touchInfo.y
                    }
                }
            }
            return null
        },
        _handleTouchStart: function (event) {
            var touchInfo = this._touchInfo
            if (touchInfo.trackingID == -1) {
                var handlers = this._handlers
                if (handlers) {
                    if (event.type == 'touchstart') {
                        var touches = event.changedTouches || event.touches
                        touchInfo.trackingID = touches[0].identifier
                        touchInfo.x = touches[0].pageX
                        touchInfo.y = touches[0].pageY
                    } else {
                        touchInfo.trackingID = 'mouse'
                        touchInfo.x = event.screenX
                        touchInfo.y = event.screenY
                    }
                    touchInfo.maxDx = 0
                    touchInfo.maxDy = 0
                    touchInfo.historyX = [0]
                    touchInfo.historyY = [0]
                    touchInfo.historyTime = [event.timeStamp]
                    touchInfo.listener = handlers
                    handlers.onTouchStart && handlers.onTouchStart()
                }
            }
        },
        _handleTouchMove: function (event) {
            var touchInfo = this._touchInfo
            if (touchInfo.trackingID != -1) {
                event.preventDefault()
                var delta = this._findDelta(event)
                if (delta) {
                    touchInfo.maxDy = Math.max(touchInfo.maxDy, Math.abs(delta.y))
                    touchInfo.maxDx = Math.max(touchInfo.maxDx, Math.abs(delta.x))
                    touchInfo.historyX.push(delta.x)
                    touchInfo.historyY.push(delta.y)
                    touchInfo.historyTime.push(event.timeStamp)
                    for (; touchInfo.historyTime.length > 10;) {
                        touchInfo.historyTime.shift()
                        touchInfo.historyX.shift()
                        touchInfo.historyY.shift()
                    }
                    touchInfo.listener &&
                    touchInfo.listener.onTouchMove &&
                    touchInfo.listener.onTouchMove(delta.x, delta.y, event.timeStamp)
                }
            }
        },
        _handleTouchEnd: function (event) {
            var touchInfo = this._touchInfo
            if (touchInfo.trackingID != -1) {
                event.preventDefault()
                var delta = this._findDelta(event)
                if (delta) {
                    var listener = touchInfo.listener
                    touchInfo.trackingID = -1
                    touchInfo.listener = null
                    var historyTimeLen = touchInfo.historyTime.length,
                        r = {
                            x: 0,
                            y: 0
                        }
                    if (historyTimeLen > 2) {
                        var lastIdx = touchInfo.historyTime.length - 1,
                            lastHistoryTIme = touchInfo.historyTime[lastIdx],
                            lastHistoryX = touchInfo.historyX[lastIdx],
                            lastHistoryY = touchInfo.historyY[lastIdx]
                        for (; lastIdx > 0;) {
                            lastIdx--
                            var timeItem = touchInfo.historyTime[lastIdx],
                                u = lastHistoryTIme - timeItem
                            if (u > 30 && u < 50) {
                                r.x = (lastHistoryX - touchInfo.historyX[lastIdx]) / (u / 1e3)
                                r.y = (lastHistoryY - touchInfo.historyY[lastIdx]) / (u / 1e3)
                                break
                            }
                        }
                    }
                    touchInfo.historyTime = []
                    touchInfo.historyX = []
                    touchInfo.historyY = []
                    listener &&
                    listener.onTouchEnd &&
                    listener.onTouchEnd(delta.x, delta.y, r)
                }
            }
        }
    })
})()
