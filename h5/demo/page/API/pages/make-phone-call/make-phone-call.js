Page({
  data: {
    disabled: true
  },
  bindInput: function (e) {
    this.inputValue = e.detail.value

    if (this.inputValue.length > 0) {
      this.setData({
        disabled: false
      })
    } else {
      this.setData({
        disabled: true
      })
    }
  },
  makePhoneCall: function () {
    var that = this
    wx.makePhoneCall({
      phoneNumber: this.inputValue,
      success: function () {
        console.log('成功拨打电话')
      }
    })
  }
})
