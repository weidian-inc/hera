// wx-label
export default  window.exparser.registerElement({
    is: 'wx-label',
    template: '\n    <slot></slot>\n  ',
    properties: {
        for: {
            type: String,
            public: !0
        }
    },
    listeners: {
        tap: 'onTap'
    },
    behaviors: ['wx-base'],
    _handleNode: function (ele, event) {
        return (
            !!(ele instanceof exparser.Element &&
            ele.hasBehavior('wx-label-target')) && (ele.handleLabelTap(event), !0)
        )
    },
    dfs: function (ele, event) {
        if (this._handleNode(ele, event)) return !0
        if (!ele.childNodes) return !1
        for (var idx = 0; idx < ele.childNodes.length; ++idx) {
            if (this.dfs(ele.childNodes[idx], event)) return !0
        }
        return !1
    },
    onTap: function (event) {
        for (
            var target = event.target;
            target instanceof exparser.Element && target !== this;
            target = target.parentNode
        ) {
            if (target.hasBehavior('wx-label-target')) return
        }
        if (this.for) {
            var boundEle = document.getElementById(this.for)
            boundEle && this._handleNode(boundEle.__wxElement, event)
        } else {
            this.dfs(this, event)
        }
    }
})