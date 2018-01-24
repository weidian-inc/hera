// let e = !1
window.exparser.registerElement({
  is: 'wx-web-view',
  // template: function (e, t, n) {
  //   return [{ t: 1, n: 'div', a: [], c: [] }]
  // },
  template: '<div></div>',
  behaviors: ['wx-base', 'wx-native', 'wx-positioning-target'],
  properties: { src: { type: String, public: !0, observer: 'srcChange' } },
  srcChange: function (e, t) {
    if (this._isReady) {
      var n = this.uuid
      HeraJSBridge.invoke(
        'updateHTMLWebView',
        { htmlId: n, src: (e || '').trim() },
        function (e) {}
      )
    } else this._deferred.push({ callback: 'srcChange', args: [e, t] })
  },
  _hiddenChanged: function (e, t) {},
  inserted: !1,
  attached: function () {
    try {
      if (this.inserted) return void console.warn('一个页面只能插入一个 `wx-web-view`。')
      this.uuid = this.getPositioningId()
      var t = this,
        n = this.uuid
      // wx.getSystemInfo({
      //   success: function (e) {
      // t.$$.style.width = e.windowWidth + 'px'
      // t.$$.style.height = e.windowHeight + 'px'
      // var i = document.querySelector('body')
      // i.style.height = e.windowHeight + 'px'
      // i.style.overflowY = 'hidden'
      HeraJSBridge.invoke(
        'insertHTMLWebView',
        {
          htmlId: n,
          position: {
            left: 0,
            top: 0
            // width: e.windowWidth,
            // height: e.windowHeight
          }
        },
        function (e) {
          ;/ok/.test(e.errMsg) && t._ready()
        }
      )
    } catch (e) {
      console.log(e)
    }

    // }
    // })
    this.inserted = !0
  },
  detached: function () {
    var t = this.uuid
    HeraJSBridge.invoke('removeHTMLWebView', { htmlId: t }, t => {
      // document.body.style.height = ''
      // document.body.style.overflowY = ''
      this.inserted = !1
    })
  }
})
