// wx-form
export default window.exparser.registerElement({
  is: 'wx-form',
  template: '\n    <span id="wrapper"><slot></slot></span>\n  ',
  behaviors: ['wx-base'],
  properties: {
    reportSubmit: {
      type: Boolean,
      value: !1,
      public: !0
    }
  },
  listeners: {
    'this.formSubmit': 'submitHandler',
    'this.formReset': 'resetHandler'
  },
  resetDfs: function (element) {
    if (element.childNodes) {
      for (var i = 0; i < element.childNodes.length; ++i) {
        var curChild = element.childNodes[i]
        curChild instanceof exparser.Element &&
          (curChild.hasBehavior('wx-data-Component') &&
            curChild.resetFormData(),
          this.resetDfs(curChild))
      }
    }
  },
  getFormData: function (form, fn) {
    return form.name && form.hasBehavior('wx-data-Component')
      ? form.__domElement.tagName === 'WX-INPUT' ||
        form.__domElement.tagName === 'WX-PICKER' ||
        form.__domElement.tagName === 'WX-TEXTAREA'
        ? form.getFormData(function (e) {
          fn(e)
        })
        : fn(form.getFormData())
      : fn()
  },
  asyncDfs: function (element, fn) {
    var self = this,
      resFn = function () {
        typeof fn === 'function' && fn()
        fn = void 0
      }
    if (!element.childNodes) {
      return resFn()
    }
    for (
      var length = element.childNodes.length, i = 0;
      i < element.childNodes.length;
      ++i
    ) {
      var curChild = element.childNodes[i]
      curChild instanceof exparser.Element
        ? !(function (form) {
          self.getFormData(form, function (val) {
            typeof val !== 'undefined' && (self._data[form.name] = val)
            self.asyncDfs(form, function () {
              --length == 0 && resFn()
            })
          })
        })(curChild)
        : --length
    }
    length == 0 && resFn()
  },
  submitHandler: function (event) {
    var self = this,
      _target = {
        id: event.target.__domElement.id,
        dataset: event.target.dataset,
        offsetTop: event.target.__domElement.offsetTop,
        offsetLeft: event.target.__domElement.offsetLeft
      }
    this._data = Object.create(null)
    return (
      this.asyncDfs(this, function () {
        self.reportSubmit
          ? self._isDevTools()
            ? self.triggerEvent('submit', {
              value: self._data,
              formId: 'the formId is subscribe mock one',
              target: _target
            })
            : HeraJSBridge.invoke('reportSubmitForm', {}, function (e) {
              self.triggerEvent('submit', {
                value: self._data,
                formId: e.formId,
                target: _target
              })
            })
          : self.triggerEvent('submit', { value: self._data, target: _target })
      }),
      !1
    )
  },
  resetHandler: function (event) {
    var _target = {
      id: event.target.__domElement.id,
      dataset: event.target.dataset,
      offsetTop: event.target.__domElement.offsetTop,
      offsetLeft: event.target.__domElement.offsetLeft
    }
    this._data = Object.create(null)
    this.resetDfs(this)
    this.triggerEvent('reset', { target: _target })
    return !1
  }
})
