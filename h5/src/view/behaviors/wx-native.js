// wx-native
export default window.exparser.registerBehavior({
    is: 'wx-native',
    properties: {
        hidden: {
            type: Boolean,
            value: !1,
            public: !0,
            observer: 'hiddenChanged'
        },
        _isReady: {
            type: Boolean,
            value: !1
        },
        _deferred: {
            type: Array,
            value: []
        },
        _isError: {
            type: Boolean,
            value: !1
        },
        _box: {
            type: Object,
            value: {
                left: 0,
                top: 0,
                width: 0,
                height: 0
            }
        }
    },
    _isiOS: function () {//转成h5后，此处统一返回false 不走native的处理方式
        //var ua = window.navigator.userAgent.toLowerCase()
        return false ///iphone/.test(ua)
    },
    _isAndroid: function () {
        //var ua = window.navigator.userAgent.toLowerCase()
        return false ///android/.test(ua)
    },
    _isMobile: function () {
        return this._isiOS() || this._isAndroid()
    },
    _getBox: function () {
        var pos = this.$$.getBoundingClientRect(),
            res = {
                left: pos.left + window.scrollX,
                top: pos.top + window.scrollY,
                width: this.$$.offsetWidth,
                height: this.$$.offsetHeight
            }
        return res
    },
    _diff: function () {
        var pos = this._getBox()
        for (var attr in pos) {
            if (pos[attr] !== this._box[attr]) return !0
        }
        return !1
    },
    _ready: function () {
        this._isReady = !0
        this._deferred.forEach(function (e) {
            this[e.callback].apply(this, e.args)
        }, this)
        this._deferred = []
    },
    hiddenChanged: function (e, t) {
        if (!this._isError) {
            return this._isReady
                ? void this._hiddenChanged(e, t)
                : void this._deferred.push({callback: 'hiddenChanged', args: [e, t]})
        }
    },
    _pageReRenderCallback: function () {
        this._isError ||
        (this._diff() && ((this._box = this._getBox()), this._updatePosition()))
    }
})