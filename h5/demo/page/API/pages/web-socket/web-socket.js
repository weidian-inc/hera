const qcloud = require('../../../../vendor/qcloud-weapp-client-sdk/index')
const loginUrl = require('../../../../config').loginUrl
const tunnelUrl = require('../../../../config').tunnelUrl

function showModal (title, content) {
  wx.showModal({
    title,
    content,
    showCancel: false
  })
}

function showSuccess (title) {
  wx.showToast({
    title,
    icon: 'success',
    duration: 1000
  })
}

Page({
  data: {
    socketStatus: 'closed'
  },

  onLoad: function () {
    var self = this

    qcloud.setLoginUrl(loginUrl)

    qcloud.login({
      success: function (result) {
        console.log('登录成功', result)
        self.setData({
          hasLogin: true
        })
      },

      fail: function (error) {
        console.log('登录失败', error)
      }
    })
  },

  onUnload: function () {
    this.closeSocket()
  },

  toggleSocket: function (e) {
    const turnedOn = e.detail.value

    if (turnedOn && this.data.socketStatus == 'closed') {
      this.openSocket()
    } else if (!turnedOn && this.data.socketStatus == 'connected') {
      var showSuccess = true
      this.closeSocket(showSuccess)
    }
  },

  openSocket: function () {
    var socket = (this.socket = new qcloud.Tunnel(tunnelUrl))

    socket.on('connect', () => {
      console.log('WebSocket 已连接')
      showSuccess('Socket已连接')
      this.setData({
        socketStatus: 'connected',
        waitingResponse: false
      })
    })

    socket.on('close', () => {
      console.log('WebSocket 已断开')
      this.setData({ socketStatus: 'closed' })
    })

    socket.on('error', error => {
      showModal('发生错误', JSON.stringify(error))
      console.error('socket error:', error)
      this.setData({
        loading: false
      })
    })

    // 监听服务器推送消息
    socket.on('message', message => {
      showSuccess('收到信道消息')
      console.log('socket message:', message)
      this.setData({
        loading: false
      })
    })

    // 打开信道
    socket.open()
  },

  closeSocket: function (showSuccessToast) {
    if (this.socket) {
      this.socket.close()
    }
    if (showSuccessToast) showSuccess('Socket已断开')
    this.setData({ socketStatus: 'closed' })
  },

  sendMessage: function () {
    if (this.socket && this.socket.isActive()) {
      this.socket.emit('message', {
        content: 'Hello, 小程序!'
      })
      this.setData({
        loading: true
      })
    }
  }
})
