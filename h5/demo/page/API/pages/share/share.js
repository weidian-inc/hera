Page({
  data: {
    shareData: {
      title: '自定义分享标题',
      desc: '自定义分享描述',
      path: '/page/API/pages/share/share'
    }
  },
  onShareAppMessage: function () {
    return this.data.shareData
  }
})
