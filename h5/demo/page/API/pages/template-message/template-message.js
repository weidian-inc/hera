const templateMessageUrl = require('../../../../config').templateMessageUrl

var app = getApp()

const formData = {
  address: 'T.I.T 造舰厂',
  time: '2017.01.09',
  name: '帝国歼星舰',
  serial: '123456789'
}

Page({
  onLoad: function () {
    this.setData({
      formData
    })
  },

  submitForm: function (e) {
    var self = this
    var form_id = e.detail.formId
    var formData = e.detail.value

    console.log('form_id is:', form_id)

    self.setData({
      loading: true
    })

    app.getUserOpenId(function (err, openid) {
      if (!err) {
        wx.request({
          url: templateMessageUrl,
          method: 'POST',
          data: {
            form_id,
            openid,
            formData
          },
          success: function (res) {
            console.log('submit form success', res)
            wx.showToast({
              title: '发送成功',
              icon: 'success'
            })
            self.setData({
              loading: false
            })
          },
          fail: function ({ errMsg }) {
            console.log('submit form fail, errMsg is:', errMsg)
          }
        })
      } else {
        console.log('err:', err)
      }
    })
  }
})
