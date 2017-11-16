Page({
  data: {
    url: '',
    data: '',
    dialog: {
      title: '',
      content: '',
      hidden: true
    }
  },
  urlChange: function (e) {
    this.data.url = e.detail.value
  },
  openLink: function (e) {
    if(this.data.url){
      if(this.data.url.indexOf('http')!==0){
        this.data.url = 'http://'+this.data.url;
      }
      console.log(this.data.url);
      wx.openLink({
        url: this.data.url
      })
    }
  }
})
