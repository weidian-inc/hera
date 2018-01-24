// index.js
Page({
  data: {
    nodes: [
      {
        name: 'div',
        attrs: {
          class: 'div_class',
          style: 'line-height: 60px; color: red;'
        },
        children: [
          {
            type: 'text',
            text: 'Hello&nbsp;World!'
          }
        ]
      }
    ]
  },
  tap () {
    this.testPromise()
  },
  testPromise: function () {
    var getItLater = function () {
      return new Promise((resolve, reject) => {
        console.log(55555)
        setTimeout(() => {
          resolve(6666)
        }, 2000)
      })
    }
    getItLater().then(res => console.log(res))
  },
  onLoad: function (options) {
    // Do some initialize when page load.
    console.log('onLoad')
  },
  onReady: function () {
    // Do something when page ready.
    console.log('onReady')
  },
  onShow: function () {
    // Do something when page show.
    console.log('onShow')
  },
  onHide: function () {
    // Do something when page hide.
    console.log('onHide')
  },
  onUnload: function () {
    // Do something when page close.
    console.log('onUnload')
  },
  onPullDownRefresh: function () {
    // Do something when pull down.
    console.log('onPullDownRefresh')
  },
  onReachBottom: function () {
    // Do something when page reach bottom.
    console.log('onReachBottom')
  },
  onShareAppMessage: function () {
    // return custom share data when user share.
    console.log('onShareAppMessage')
  },
  onPageScroll: function () {
    // Do something when page scroll
    console.log('onPageScroll')
  }
})
