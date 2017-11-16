export default  window.exparser.registerElement({
    is: 'wx-action-sheet-cancel',
    template: '\n    <div class="wx-action-sheet-middle" id="middle"></div>\n    <div class="wx-action-sheet-cancel" id="cancel">\n      <slot></slot>\n    </div>\n  ',
    properties: {},
    listeners: {
        'middle.tap': 'handleMiddleTap',
        'cancel.tap': 'handleCancelTap'
    },
    behaviors: ['wx-base'],
    handleMiddleTap: function (e) {
        return !1
    },
    handleCancelTap: function (e) {
        this.triggerEvent('actionSheetCancel', void 0, {
            bubbles: !0
        })
    }
})

