Page({
  setNaivgationBarTitle: function (e) {
    var title = e.detail.value.title
    console.log(title)
    wx.setNavigationBarTitle({
      title: title,
      success: function () {
        console.log('setNavigationBarTitle success')
      },
      fail: function (err) {
        console.log('setNavigationBarTitle fail, err is', err)
      }
    })

    return false
  }
})
