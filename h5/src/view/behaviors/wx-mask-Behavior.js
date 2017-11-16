// wx-mask-Behavior
export default window.exparser.registerBehavior({
    is: 'wx-mask-Behavior',
    properties: {
        mask: {
            type: Boolean,
            value: !1,
            public: !0
        }
    },
    _getMaskStyle: function (showMask) {
        return showMask ? '' : 'background-color: transparent'
    }
})
