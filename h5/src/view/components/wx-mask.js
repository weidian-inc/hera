// wx-mask
export default  window.exparser.registerElement({
    is: 'wx-mask',
    template: '\n    <div class="wx-mask" id="mask" style="display: none;">\n  ',
    behaviors: ['wx-base'],
    properties: {
        hidden: {
            type: Boolean,
            value: !0,
            observer: 'hiddenChange',
            public: !0
        }
    },
    hiddenChange: function (hide) {
        var mask = this.$.mask
        hide === !0
            ? (setTimeout(function () {
            mask.style.display = 'none'
        }, 300), this.$.mask.classList.add('wx-mask-transparent'))
            : ((mask.style.display = 'block'), mask.focus(), mask.classList.remove(
            'wx-mask-transparent'
        ))
    }
})


