Page({
  getFields: function () {
    wx
      .createSelectorQuery()
      .select('#the-id')
      .fields(
      {
        dataset: true,
        size: true,
        scrollOffset: true,
        properties: ['scrollX', 'scrollY']
      },
        function (res) {
          console.log(res)
          // res.dataset    // 节点的dataset
          // res.width      // 节点的宽度
          // res.height     // 节点的高度
          // res.scrollLeft // 节点的水平滚动位置
          // res.scrollTop  // 节点的竖直滚动位置
          // res.scrollX    // 节点 scroll-x 属性的当前值
          // res.scrollY    // 节点 scroll-x 属性的当前值
        }
      )
      .exec()
  }
})
