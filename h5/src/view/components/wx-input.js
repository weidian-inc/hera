// wx-input if in wechatdevtools
export default !(function () {
  window.exparser.registerElement({
    is: 'wx-input',
    template:
      '\n      <div id="wrapper" disabled$="{{disabled}}">\n        <input id="input" type$="{{_getType(type,password)}}" maxlength$="{{maxlength}}" value$="{{showValue}}" disabled$="{{disabled}}" >\n        <div id="placeholder" class$="{{_getPlaceholderClass(placeholderClass)}}" style$="{{_getPlaceholderStyle(placeholderStyle)}}" parse-text-content>{{placeholder}}</p>\n      </div>\n      ',
    behaviors: ['wx-base', 'wx-data-Component'],
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
        public: !0,
        observer: '_placeholderClassChange'
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
      },
      confirmHold: {
        type: Boolean,
        value: !1,
        public: !0
      }
    },
    listeners: {
      tap: '_inputFocus',
      'input.focus': '_inputFocus',
      'input.blur': '_inputBlur',
      'input.input': '_inputKey'
    },
    resetFormData: function () {
      this._keyboardShow &&
        ((this.__formResetCallback = !0), wx.hideKeyboard()),
        (this.value = ''),
        (this.showValue = '')
    },
    getFormData: function (callback) {
      this._keyboardShow
        ? (this.__formCallback = callback)
        : typeof callback === 'function' && callback(this.value)
    },
    _formGetDataCallback: function () {
      typeof this.__formCallback === 'function' &&
        this.__formCallback(this.value),
        (this.__formCallback = void 0)
    },
    _focusChange: function (getFocus) {
      return this._couldFocus(getFocus), getFocus
    },
    _couldFocus: function (getFocus) {
      var self = this
      this._attached &&
        (!this._keyboardShow && getFocus
          ? window.requestAnimationFrame(function () {
            self._inputFocus()
          })
          : this._keyboardShow && !getFocus && this.$.input.blur())
    },
    _getPlaceholderClass: function (name) {
      return 'input-placeholder ' + name
    },
    _maxlengthChanged: function (length, t) {
      var vaildVal = this.value.slice(0, length)
      vaildVal != this.value && (this.value = vaildVal)
    },
    _placeholderChange: function () {
      this._checkPlaceholderStyle(this.value)
    },
    attached: function () {
      var self = this
      this._placeholderClassChange(this.placeholderClass),
        this._checkPlaceholderStyle(this.value),
        (this._attached = !0),
        (this._value = this.value),
        this.updateInput(),
        window.__onAppRouteDone &&
          this._couldFocus(this.autoFocus || this.focus),
        (this.__routeDoneId = exparser.addListenerToElement(
          document,
          'routeDone',
          function () {
            self._couldFocus(self.autoFocus || self.focus)
          }
        )),
        (this.__setKeyboardValueId = exparser.addListenerToElement(
          document,
          'setKeyboardValue',
          function (event) {
            if (self._keyboardShow) {
              var value = event.detail.value,
                cursor = event.detail.cursor
              typeof value !== 'undefined' &&
                ((self._value = value), (self.value = value)),
                typeof cursor !== 'undefined' &&
                  cursor != -1 &&
                  self.$.input.setSelectionRange(cursor, cursor)
            }
          }
        )),
        (this.__hideKeyboardId = exparser.addListenerToElement(
          document,
          'hideKeyboard',
          function (t) {
            self._keyboardShow && self.$.input.blur()
          }
        )),
        (this.__onDocumentTouchStart = this.onDocumentTouchStart.bind(this)),
        (this.__updateInput = this.updateInput.bind(this)),
        (this.__inputKeyUp = this._inputKeyUp.bind(this)),
        this.$.input.addEventListener('keyup', this.__inputKeyUp),
        document.addEventListener('touchstart', this.__onDocumentTouchStart),
        document.addEventListener('pageReRender', this.__updateInput),
        (this.autoFocus || this.focus) &&
          setTimeout(function () {
            self._couldFocus(self.autoFocus || self.focus)
          }, 500)
    },
    detached: function () {
      document.removeEventListener('pageReRender', this.__updateInput),
        document.removeEventListener('touchstart', this.__onDocumentTouchStart),
        this.$.input.removeEventListener('keyup', this.__inputKeyUp),
        exparser.removeListenerFromElement(
          document,
          'routeDone',
          this.__routeDoneId
        ),
        exparser.removeListenerFromElement(
          document,
          'hideKeyboard',
          this.__hideKeyboardId
        ),
        exparser.removeListenerFromElement(
          document,
          'onKeyboardComplete',
          this.__onKeyboardCompleteId
        ),
        exparser.removeListenerFromElement(
          document,
          'setKeyboardValue',
          this.__setKeyboardValueId
        )
    },
    onDocumentTouchStart: function () {
      this._keyboardShow && this.$.input.blur()
    },
    _getType: function (type, isPswd) {
      var typeTable = {
        digit: 'number',
        number: 'number',
        email: 'email',
        password: 'password'
      }
      return (isPswd && 'password') || typeTable[type] || 'text'
    },
    _showValueChange: function (value) {
      this.$.input.value = value
    },
    _inputFocus: function (e) {
      this.disabled ||
        this._keyboardShow ||
        ((this._keyboardShow = !0),
        this.triggerEvent('focus', {
          value: this.value
        }),
        this.$.input.focus())
    },
    _inputBlur: function (e) {
      ;(this._keyboardShow = !1),
        (this.value = this._value),
        this._formGetDataCallback(),
        this.triggerEvent('change', { value: this.value }),
        this.triggerEvent('blur', {
          value: this.value
        }),
        this._checkPlaceholderStyle(this.value)
    },
    _inputKeyUp: function (event) {
      if (event.keyCode == 13) {
        this.triggerEvent('confirm', { value: this._value })
        return void (
          this.confirmHold || ((this.value = this._value), this.$.input.blur())
        )
      }
    },
    _inputKey: function (event) {
      var value = event.target.value
      this._value = value
      this._checkPlaceholderStyle(value)
      if (this.bindinput) {
        var target = {
          id: this.$$.id,
          dataset: this.dataset,
          offsetTop: this.$$.offsetTop,
          offsetLeft: this.$$.offsetLeft
        }
        HeraJSBridge.publish('SPECIAL_PAGE_EVENT', {
          eventName: this.bindinput,
          data: {
            ext: {
              setKeyboardValue: !0
            },
            data: {
              type: 'input',
              timestamp: Date.now(),
              detail: {
                value: event.target.value,
                cursor: this.$.input.selectionStart
              },
              target: target,
              currentTarget: target,
              touches: []
            },
            eventName: this.bindinput
          }
        })
      }
      return !1
    },
    updateInput: function () {
      var styles = window.getComputedStyle(this.$$),
        bounds = this.$$.getBoundingClientRect(),
        pos = (['Left', 'Right'].map(function (type) {
          return (
            parseFloat(styles['border' + type + 'Width']) +
            parseFloat(styles['padding' + type])
          )
        }),
        ['Top', 'Bottom'].map(function (type) {
          return (
            parseFloat(styles['border' + type + 'Width']) +
            parseFloat(styles['padding' + type])
          )
        })),
        inputObj = this.$.input,
        height = bounds.height - pos[0] - pos[1]
      height != this.__lastHeight &&
        ((inputObj.style.height = height + 'px'),
        (inputObj.style.lineHeight = height + 'px'),
        (this.__lastHeight = height)),
        (inputObj.style.color = styles.color)
      var ele = this.$.placeholder
      ;(ele.style.height = bounds.height - pos[0] - pos[1] + 'px'),
        (ele.style.lineHeight = ele.style.height)
    },
    defaultValueChange: function (value, t) {
      this.maxlength > 0 && (value = value.slice(0, this.maxlength)),
        this._checkPlaceholderStyle(value),
        this._showValueChange(value),
        (this._value = value)
      return value
    },
    _getPlaceholderStyle: function (placeholderStyle) {
      return placeholderStyle
    },
    _placeholderClassChange: function (className) {
      var classs = className.split(/\s/)
      this._placeholderClass = []
      for (var n = 0; n < classs.length; n++) {
        classs[n] && this._placeholderClass.push(classs[n])
      }
    },
    _checkPlaceholderStyle: function (hide) {
      var phClasss = this._placeholderClass || [],
        placeholderNode = this.$.placeholder
      if (hide) {
        if (
          this._placeholderShow &&
          (placeholderNode.classList.remove('input-placeholder'),
          placeholderNode.setAttribute('style', ''),
          phClasss.length > 0)
        ) {
          for (var i = 0; i < phClasss.length; i++) {
            placeholderNode.classList.contains(phClasss[i]) &&
              placeholderNode.classList.remove(phClasss[i])
          }
        }
        ;(placeholderNode.style.display = 'none'), (this._placeholderShow = !1)
      } else {
        if (
          !this._placeholderShow &&
          (placeholderNode.classList.add('input-placeholder'),
          this.placeholderStyle &&
            placeholderNode.setAttribute('style', this.placeholderStyle),
          phClasss.length > 0)
        ) {
          for (var i = 0; i < phClasss.length; i++) {
            placeholderNode.classList.add(phClasss[i])
          }
        }
        ;(placeholderNode.style.display = ''),
          this.updateInput(),
          (this._placeholderShow = !0)
      }
    }
  })
})()
