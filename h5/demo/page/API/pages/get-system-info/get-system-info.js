Page({
  data: {
    systemInfo: {}
  },
  getSystemInfo: function () {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        res.route = that.route
        that.setData({
          systemInfo: res
        })
        that.update()
      }
    })
  }
})
