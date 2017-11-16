// wx-swiper-item
export default !(function () {
    var idIdx = 1
    var frameFunc = null
    var pendingList = []
    var computePendingTime = function (ele, func) {
        var id = idIdx++
        pendingList.push({
            id: id,
            self: ele,
            func: func,
            frames: 2
        })
        var triggerFunc = function e () {
            frameFunc = null
            for (var i = 0; i < pendingList.length; i++) {
                var o = pendingList[i]
                o.frames--, o.frames ||
                (o.func.call(o.self), pendingList.splice(i--, 1))
            }
            frameFunc = pendingList.length ? requestAnimationFrame(e) : null
        }
        frameFunc || (frameFunc = requestAnimationFrame(triggerFunc))
        return id
    }
    var removeFromPendingList = function (e) {
        for (var t = 0; t < pendingList.length; t++) {
            if (pendingList[t].id === e) return void pendingList.splice(t, 1)
        }
    }
    window.exparser.registerElement({
        is: 'wx-swiper-item',
        template: '\n    <slot></slot>\n  ',
        properties: {},
        listeners: {
            'this.wxSwiperItemChanged': '_invalidChild'
        },
        behaviors: ['wx-base'],
        _invalidChild: function (chid) {
            if (chid.target !== this) return !1
        },
        _setDomStyle: function () {
            var selfEle = this.$$
            selfEle.style.position = 'absolute'
            selfEle.style.width = '100%'
            selfEle.style.height = '100%'
        },
        attached: function () {
            this._setDomStyle()
            this._pendingTimeoutId = 0
            this._pendingTransform = ''
            this._relatedSwiper = null
            this.triggerEvent('wxSwiperItemChanged', void 0, {
                bubbles: !0
            })
        },
        detached: function () {
            this._clearTransform()
            this._relatedSwiper &&
            (this._relatedSwiper.triggerEvent(
                'wxSwiperItemChanged'
            ), (this._relatedSwiper = null))
        },
        _setTransform: function (duration, transform, hasPending) {
            hasPending
                ? ((this.$$.style.transitionDuration = '0ms'), (this.$$.style[
                '-webkit-transform'
                ] = hasPending), (this.$$.style.transform = hasPending), (this._pendingTransform = transform), (this._pendingTimeoutId = computePendingTime(
                this,
                function () {
                    ;(this.$$.style.transitionDuration = duration), (this.$$.style[
                        '-webkit-transform'
                        ] = transform), (this.$$.style.transform = transform)
                }
            )))
                : (this._clearTransform(), (this.$$.style.transitionDuration = duration), (this.$$.style[
                '-webkit-transform'
                ] = transform), (this.$$.style.transform = transform))
        },
        _clearTransform: function () {
            this.$$.style.transitionDuration = '0ms'
            this._pendingTimeoutId &&
            ((this.$$.style[
                '-webkit-transform'
                ] = this._pendingTransform), (this.$$.style.transform = this._pendingTransform), removeFromPendingList(
                this._pendingTimeoutId
            ), (this._pendingTimeoutId = 0))
        }
    })
})()

