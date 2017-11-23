# 微信登录与跨域
<br />

### 小程序经`hera`转换后，会存在`跨域访问接口限制`及脱离微信环境带来的`wx.login`无法支持的问题。我们可以通过在小程序的`app.json`文件中增加`weweb`配置项来解决上述问题。

## 微信登录(wx.login)

小程序经转换后将不支持小程序原生的登录方式，可以在`weweb`配置项中添加`loginUrl`项来指定调用`wx.login`时跳转到的登录页面，如下所示：
```javascript
//app.json
/**
 * 此处的loginUrl地址必须是在app.json里注册了的小程序地址
 */

"weweb":{
  "loginUrl":"/page/H5login"
}

/**
 * 当登录成功后调wx.loginSuccess();
 * 这个api可以自动返回到来源页面
 */

//调用wx.login页面
success : function(rt){
  if(rt.result){
    var login = require("../../modules/login/index.js");
    app.globalData.userInfo = rt.result;
    login.setLoginInfo(rt.result);
    wx.loginSuccess();
  }else{
    toast.show(self,rt.status.status_reason||'登录失败');
  }
}
```

## 跨域请求(CORS)

当后端接口不支持`JSONP`时，可以在`weweb`配置项中增加`requestProxy`来设置服务器端代理地址，以实现跨域请求。

```javascript
//app.json

/**
 * 此处/remoteProxy是weweb自带server实现的一个代理接口
 * 实际项目中请改成自己的真实代理地址。如果接口支持返回jsonp格式，则无需做此配置
 */

"weweb":{
  "requestProxy":"/remoteProxy"
}
```