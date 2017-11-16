// wx-button
export default window.exparser.registerElement({
    is: 'wx-button',
    template: '\n    <slot></slot>\n  ',
    behaviors: ['wx-base', 'wx-hover', 'wx-label-target'],
    properties: {
        type: {
            type: String,
            value: 'default',
            public: !0
        },
        size: {
            type: String,
            value: 'default',
            public: !0
        },
        disabled: {
            type: Boolean,
            public: !0
        },
        plain: {
            type: Boolean,
            public: !0
        },
        loading: {
            type: Boolean,
            public: !0
        },
        formType: {
            type: String,
            public: !0
        },
        hover: {
            type: Boolean,
            value: !0
        }
    },
    listeners: {
        tap: '_preventTapOnDisabled',
        longtap: '_preventTapOnDisabled',
        canceltap: '_preventTapOnDisabled',
        'this.tap': '_onThisTap'
    },
    _preventTapOnDisabled: function () {
        if (this.disabled) return !1
    },
    _onThisTap: function () {
        this.formType === 'submit'
            ? this.triggerEvent('formSubmit', void 0, {bubbles: !0})
            : this.formType === 'reset' &&
            this.triggerEvent('formReset', void 0, {bubbles: !0})
    },
    handleLabelTap: function (event) {
        exparser.triggerEvent(this.shadowRoot, 'tap', event.detail, {
            bubbles: !0,
            composed: !0,
            extraFields: {
                touches: event.touches,
                changedTouches: event.changedTouches
            }
        })
    }
})

