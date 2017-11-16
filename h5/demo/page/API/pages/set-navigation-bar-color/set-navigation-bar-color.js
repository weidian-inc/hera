Page({
  setNaivgationBarColor: function (e) {
    var backgroundColor = e.detail.value.backgroundColor
    var frontColor = e.detail.value.frontColor
    console.log(backgroundColor, frontColor)
    wx.setNavigationBarColor({
      backgroundColor: backgroundColor || '#c4d7e6',
      frontColor: frontColor || '#ffffff',
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      },
      success: function () {
        console.log('setNavigationBarColor success')
      },
      fail: function (err) {
        console.log('setNavigationBarColor fail, err is', err)
      }
    })
    return false
  }
})
