// wx-icon
export default window.exparser.registerElement({
    is: 'wx-icon',
    template: '<i class$="wx-icon-{{type}}" style.color="{{color}}" style.font-size="{{size}}px"></i>',
    behaviors: ['wx-base'],
    properties: {
        type: {
            type: String,
            public: !0
        },
        size: {
            type: Number,
            value: 23,
            public: !0
        },
        color: {
            type: String,
            public: !0
        }
    }
})

