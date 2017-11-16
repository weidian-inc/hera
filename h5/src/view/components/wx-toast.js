// wx-toast
export default window.exparser.registerElement({
    is: 'wx-toast',
    template: '\n    <div class="wx-toast-mask" id="mask" style$="{{_getMaskStyle(mask)}}"></div>\n    <div class="wx-toast">\n      <invoke class$="wx-toast-icon wx-icon-{{icon}}" style.color="#FFFFFF" style.font-size="55px" style.display="block"></invoke>\n      <p class="wx-toast-content"><slot></slot></p>\n    </div>\n  ',
    behaviors: ['wx-base', 'wx-mask-Behavior'],
    properties: {
        icon: {
            type: String,
            value: 'success_no_circle',
            public: !0
        },
        hidden: {
            type: Boolean,
            value: !1,
            public: !0,
            observer: 'hiddenChange'
        },
        duration: {
            type: Number,
            value: 1500,
            public: !0,
            observer: 'durationChange'
        }
    },
    durationChange: function () {
        this.timer && (clearTimeout(this.timer), this.hiddenChange(this.hidden))
    },
    hiddenChange: function (isHidden) {
        if (!isHidden && this.duration != 0) {
            var self = this
            this.timer = setTimeout(function () {
                self.triggerEvent('change', {
                    value: self.hidden
                })
            }, this.duration)
        }
    }
})