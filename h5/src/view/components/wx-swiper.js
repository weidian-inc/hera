// wx-swiper
export default  window.exparser.registerElement({
    is: 'wx-swiper',
    template: '\n    <div id="slidesWrapper" class="wx-swiper-wrapper">\n      <div id="slides" class="wx-swiper-slides">\n        <slot></slot>\n      </div>\n      <div id="slidesDots" hidden$="{{!indicatorDots}}" class="wx-swiper-dots" class.wx-swiper-dots-horizontal="{{!vertical}}" class.wx-swiper-dots-vertical="{{vertical}}">\n      </div>\n    </div>\n  ',
    behaviors: ['wx-base', 'wx-touchtrack'],
    properties: {
        indicatorDots: {
            type: Boolean,
            value: !1,
            public: !0
        },
        vertical: {
            type: Boolean,
            value: !1,
            observer: '_initSlides',
            public: !0
        },
        autoplay: {
            type: Boolean,
            value: !1,
            observer: '_autoplayChanged',
            public: !0
        },
        circular: {
            type: Boolean,
            value: !1,
            observer: '_initSlides',
            public: !0
        },
        interval: {
            type: Number,
            value: 5e3,
            public: !0,
            observer: '_autoplayChanged'
        },
        duration: {
            type: Number,
            value: 500,
            public: !0
        },
        current: {
            type: Number,
            value: 0,
            observer: '_currentSlideChanged',
            public: !0
        }
    },
    listeners: {
        'slidesDots.tap': '_handleDotTap',
        'slides.canceltap': '_handleSlidesCancelTap',
        'this.wxSwiperItemChanged': '_itemChanged'
    },
    created: function () {
        this.touchtrack(this.$.slides, '_handleContentTrack')
    },
    attached: function () {
        ;(this._attached = !0), this._initSlides(), this.autoplay &&
        this._scheduleNextSlide()
    },
    detached: function () {
        ;(this._attached = !1), this._cancelSchedule()
    },
    _initSlides: function () {
        if (this._attached) {
            this._cancelSchedule()
            var items = (this._items = [])
            var getItems = function getItems (ele) {
                for (var idx = 0; idx < ele.childNodes.length; idx++) {
                    var child = ele.childNodes[idx]
                    child instanceof exparser.Element &&
                    (child.hasBehavior('wx-swiper-item')
                        ? items.push(child)
                        : getItems(child))
                }
            }
            getItems(this)
            var itemLen = items.length
            this._slideCount = itemLen
            var pos = -1
            this._isCurrentSlideLegal(this.current) &&
            ((pos = this.current), this.autoplay && this._scheduleNextSlide())
            this._viewport = pos
            this._itemPos = []
            for (var idx = 0; idx < items.length; idx++) {
                items[idx]._clearTransform()
                pos >= 0
                    ? this._updateItemPos(idx, idx - pos)
                    : this._updateItemPos(idx, -1)
            }
            this._updateDots(pos)
        }
    },
    _updateViewport: function (nViewPort, flag) {
        var self = this, oViewPort = this._viewport
        this._viewport = nViewPort
        var slideCount = this._slideCount
        var updateViewport = function (nextViewport) {
            var movingSlide = (nextViewport % slideCount + slideCount) % slideCount
            if (!(self.circular && self._slideCount > 1)) {
                nextViewport = movingSlide
            }
            var flag2 = !1
            if (flag) {
                if (oViewPort <= nViewPort) {
                    oViewPort - 1 <= nextViewport &&
                    nextViewport <= nViewPort + 1 &&
                    (flag2 = !0)
                } else {
                    nViewPort - 1 <= nextViewport &&
                    nextViewport <= oViewPort + 1 &&
                    (flag2 = !0)
                }
            }

            if (flag2) {
                self._updateItemPos(
                    movingSlide,
                    nextViewport - nViewPort,
                    nextViewport - oViewPort
                )
            } else {
                self._updateItemPos(movingSlide, nextViewport - nViewPort)
            }
        }
        if (oViewPort < nViewPort) {
            for (
                var nextVieport = Math.ceil(nViewPort), idx = 0;
                idx < slideCount;
                idx++
            ) {
                updateViewport(idx + nextVieport - slideCount + 1)
            }
        } else {
            for (
                var nextViewport = Math.floor(nViewPort), idx = 0;
                idx < slideCount;
                idx++
            ) {
                updateViewport(idx + nextViewport)
            }
        }
    },
    _updateDots: function (next) {
        var dotes = this.$.slidesDots
        dotes.innerHTML = ''
        for (
            var fragment = document.createDocumentFragment(), idx = 0;
            idx < this._slideCount;
            idx++
        ) {
            var div = document.createElement('div')
            div.setAttribute('data-dot-index', idx)
            idx === next
                ? div.setAttribute('class', 'wx-swiper-dot wx-swiper-dot-active')
                : div.setAttribute('class', 'wx-swiper-dot')
            fragment.appendChild(div)
        }
        dotes.appendChild(fragment)
    },
    _gotoSlide: function (next, curr) {
        if (this._slideCount) {
            if ((this._updateDots(next), this.circular && this._slideCount > 1)) {
                var currPos = Math.round(this._viewport),
                    ratio = Math.floor(currPos / this._slideCount),
                    nextPos = ratio * this._slideCount + next
                curr > 0
                    ? nextPos < currPos && (nextPos += this._slideCount)
                    : curr < 0 && nextPos > currPos && (nextPos -= this._slideCount)
                this._updateViewport(nextPos, !0)
            } else {
                this._updateViewport(next, !0)
            }
            this.autoplay && this._scheduleNextSlide()
        }
    },
    _updateItemPos: function (nextPos, dis1, dis2) {
        if (void 0 !== dis2 || this._itemPos[nextPos] !== dis1) {
            this._itemPos[nextPos] = dis1
            var duration = '0ms', o = '', r = ''
            void 0 !== dis2 &&
            ((duration = this.duration + 'ms'), (r = this.vertical
                ? 'translate(0,' + 100 * dis2 + '%) translateZ(0)'
                : 'translate(' + 100 * dis2 + '%,0) translateZ(0)'))
            o = this.vertical
                ? 'translate(0,' + 100 * dis1 + '%) translateZ(0)'
                : 'translate(' + 100 * dis1 + '%,0) translateZ(0)'
            this._items[nextPos]._setTransform(duration, o, r)
        }
    },
    _stopItemsAnimation: function () {
        for (var idx = 0; idx < this._slideCount; idx++) {
            var item = this._items[idx]
            item._clearTransform()
        }
    },
    _scheduleNextSlide: function () {
        var self = this
        this._cancelSchedule()
        if (this._attached) {
            this._scheduleTimeoutObj = setTimeout(function () {
                self._scheduleTimeoutObj = null
                self._nextDirection = 1
                self.current = self._normalizeCurrentSlide(self.current + 1)
            }, this.interval)
        }
    },
    _cancelSchedule: function () {
        this._scheduleTimeoutObj &&
        (clearTimeout(
            this._scheduleTimeoutObj
        ), (this._scheduleTimeoutObj = null))
    },
    _normalizeCurrentSlide: function (nextSlide) {
        if (this._slideCount) {
            return (
                (Math.round(nextSlide) % this._slideCount + this._slideCount) %
                this._slideCount
            )
        } else {
            return 0
        }
    },
    _isCurrentSlideLegal: function (slide) {
        return this._slideCount ? slide === this._normalizeCurrentSlide(slide) : 0
    },
    _autoplayChanged: function (autoplay) {
        autoplay ? this._scheduleNextSlide() : this._cancelSchedule()
    },
    _currentSlideChanged: function (next, curr) {
        if (this._isCurrentSlideLegal(next) && this._isCurrentSlideLegal(curr)) {
            this._gotoSlide(next, this._nextDirection || 0)
            this._nextDirection = 0

            next !== curr &&
            this.triggerEvent('change', {
                current: this.current
            })
        } else {
            this._initSlides()
        }

        return void 0
    },
    _itemChanged: function (event) {
        event.target._relatedSwiper = this
        this._initSlides()
        return !1
    },
    _getDirectionName: function (isVertical) {
        return isVertical ? 'vertical' : 'horizontal'
    },
    _handleDotTap: function (event) {
        if (this._isCurrentSlideLegal(this.current)) {
            var dot = Number(event.target.dataset.dotIndex)
            this.current = dot
        }
    },
    _handleSlidesCancelTap: function () {
        this._userWaitingCancelTap = !1
    },
    _handleTrackStart: function () {
        this._cancelSchedule()
        this._contentTrackViewport = this._viewport
        this._contentTrackSpeed = 0
        this._contentTrackT = Date.now()
        this._stopItemsAnimation()
    },
    _handleTrackMove: function (event) {
        var self = this
        var contentTrackT = this._contentTrackT
        this._contentTrackT = Date.now()
        var slideCount = this._slideCount
        var calcRatio = function (e) {
            return 0.5 - 0.25 / (e + 0.5)
        }
        var calcViewport = function (moveRatio, speed) {
            var nextViewPort = self._contentTrackViewport + moveRatio
            self._contentTrackSpeed = 0.6 * self._contentTrackSpeed + 0.4 * speed
            if (!(self.circular && self._slideCount > 1)) {
                if (nextViewPort < 0 || nextViewPort > slideCount - 1) {
                    if (nextViewPort < 0) {
                        nextViewPort = -calcRatio(-nextViewPort)
                    } else {
                        nextViewPort > slideCount - 1 &&
                        (nextViewPort =
                            slideCount - 1 + calcRatio(nextViewPort - (slideCount - 1)))
                    }
                    self._contentTrackSpeed = 0
                }
            }
            self._updateViewport(nextViewPort, !1)
        }

        if (this.vertical) {
            calcViewport(
                -event.dy / this.$.slidesWrapper.offsetHeight,
                -event.ddy / (this._contentTrackT - contentTrackT)
            )
        } else {
            calcViewport(
                -event.dx / this.$.slidesWrapper.offsetWidth,
                -event.ddx / (this._contentTrackT - contentTrackT)
            )
        }
    },
    _handleTrackEnd: function () {
        this.autoplay && this._scheduleNextSlide()
        this._tracking = !1
        var shifting = 0
        Math.abs(this._contentTrackSpeed) > 0.2 &&
        (shifting =
            0.5 * this._contentTrackSpeed / Math.abs(this._contentTrackSpeed))
        var nextSlide = this._normalizeCurrentSlide(this._viewport + shifting)
        if (this.current !== nextSlide) {
            this._nextDirection = this._contentTrackSpeed
            this.current = nextSlide
        } else {
            this._gotoSlide(nextSlide, 0)
        }
        this.autoplay && this._scheduleNextSlide()
    },
    _handleContentTrack: function (event) {
        if (this._isCurrentSlideLegal(this.current)) {
            if (event.detail.state === 'start') {
                this._userTracking = !0
                this._userWaitingCancelTap = !1
                this._userDirectionChecked = !1
                return this._handleTrackStart()
            }
            if (this._userTracking) {
                if (this._userWaitingCancelTap) return !1
                if (!this._userDirectionChecked) {
                    this._userDirectionChecked = !0
                    var dx = Math.abs(event.detail.dx)
                    var dy = Math.abs(event.detail.dy)
                    dx >= dy && this.vertical
                        ? (this._userTracking = !1)
                        : dx <= dy && !this.vertical && (this._userTracking = !1)
                    if (!this._userTracking) {
                        return void (this.autoplay && this._scheduleNextSlide())
                    }
                }
                return event.detail.state === 'end'
                    ? this._handleTrackEnd(event.detail)
                    : (this._handleTrackMove(event.detail), !1)
            }
        }
    }
})
