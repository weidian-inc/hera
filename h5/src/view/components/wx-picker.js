// wx-picker
import Picker from './sdk/picker'
import TimePicker from './sdk/timePicker'
import DatePicker from './sdk/datePicker'

const eventPrefix = 'custom_event_'
export default window.exparser.registerElement({
  is: 'wx-picker',
  template: '<div id="wrapper"><slot></slot></div>',
  behaviors: ['wx-base', 'wx-data-Component'],
  properties: {
    range: {
      type: Array,
      value: [],
      public: !0
    },
    value: {
      type: String,
      value: '',
      public: !0
    },
    mode: {
      type: String,
      value: 'selector',
      public: !0
    },
    fields: {
      type: String,
      value: 'day',
      public: !0
    },
    start: {
      type: String,
      value: '',
      public: !0
    },
    end: {
      type: String,
      value: '',
      public: !0
    },
    disabled: {
      type: Boolean,
      value: !1,
      public: !0
    },
    rangeKey: {
      type: String,
      value: '',
      public: !0
    }
  },
  listeners: {
    'wrapper.tap': 'showPickerView'
  },
  resetFormData: function () {
    this.mode == 'selector' ? (this.value = -1) : (this.value = '')
  },
  getFormData: function (formCallback) {
    this.__pickerShow
      ? (this.__formCallback = formCallback)
      : typeof formCallback === 'function' && formCallback(this.value)
  },
  formGetDataCallback: function () {
    typeof this.__formCallback === 'function' && this.__formCallback(this.value)
    this.__formCallback = void 0
  },
  showPickerView: function () {
    this.mode == 'date' || this.mode == 'time'
      ? this.showDatePickerView()
      : this.mode === 'selector' && this.showSelector()
  },
  getCustomerStyle: function () {
    var customerStyle = this.$.wrapper.getBoundingClientRect()
    return {
      width: customerStyle.width,
      height: customerStyle.height,
      left: customerStyle.left + window.scrollX,
      top: customerStyle.top + window.scrollY
    }
  },
  showSelector: function (e) {
    var that = this
    if (!this.disabled) {
      var _value = parseInt(this.value)
      ;(isNaN(_value) || _value >= this.range.length) && (_value = 0)

      var pickerData = []
      if (this.rangeKey) {
        for (var idx = 0; idx < this.range.length; idx++) {
          var r = this.range[idx]
          pickerData.push(r[this.rangeKey] + '')
        }
      } else {
        for (var o = 0; o < this.range.length; o++) {
          pickerData.push(this.range[o] + '')
        }
      }

      const args = {
        array: pickerData,
        current: _value,
        style: this.getCustomerStyle()
      }
      HeraJSBridge.subscribe(
        'showPickerView',
        // args,
        function (res) {
          ;/:ok/.test(res.errMsg) &&
            ((that.value = res.index),
            that.triggerEvent('change', {
              value: that.value
            }))
          that.resetPickerState()
          that.formGetDataCallback()
        }
      )

      const picker = new Picker(args)
      picker.show()
      picker.on('select', n => {
        HeraJSBridge.subscribeHandler(eventPrefix + 'showPickerView', {
          errMsg: 'showPickerView:ok',
          index: n
        })
      })
      this.__pickerShow = !0
    }
  },
  showDatePickerView: function () {
    var _this = this
    if (!this.disabled) {
      const args = {
        range: {
          start: this.start,
          end: this.end
        },
        mode: this.mode,
        current: this.value,
        fields: this.fields,
        style: this.getCustomerStyle()
      }
      HeraJSBridge.subscribe(
        'showDatePickerView',
        // args,
        function (t) {
          ;/:ok/.test(t.errMsg) &&
            ((_this.value = t.value),
            _this.triggerEvent('change', {
              value: _this.value
            }))
          _this.resetPickerState()
          _this.formGetDataCallback()
        }
      )
      let picker
      let eventName
      if (args.mode == 'time') {
        eventName = 'bindTimeChange'
        picker = new TimePicker(args)
      } else {
        eventName = 'bindDateChange'
        picker = new DatePicker(args)
      }
      picker.show()
      picker.on('select', val => {
        HeraJSBridge.subscribeHandler(eventPrefix + 'showDatePickerView', {
          errMsg: 'showDatePickerView:ok',
          value: val
        })
      })
      this.__pickerShow = !0
    }
  },
  resetPickerState: function () {
    this.__pickerShow = !1
  }
})
