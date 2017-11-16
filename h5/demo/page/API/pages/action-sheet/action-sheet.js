Page({
  actionSheetTap: function () {
    wx.showActionSheet({
      itemList: ['item1', 'item2', 'item3', 'item4'],
      success: function (e) {
        console.log(e.tapIndex)
      }
    })
  }
})
