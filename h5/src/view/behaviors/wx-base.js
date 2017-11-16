export default window.exparser.registerBehavior({
    // 使用 exparser.registerBehavior 和exparser.registerElement 方法注册各种以 wx- 做为标签开头的元素到 exparser
    is: 'wx-base',
    properties: {
        id: {
            type: String,
            public: !0
        },
        hidden: {
            type: Boolean,
            public: !0
        }
    },
    _isDevTools: function () {
        return true
    },
    debounce: function (id, func, waitTime) {
        var _this = this
        this.__debouncers = this.__debouncers || {}
        this.__debouncers[id] && clearTimeout(this.__debouncers[id])
        this.__debouncers[id] = setTimeout(function () {
            typeof func === 'function' && func()
            _this.__debouncers[id] = void 0
        }, waitTime)
    }
})