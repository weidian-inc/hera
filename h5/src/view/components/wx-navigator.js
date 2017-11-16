// wx-navigator
export default  window.exparser.registerElement({
    is: 'wx-navigator',
    behaviors: ['wx-base', 'wx-hover'],
    template: '<slot></slot>',
    properties: {
        url: {
            type: String,
            public: !0
        },
        redirect: {
            type: Boolean,
            value: !1,
            public: !0
        },
        openType: {
            type: String,
            value: 'navigate',
            public: !0
        },
        hoverClass: {
            type: String,
            value: '',
            public: !0
        },
        hoverStyle: {
            type: String,
            value: '',
            public: !0
        },
        hover: {
            type: Boolean,
            value: !0
        },
        hoverStayTime: {
            type: Number,
            value: 600,
            public: !0
        }
    },
    listeners: {
        tap: 'navigateTo'
    },
    navigateTo: function () {
        if (!this.url) {
            return void console.error('navigator should have url attribute')
        }
        if (this.redirect) {
            return void wx.redirectTo({
                url: this.url
            })
        }
        switch (this.openType) {
            case 'navigate':
                return void wx.navigateTo({
                    url: this.url
                })
            case 'redirect':
                return void wx.redirectTo({
                    url: this.url
                })
            case 'switchTab':
                return void wx.switchTab({
                    url: this.url
                })
            case"reLaunch":
                return void wx.reLaunch({
                    url: this.url
                })
            default:
                return void console.error(
                    'navigator: invalid openType ' + this.openType
                )
        }
    }
})
