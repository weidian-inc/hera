// wx-slider
export default  window.exparser.registerElement({
    is: 'wx-slider',
    template: '\n    <div class="wx-slider-wrapper" class.wx-slider-disabled="{{disabled}}">\n      <div class="wx-slider-tap-area" id="wrapper">\n        <div class="wx-slider-handle-wrapper" style.background-color="{{color}}">\n          <div class="wx-slider-handle" style.left="{{_getValueWidth(value,min,max)}}" id="handle"></div>\n          <div class="wx-slider-track" style.width="{{_getValueWidth(value,min,max)}}" style.background-color="{{selectedColor}}"></div>\n          <div class="wx-slider-step" id="step"></div>\n        </div>\n      </div>\n      <span hidden$="{{!showValue}}" class="wx-slider-value">\n        <p parse-text-content>{{value}}</p>\n      </span>\n    </div>\n  ',
    properties: {
        min: {
            type: Number,
            value: 0,
            public: !0,
            observer: '_revalicateRange'
        },
        max: {
            type: Number,
            value: 100,
            public: !0,
            observer: '_revalicateRange'
        },
        step: {
            type: Number,
            value: 1,
            public: !0
        },
        value: {
            type: Number,
            value: 0,
            public: !0,
            coerce: '_filterValue'
        },
        showValue: {
            type: Boolean,
            value: !1,
            public: !0
        },
        color: {
            type: String,
            value: '#e9e9e9'
        },
        selectedColor: {
            type: String,
            value: '#1aad19'
        }
    },
    listeners: {
        'wrapper.tap': '_onTap'
    },
    behaviors: ['wx-base', 'wx-data-Component', 'wx-disabled', 'wx-touchtrack'],
    created: function () {
        this.touchtrack(this.$.handle, '_onTrack')
    },
    _filterValue: function (val) {
        if (val < this.min) return this.min
        if (val > this.max) return this.max
        var stepWidth = Math.round((val - this.min) / this.step)
        return stepWidth * this.step + this.min
    },
    _revalicateRange: function () {
        this.value = this._filterValue(this.value)
    },
    _getValueWidth: function (val, min, max) {
        return 100 * (val - min) / (max - min) + '%'
    },
    _getXPosition: function (ele) {
        for (var width = ele.offsetLeft; ele; ele = ele.offsetParent) {
            width += ele.offsetLeft
        }
        return width - document.body.scrollLeft
    },
    _onUserChangedValue: function (event) {
        var offsetWidth = this.$.step.offsetWidth,
            currPos = this._getXPosition(this.$.step),
            value =
                (event.detail.x - currPos) * (this.max - this.min) / offsetWidth +
                this.min
        ;(value = this._filterValue(value)), (this.value = value)
    },
    _onTrack: function (event) {
        if (!this.disabled) {
            return event.detail.state === 'move'
                ? (this._onUserChangedValue(event), !1)
                : void (event.detail.state === 'end' &&
                this.triggerEvent('change', {
                    value: this.value
                }))
        }
    },
    _onTap: function (event) {
        this.disabled ||
        (this._onUserChangedValue(event), this.triggerEvent('change', {
            value: this.value
        }))
    },
    resetFormData: function () {
        this.value = this.min
    }
})
