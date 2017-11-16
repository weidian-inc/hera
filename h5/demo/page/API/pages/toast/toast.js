Page({
  toast1Tap: function () {
    wx.showToast({
      title: '默认'
    })
  },
  toast2Tap: function () {
    wx.showToast({
      title: 'duration 3000',
      duration: 3000
    })
  },
  toast3Tap: function () {
    wx.showToast({
      title: 'loading',
      icon: 'loading',
      duration: 5000
    })
  },
  hideToast: function () {
    wx.hideToast()
  }
})
