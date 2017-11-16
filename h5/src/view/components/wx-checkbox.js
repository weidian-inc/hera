// wx-checkbox
export default window.exparser.registerElement({
    is: 'wx-checkbox',
    template: '\n    <div class="wx-checkbox-wrapper">\n      <div id="input" class="wx-checkbox-input" class.wx-checkbox-input-checked="{{checked}}" class.wx-checkbox-input-disabled="{{disabled}}" style.color="{{_getColor(checked,color)}}"></div>\n      <slot></slot>\n    </div>\n  ',
    behaviors: ['wx-base', 'wx-label-target', 'wx-item', 'wx-disabled'],
    properties: {
        color: {
            type: String,
            value: '#09BB07',
            public: !0
        }
    },
    listeners: {
        tap: '_inputTap'
    },
    _getColor: function (notEmpty, def) {
        return notEmpty ? def : ''
    },
    _inputTap: function () {
        return (
            !this.disabled &&
            ((this.checked = !this.checked), void this.changedByTap())
        )
    },
    handleLabelTap: function () {
        this._inputTap()
    }
})
