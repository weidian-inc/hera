// wx-progress
export default  window.exparser.registerElement({
    is: 'wx-progress',
    template: '\n    <div class="wx-progress-bar" style.height="{{strokeWidth}}px">\n      <div class="wx-progress-inner-bar" style.width="{{curPercent}}%" style.background-color="{{color}}"></div>\n    </div>\n    <p class="wx-progress-info" parse-text-content hidden$="{{!showInfo}}">\n      {{curPercent}}%\n    </p>\n  ',
    behaviors: ['wx-base'],
    properties: {
        percent: {
            type: Number,
            observer: 'percentChange',
            public: !0
        },
        curPercent: {
            type: Number
        },
        showInfo: {
            type: Boolean,
            value: !1,
            public: !0
        },
        strokeWidth: {
            type: Number,
            value: 6,
            public: !0
        },
        color: {
            type: String,
            value: '#09BB07',
            public: !0
        },
        active: {
            type: Boolean,
            value: !1,
            public: !0,
            observer: 'activeAnimation'
        }
    },
    percentChange: function (percent) {
        percent > 100 && (this.percent = 100), percent < 0 &&
        (this.percent = 0), this.__timerId &&
        clearInterval(this.__timerId), this.activeAnimation(this.active)
    },
    activeAnimation: function (active) {
        if (!isNaN(this.percent)) {
            if (active) {
                var timeFunc = function () {
                        return this.percent <= this.curPercent + 1
                            ? ((this.curPercent = this.percent), void clearInterval(
                                this.__timerId
                            ))
                            : void ++this.curPercent
                    }
                ;(this.curPercent = 0), (this.__timerId = setInterval(
                    timeFunc.bind(this),
                    30
                )), timeFunc.call(this)
            } else {
                this.curPercent = this.percent
            }
        }
    },
    detached: function () {
        this.__timerId && clearInterval(this.__timerId)
    }
})
