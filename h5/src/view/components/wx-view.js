// prettier-ignore
export default  window.exparser.registerElement({
    is: 'wx-view',
    template: '<slot></slot>',
    behaviors: ['wx-base', 'wx-hover'],
    properties: {
        inline: {
            type: Boolean,
            public: !0
        },
        hover: {
            type: Boolean,
            value: !1,
            public: !0
        }
    }
});
