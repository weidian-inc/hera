const downloadExampleUrl = require('../../../../config').downloadExampleUrl

Page({
  downloadImage: function () {
    var self = this

    wx.downloadFile({
      url: downloadExampleUrl,
      success: function (res) {
        console.log('downloadFile success, res is', res)
        // wx.openDocument({
        //   filePath: res.tempFilePath,
        //   success: function (res) {
        //     console.log('打开文档成功')
        //   }
        // })
        self.setData({
          imageSrc: res.tempFilePath
        })
      },
      fail: function ({ errMsg }) {
        console.log('downloadFile fail, err is:', errMsg)
      }
    })
  }
})
