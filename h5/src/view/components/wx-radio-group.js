// wx-radio-group
export default  window.exparser.registerElement({
    is: 'wx-radio-group',
    template: '\n    <slot></slot>\n  ',
    behaviors: ['wx-base', 'wx-data-Component', 'wx-group'],
    properties: {
        value: {
            type: String
        }
    },
    created: function () {
        this._selectedItem = null
    },
    addItem: function (e) {
        e.checked &&
        (this._selectedItem && (this._selectedItem.checked = !1), (this.value =
            e.value), (this._selectedItem = e))
    },
    removeItem: function (e) {
        this._selectedItem === e && ((this.value = ''), (this._selectedItem = null))
    },
    renameItem: function (e, t) {
        this._selectedItem === e && (this.value = t)
    },
    changed: function (e) {
        this._selectedItem === e ? this.removeItem(e) : this.addItem(e)
    }
})
