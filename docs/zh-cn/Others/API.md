<p class="title"> 小程序API支持列表 </p>

<section>
  <p style="color:#000">以下列出了<code>Hera</code>目前支持的小程序API列表,小程序完整API及使用文档请参考
    <a style="color:#66bef8;" target="_blank" href="https://mp.weixin.qq.com/debug/wxadoc/dev/api/">微信小程序开发者文档</a>
  </p>
</section>

 
<br />
# 网络

<font size=3 color=#000>API</font> | <font size=3 color=#000>说明 </font>
----|------
<font size=3 color=#3898fc>wx.request</font> | <font size=2 >发起网络请求 </font>
<font size=3 color=#3898fc>wx.uploadFile </font>| <font size=2 >将本地资源上传到开发者服务器，客户端发起一个 HTTPS POST 请求  </font>
<font size=3 color=#3898fc>wx.downloadFile</font> | <font size=2 >下载文件资源到本地，客户端直接发起一个 HTTP GET 请求，返回文件的本地临时路径 </font>

<br />
<br />
# 界面

<font size=3 color=#000>API</font> | <font size=3 color=#000>说明 </font>
----|------
<font size=3 color=#3898fc>wx.showToast</font> | <font size=2 >显示消息提示框</font>
<font size=3 color=#3898fc>wx.showLoading</font> | <font size=2 >显示 loading 提示框, 需主动调用 wx.hideLoading 才能关闭提示框</font>
<font size=3 color=#3898fc>wx.hideToast</font> | <font size=2 >隐藏消息提示框</font>
<font size=3 color=#3898fc>wx.hideLoading</font> | <font size=2 >隐藏 loading 提示框</font>
<font size=3 color=#3898fc>wx.showModal</font> | <font size=2 >显示模态弹窗</font>
<font size=3 color=#3898fc>wx.showActionSheet</font> | <font size=2 >显示操作菜单</font>
<font size=3 color=#3898fc>wx.setNavigationBarColor</font> | <font size=2 >动态设置标题栏背景颜色</font>
<font size=3 color=#3898fc>wx.setNavigationBarTitle</font> | <font size=2 >动态设置当前页面的标题</font>
<font size=3 color=#3898fc>wx.showNavigationBarLoading</font> | <font size=2 >在当前页面显示导航条加载动画</font>
<font size=3 color=#3898fc>wx.hideNavigationBarLoading</font> | <font size=2 >隐藏导航条加载动画</font>
<font size=3 color=#3898fc>wx.setTopBarText</font> | <font size=2 >动态设置置顶栏文字内容</font>
<font size=3 color=#3898fc>wx.navigateTo</font> | <font size=2 >保留当前页面，跳转到应用内的某个页面</font>
<font size=3 color=#3898fc>wx.redirectTo</font> | <font size=2 >关闭当前页面，跳转到应用内的某个页面</font>
<font size=3 color=#3898fc>wx.reLaunch</font> | <font size=2 >关闭所有页面，打开到应用内的某个页面</font>
<font size=3 color=#3898fc>wx.switchTab</font> | <font size=2 >跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面</font>
<font size=3 color=#3898fc>wx.navigateBack</font> | <font size=2 >关闭当前页面，返回上一页面或多级页面</font>
<font size=3 color=#3898fc>wx.createAnimation</font> | <font size=2 >创建一个动画实例animation</font>
<font size=3 color=#3898fc>wx.pageScrollTo</font> | <font size=2 >将页面滚动到目标位置</font>
<font size=3 color=#3898fc>wx.createCanvasContext</font> | <font size=2 >创建 canvas 绘图上下文</font>
<font size=3 color=#3898fc>wx.startPullDownRefresh</font> | <font size=2 > 开始下拉刷新，调用后触发下拉刷新动画，效果与用户手动下拉刷新一致</font>
<font size=3 color=#3898fc>wx.stopPullDownRefresh</font> | <font size=2 >停止当前页面下拉刷新</font>


<br />
<br />

# 媒体
<font size=3 color=#000>API</font> | <font size=3 color=#000>说明 </font>
----|------
<font size=3 color=#3898fc>wx.chooseImage</font> | <font size=2 >从本地相册选择图片或使用相机拍照。</font>
<font size=3 color=#3898fc>wx.previewImage</font> | <font size=2 >预览图片</font>
<font size=3 color=#3898fc>wx.getImageInfo</font> | <font size=2 >获取图片信息</font>

<br />
<br />
# 文件
<font size=3 color=#000>API</font> | <font size=3 color=#000>说明 </font>
----|------
<font size=3 color=#3898fc>wx.saveFile</font> | <font size=2 >保存文件到本地</font>
<font size=3 color=#3898fc>wx.getFileInfo</font> | <font size=2 >获取文件信息</font>
<font size=3 color=#3898fc>wx.removeSavedFile</font> | <font size=2 >删除本地存储的文件</font>

<br />
<br />
# 数据缓存
<font size=3 color=#000>API</font> | <font size=3 color=#000>说明 </font>
----|------
<font size=3 color=#3898fc>wx.setStorage</font> | <font size=2 >将数据存储在本地缓存中指定的 key 中，会覆盖掉原来该 key 对应的内容，这是一个异步接口</font>
<font size=3 color=#3898fc>wx.setStorageSync</font> | <font size=2 >将 data 存储在本地缓存中指定的 key 中，会覆盖掉原来该 key 对应的内容，这是一个同步接口</font>
<font size=3 color=#3898fc>wx.getStorage</font> | <font size=2 >从本地缓存中异步获取指定 key 对应的内容</font>
<font size=3 color=#3898fc>wx.getStorageSync</font> | <font size=2 >从本地缓存中同步获取指定 key 对应的内容</font>
<font size=3 color=#3898fc>wx.getStorageInfo</font> | <font size=2 >异步获取当前storage的相关信息</font>
<font size=3 color=#3898fc>wx.getStorageInfoSync</font> | <font size=2 >同步获取当前storage的相关信息</font>
<font size=3 color=#3898fc>wx.removeStorage</font> | <font size=2 >从本地缓存中异步移除指定 key</font>
<font size=3 color=#3898fc>wx.removeStorageSync</font> | <font size=2 >从本地缓存中同步移除指定 key</font>
<font size=3 color=#3898fc>wx.clearStorage</font> | <font size=2 >清理本地数据缓存</font>
<font size=3 color=#3898fc>wx.clearStorageSync</font> | <font size=2 >同步清理本地数据缓存</font>

<br />
<br />
# 设备
<font size=3 color=#000>API</font> | <font size=3 color=#000>说明 </font>
----|------
<font size=3 color=#3898fc>wx.getSystemInfo</font> | <font size=2 >获取系统信息</font>
<font size=3 color=#3898fc>wx.canIUse</font> | <font size=2 >判断小程序的API，回调，参数，组件等是否在当前版本可用</font>
<font size=3 color=#3898fc>wx.getNetworkType</font> | <font size=2 >获取网络类型</font>
<font size=3 color=#3898fc>wx.makePhoneCall</font> | <font size=2 >打电话</font>
<font size=3 color=#3898fc>wx.scanCode</font> | <font size=2 >调起客户端扫码界面，扫码成功后返回对应的结果</font>
<font size=3 color=#3898fc>wx.setClipboardData</font> | <font size=2 >设置系统剪贴板的内容</font>
<font size=3 color=#3898fc>wx.getClipboardData</font> | <font size=2 >获取系统剪贴板内容</font>
