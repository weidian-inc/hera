// wx-group
export default window.exparser.registerBehavior({
    is: 'wx-group',
    listeners: {
        'this.wxItemValueChanged': '_handleItemValueChanged',
        'this.wxItemCheckedChanged': '_handleItemCheckedChanged',
        'this.wxItemAdded': '_handleItemAdded',
        'this.wxItemRemoved': '_handleItemRemoved',
        'this.wxItemChangedByTap': '_handleChangedByTap'
    },
    _handleItemValueChanged: function (event) {
        this.renameItem(event.detail.item, event.detail.newVal, event.detail.oldVal)
    },
    _handleItemCheckedChanged: function (event) {
        this.changed(event.detail.item)
    },
    _handleItemAdded: function (event) {
        event.detail.item._relatedGroup = this
        this.addItem(event.detail.item)
        return !1
    },
    _handleItemRemoved: function (event) {
        this.removeItem(event.detail.item)
        return !1
    },
    _handleChangedByTap: function () {
        this.triggerEvent('change', {
            value: this.value
        })
    },
    addItem: function () {},
    removeItem: function () {},
    renameItem: function () {},
    changed: function () {},
    resetFormData: function () {
        if (this.hasBehavior('wx-data-Component')) {
            var checkChilds = function (element) {
                element.childNodes.forEach(function (childNode) {
                    if (
                        childNode instanceof exparser.Element &&
                        !childNode.hasBehavior('wx-group')
                    ) {
                        return childNode.hasBehavior('wx-item')
                            ? void childNode.resetFormData()
                            : void checkChilds(childNode)
                    }
                })
            }
            checkChilds(this)
        }
    }
})