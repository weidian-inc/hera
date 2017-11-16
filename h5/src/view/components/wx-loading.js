// wx-loading
export default window.exparser.registerElement({
    is: 'wx-loading',
    template: '\n    <div class="wx-loading-mask" style$="background-color: transparent;"></div>\n    <div class="wx-loading">\n      <i class="wx-loading-icon"></i><p class="wx-loading-content"><slot></slot></p>\n    </div>\n  ',
    // template: '\n    <div class="wx-loading-mask" style$="background-color: transparent;"></div>\n    <div class="wx-loading">\n      <invoke class="wx-loading-icon"></invoke><p class="wx-loading-content"><slot></slot></p>\n    </div>\n  ',
    behaviors: ['wx-base']
})

