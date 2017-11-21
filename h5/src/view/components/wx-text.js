// wx-text
export default window.exparser.registerElement({
  is: 'wx-text',
  template:
    '\n    <span id="raw" style="display:none;"><slot></slot></span>\n    <span id="main"></span>\n  ',
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
    },
    decode: {
      type: Boolean,
      value: !1,
      public: !0
    },
    space: {
      type: String,
      value: '',
      public: !0
    }
  },
  _styleChanged: function (styles) {
    this.$$.setAttribute('style', styles)
  },
  _classChanged: function (cls) {
    this.$$.setAttribute('class', cls)
  },
  _htmlDecode: function (txt) {
    this.space &&
      (this.space === 'nbsp'
        ? (txt = txt.replace(/ /g, ' '))
        : this.space === 'ensp'
          ? (txt = txt.replace(/ /g, ' '))
          : this.space === 'emsp' && (txt = txt.replace(/ /g, ' ')))

    return this.decode
      ? txt
          .replace(/&nbsp;/g, ' ')
          .replace(/&ensp;/g, ' ')
          .replace(/&emsp;/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/&amp;/g, '&')
      : txt
  },
  _update: function () {
    var rawEle = this.$.raw,
      fragment = document.createDocumentFragment(),
      idx = 0,
      len = rawEle.childNodes.length
    for (; idx < len; idx++) {
      var childNode = rawEle.childNodes.item(idx)
      if (childNode.nodeType === childNode.TEXT_NODE) {
        const txtList = this._htmlDecode(childNode.textContent).split('\n')
        for (let i = 0; i < txtList.length; i++) {
          i && fragment.appendChild(document.createElement('br'))
          fragment.appendChild(document.createTextNode(txtList[i]))
        }
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
