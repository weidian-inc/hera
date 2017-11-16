window.exparser.registerBehavior({
    is: 'wx-input-base',
    properties: {
        focus: {
            type: Boolean,
            value: 0,
            coerce: '_focusChange',
            public: !0
        },
        autoFocus: {
            type: Boolean,
            value: !1,
            public: !0
        },
        placeholder: {
            type: String,
            value: '',
            observer: '_placeholderChange',
            public: !0
        },
        placeholderStyle: {
            type: String,
            value: '',
            public: !0
        },
        placeholderClass: {
            type: String,
            value: '',
            public: !0
        },
        value: {
            type: String,
            value: '',
            coerce: 'defaultValueChange',
            public: !0
        },
        showValue: {
            type: String,
            value: ''
        },
        maxlength: {
            type: Number,
            value: 140,
            observer: '_maxlengthChanged',
            public: !0
        },
        type: {
            type: String,
            value: 'text',
            public: !0
        },
        password: {
            type: Boolean,
            value: !1,
            public: !0
        },
        disabled: {
            type: Boolean,
            value: !1,
            public: !0
        },
        bindinput: {
            type: String,
            value: '',
            public: !0
        }
    },
    resetFormData: function () {
        this._keyboardShow && ((this.__formResetCallback = !0), wx.hideKeyboard())
        this.value = ''
        this.showValue = ''
    },
    getFormData: function (callback) {
        this._keyboardShow
            ? (this.__formCallback = callback)
            : typeof callback === 'function' && callback(this.value)
    },
    _formGetDataCallback: function () {
        typeof this.__formCallback === 'function' && this.__formCallback(this.value)
        this.__formCallback = void 0
    },
    _focusChange: function (isFocusChange) {
        this._couldFocus(isFocusChange)
        return isFocusChange
    },
    _couldFocus: function (isFocusChange) {
        var self = this
        !this._keyboardShow &&
        this._attached &&
        isFocusChange &&
        ((window.requestAnimationFrame =
            window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame), window.requestAnimationFrame
            ? window.requestAnimationFrame(function () {
                self._inputFocus()
            })
            : this._inputFocus())
    },
    _getPlaceholderClass: function (name) {
        return 'input-placeholder ' + name
    },
    _showValueFormate: function (value) {
        this.password || this.type == 'password'
            ? (this.showValue = value ? new Array(value.length + 1).join('●') : '')
            : (this.showValue = value || '')
    },
    _maxlengthChanged: function (length, t) {
        var curVal = this.value.slice(0, length)
        curVal != this.value && (this.value = curVal)
    },
    _showValueChange: function (e) {
        return e
    },
    _placeholderChange: function () {
        this._checkPlaceholderStyle(this.value)
    }
})