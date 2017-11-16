export default  window.exparser.registerElement({
    is: 'wx-picker-view',
    template: '<div id="wrapper" class="wrapper"><slot></slot></div>',
    behaviors: ['wx-base', 'wx-data-Component'],
    properties: {
        value: {
            type: Array,
            value: [],
            public: !0,
            observer: '_valueChanged'
        },
        indicatorStyle: {
            type: String,
            value: '',
            public: !0
        }
    },
    listeners: {
        'this.wxPickerColumnValueChanged': '_columnValueChanged'
    },
    attached: function () {
        this._initColumns()
    },
    _initColumns: function () {
        var _this = this,
            columns = (this._columns = []),
            getColumns = function getColumns (rootNode) {
                for (var i = 0; i < rootNode.childNodes.length; i++) {
                    var node = rootNode.childNodes[i]
                    node instanceof exparser.Element &&
                    (node.hasBehavior('wx-picker-view-column')
                        ? columns.push(node)
                        : getColumns(node))
                }
            }

        getColumns(this)
        var _value = Array.isArray(this.value) ? this.value : []
        columns.forEach(function (col, idx) {
            col._setStyle(_this.indicatorStyle)
            col._setHeight(_this.$$.offsetHeight)
            col._setCurrent(_value[idx] || 0), col._init()
        })
    },
    _columnValueChanged: function () {
        var values = this._columns.map(function (column) {
            return column._getCurrent()
        })
        this.triggerEvent('change', {
            value: values
        })
    },
    _valueChanged: function () {
        var e = arguments.length <= 0 || void 0 === arguments[0] ? [] : arguments[0]
        ;(this._columns || []).forEach(function (column, n) {
            column._setCurrent(e[n] || 0)
            column._update()
        })
    }
})
