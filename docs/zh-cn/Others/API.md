<p class="title"> 小程序API支持列表 </p>

<section>
  <p>下文列出了<code>Hera</code>目前支持的小程序API列表,小程序完整API及使用文档请参考
    <a style="color:#66bef8;" target="_blank" href="https://mp.weixin.qq.com/debug/wxadoc/dev/index.html">微信小程序开发者文档</a>
  </p>
</section>

# 网络


## wx.request
>发起网络请求

## wx.uploadFile
>将本地资源上传到开发者服务器，客户端发起一个 HTTPS POST 请求

## wx.downloadFile
> 下载文件资源到本地，客户端直接发起一个 HTTP GET 请求，返回文件的本地临时路径


<br />
<br />
<br />
# 界面

## wx.showToast
> 显示消息提示框

## wx.showLoading
> 显示 loading 提示框, 需主动调用 wx.hideLoading 才能关闭提示框

## wx.hideToast
> 隐藏消息提示框

## wx.hideLoading
> 隐藏 loading 提示框

## wx.showModal
> ​显示模态弹窗

## wx.showActionSheet
> ​显示操作菜单

## wx.setNavigationBarColor
> 动态设置标题栏背景颜色

## wx.setNavigationBarTitle
> 动态设置当前页面的标题

## wx.showNavigationBarLoading
> 在当前页面显示导航条加载动画

## wx.hideNavigationBarLoading
> 隐藏导航条加载动画

## wx.setTopBarText
> 动态设置置顶栏文字内容

## wx.navigateTo
> 保留当前页面，跳转到应用内的某个页面

## wx.redirectTo
> 关闭当前页面，跳转到应用内的某个页面

## wx.reLaunch
> 关闭所有页面，打开到应用内的某个页面

## wx.switchTab
> 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面

## wx.navigateBack
> 关闭当前页面，返回上一页面或多级页面

## wx.createAnimation
> 创建一个动画实例animation

## wx.pageScrollTo
> 将页面滚动到目标位置

## wx.createCanvasContext
> 创建 canvas 绘图上下文

## wx.startPullDownRefresh
> 开始下拉刷新，调用后触发下拉刷新动画，效果与用户手动下拉刷新一致

## wx.stopPullDownRefresh
> 停止当前页面下拉刷新

<br />
<br />
<br />

# 媒体
## wx.chooseImage
>从本地相册选择图片或使用相机拍照。

## wx.previewImage
>预览图片

## wx.getImageInfo
> 获取图片信息

<br />
<br />
<br />
# 文件

## wx.saveFile
> 保存文件到本地

## wx.getFileInfo
> ​获取文件信息

## wx.removeSavedFile
> 删除本地存储的文件

<br />
<br />
<br />
# 数据缓存

## wx.setStorage
> 将数据存储在本地缓存中指定的 key 中，会覆盖掉原来该 key 对应的内容，这是一个异步接口

## wx.setStorageSync
> 将 data 存储在本地缓存中指定的 key 中，会覆盖掉原来该 key 对应的内容，这是一个同步接口

## wx.getStorage
> 从本地缓存中异步获取指定 key 对应的内容。

## wx.getStorageSync
> 从本地缓存中同步获取指定 key 对应的内容

## wx.getStorageInfo
> 异步获取当前storage的相关信息

## wx.getStorageInfoSync
> 同步获取当前storage的相关信息

## wx.removeStorage
> 从本地缓存中异步移除指定 key

## wx.removeStorageSync
> 从本地缓存中同步移除指定 key

## wx.clearStorage
> 清理本地数据缓存

## wx.clearStorageSync
> 同步清理本地数据缓存

<br />
<br />
<br />
# 设备

## wx.getSystemInfo
> 获取系统信息

## wx.canIUse
> 判断小程序的API，回调，参数，组件等是否在当前版本可用

## wx.getNetworkType
> 获取网络类型

## wx.makePhoneCall
> 打电话

## wx.scanCode
> 调起客户端扫码界面，扫码成功后返回对应的结果

## wx.setClipboardData
> 设置系统剪贴板的内容

## wx.getClipboardData
> 获取系统剪贴板内容
