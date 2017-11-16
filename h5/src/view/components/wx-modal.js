// wx-modal
export default  window.exparser.registerElement({
    is: 'wx-modal',
    template: '\n    <div id="mask" class="wx-modal-mask"></div>\n    <div class="wx-modal-dialog">\n      <div class="wx-modal-dialog-hd">\n        <strong parse-text-content>{{title}}</strong>\n      </div>\n      <div class="wx-modal-dialog-bd">\n        <slot></slot>\n      </div>\n      <div class="wx-modal-dialog-ft">\n        <a hidden$="{{noCancel}}" id="cancel" class="wx-modal-btn-default" parse-text-content>{{cancelText}}</a>\n        <a id="confirm" class="wx-modal-btn-primary" parse-text-content>{{confirmText}}</a>\n      </div>\n    </div>\n  ',
    behaviors: ['wx-base'],
    properties: {
        title: {
            type: String,
            public: !0
        },
        noCancel: {
            type: Boolean,
            value: !1,
            public: !0
        },
        confirmText: {
            type: String,
            value: '确定',
            public: !0
        },
        cancelText: {
            type: String,
            value: '取消',
            public: !0
        }
    },
    listeners: {
        'mask.tap': '_handleCancel',
        'confirm.tap': '_handleConfirm',
        'cancel.tap': '_handleCancel'
    },
    _handleConfirm: function () {
        this.triggerEvent('confirm')
    },
    _handleCancel: function () {
        this.triggerEvent('cancel')
    }
})


