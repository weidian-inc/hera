// wx-checkbox-group
export default  window.exparser.registerElement({
    is: 'wx-checkbox-group',
    template: '\n    <slot></slot>\n  ',
    behaviors: ['wx-base', 'wx-data-Component', 'wx-group'],
    properties: {
        value: {
            type: Array,
            value: []
        }
    },
    addItem: function (checkbox) {
        checkbox.checked && this.value.push(checkbox.value)
    },
    removeItem: function (checkbox) {
        if (checkbox.checked) {
            var index = this.value.indexOf(checkbox.value)
            index >= 0 && this.value.splice(index, 1)
        }
    },
    renameItem: function (checkbox, newVal, oldVal) {
        if (checkbox.checked) {
            var index = this.value.indexOf(oldVal)
            index >= 0 && (this.value[index] = newVal)
        }
    },
    changed: function (checkbox) {
        if (checkbox.checked) {
            this.value.push(checkbox.value)
        } else {
            var index = this.value.indexOf(checkbox.value)
            index >= 0 && this.value.splice(index, 1)
        }
    }
})

