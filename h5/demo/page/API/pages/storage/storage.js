Page({
  data: {
    key: '',
    data: '',
    dialog: {
      title: '',
      content: '',
      hidden: true
    }
  },
  keyChange: function (e) {
    this.data.key = e.detail.value
  },
  dataChange: function (e) {
    this.data.data = e.detail.value
  },
  getStorageAsync: function () {
    var key = this.data.key,
      data = this.data.data
    var storageData
    var self = this
    if (key.length === 0) {
      this.setData({
        key: key,
        data: data,
        'dialog.hidden': false,
        'dialog.title': '读取数据失败',
        'dialog.content': 'key 不能为空'
      })
    } else {
      wx.getStorage({
        key: key,
        success: function (res) {
          storageData = res.data
          self.setData({
            key: key,
            data: data,
            'dialog.hidden': false,
            'dialog.title': '读取数据成功',
            'dialog.content': "data: '" + storageData + "'"
          })
        },
        fail: function (res) {
          storageData = res.data
          self.setData({
            key: key,
            data: data,
            'dialog.hidden': false,
            'dialog.title': '读取数据失败',
            'dialog.content': '找不到 key 对应的数据'
          })
        },
        complete: function (res) {
          console.log(res)
        }
      })
    }
  },
  setStorageAsync: function () {
    var key = this.data.key
    var data = this.data.data
    var self = this
    // if (key.length === 0) {
    //   this.setData({
    //     key: key,
    //     data: data,
    //     'dialog.hidden': false,
    //     'dialog.title': '保存数据失败',
    //     'dialog.content': 'key 不能为空'
    //   })
    // } else {
    wx.setStorage({
      key: key,
      data: data,
      success: function (res) {
        console.log(res)
        self.setData({
          key: key,
          data: data,
          'dialog.hidden': false,
          'dialog.title': '存储数据成功'
        })
      },
      fail: function (res) {
        console.log(res)
      },
      complete: function (res) {
        console.log(res)
      }
    })
    // }
  },
  getStorageSync: function () {
    var key = this.data.key,
      data = this.data.data
    var storageData
    var self = this

    if (key.length === 0) {
      this.setData({
        key: key,
        data: data,
        'dialog.hidden': false,
        'dialog.title': '读取数据失败',
        'dialog.content': 'key 不能为空'
      })
    } else {
      storageData = wx.getStorageSync(key)
      if (storageData === '') {
        self.setData({
          key: key,
          data: data,
          'dialog.hidden': false,
          'dialog.title': '读取数据失败',
          'dialog.content': '找不到 key 对应的数据'
        })
      } else {
        self.setData({
          key: key,
          data: data,
          'dialog.hidden': false,
          'dialog.title': '读取数据成功',
          'dialog.content': "data: '" + storageData + "'"
        })
      }
    }
  },
  setStorageSync: function () {
    var key = this.data.key
    var data = this.data.data
    if (key.length === 0) {
      this.setData({
        key: key,
        data: data,
        'dialog.hidden': false,
        'dialog.title': '保存数据失败',
        'dialog.content': 'key 不能为空'
      })
    } else {
      wx.setStorageSync(key, data)
      this.setData({
        key: key,
        data: data,
        'dialog.hidden': false,
        'dialog.title': '存储数据成功'
      })
    }
  },
  clearStorage: function () {
    wx.clearStorage({
      success: function () {
        console.log('fuck')
      }
    })
    this.setData({
      key: '',
      data: '',
      'dialog.hidden': false,
      'dialog.title': '清除数据成功',
      'dialog.content': ''
    })
  },
  confirm: function () {
    this.setData({
      'dialog.hidden': true,
      'dialog.title': '',
      'dialog.content': ''
    })
  }
})
