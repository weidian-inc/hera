// wx-text
export default  window.exparser.registerElement({
    is: 'wx-text',
    template: '\n    <span id="raw" style="display:none;"><slot></slot></span>\n    <span id="main"></span>\n  ',
    behaviors: ['wx-base'],
    properties: {
        style: {
            type: String,
            public: !0,
            observer: '_styleChanged'
        },
        class: {
            type: String,
            public: !0,
            observer: '_classChanged'
        },
        selectable: {
            type: Boolean,
            value: !1,
            public: !0
        }
    },
    _styleChanged: function (styles) {
        this.$$.setAttribute('style', styles)
    },
    _classChanged: function (cls) {
        this.$$.setAttribute('class', cls)
    },
    _htmlEncode: function (txt) {
        return txt
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/\'/g, '&apos;')
    },
    _update: function () {
        var rawEle = this.$.raw,
            fragment = document.createDocumentFragment(),
            idx = 0,
            len = rawEle.childNodes.length
        for (; idx < len; idx++) {
            var childNode = rawEle.childNodes.item(idx)
            if (childNode.nodeType === childNode.TEXT_NODE) {
                var spanEle = document.createElement('span')
                spanEle.innerHTML = this._htmlEncode(childNode.textContent).replace(
                    /\n/g,
                    '<br>'
                )
                fragment.appendChild(spanEle)
            } else {
                childNode.nodeType === childNode.ELEMENT_NODE &&
                childNode.tagName === 'WX-TEXT' &&
                fragment.appendChild(childNode.cloneNode(!0))
            }
        }
        this.$.main.innerHTML = ''
        this.$.main.appendChild(fragment)
    },
    created: function () {
        this._observer = exparser.Observer.create(function () {
            this._update()
        })
        this._observer.observe(this, {
            childList: !0,
            subtree: !0,
            characterData: !0,
            properties: !0
        })
    },
    attached: function () {
        this._update()
    }
})
