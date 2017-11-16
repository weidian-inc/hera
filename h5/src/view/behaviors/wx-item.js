// wx-item
export default window.exparser.registerBehavior({
    is: 'wx-item',
    properties: {
        value: {
            type: String,
            public: !0,
            observer: 'valueChange'
        },
        checked: {
            type: Boolean,
            value: !1,
            observer: 'checkedChange',
            public: !0
        }
    },
    valueChange: function (newVal, oldVal) {
        this._relatedGroup &&
        this._relatedGroup.triggerEvent('wxItemValueChanged', {
            item: this,
            newVal: newVal,
            oldVal: oldVal
        })
    },
    checkedChange: function (newVal, oldVal) {
        newVal !== oldVal &&
        this._relatedGroup &&
        this._relatedGroup.triggerEvent('wxItemCheckedChanged', {
            item: this
        })
    },
    changedByTap: function () {
        this._relatedGroup && this._relatedGroup.triggerEvent('wxItemChangedByTap')
    },
    attached: function () {
        this.triggerEvent(
            'wxItemAdded',
            {
                item: this
            },
            {
                bubbles: !0
            }
        )
    },
    moved: function () {
        this._relatedGroup &&
        (this._relatedGroup.triggerEvent(
            'wxItemRemoved'
        ), (this._relatedGroup = null)), this.triggerEvent(
            'wxItemAdded',
            {item: this},
            {bubbles: !0}
        )
    },
    detached: function () {
        this._relatedGroup &&
        (this._relatedGroup.triggerEvent('wxItemRemoved', {
            item: this
        }), (this._relatedGroup = null))
    },
    resetFormData: function () {
        this.checked = !1
    }
})