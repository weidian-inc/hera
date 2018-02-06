# Hera扩展api配置

Hera框架本身已经提供了丰富的原生[API](#/others/api-list)实现，为了更好地满足在开发者需求，Hera也提供了自定义原生API的能力。

## 前端

在小程序根目录（如：demo目录)增加heraConf.js文件，配置示例如下：

```javascript
module.exports = {
  extApi:[
    { //普通交互API
      name: 'openLink', //扩展api名 该api必须Native方实现了
      params: { //扩展api 的参数格式，可以只列必须的属性
        url: ''
      }
    }
  ]
}
```

## 安卓端

### 调用接收

在Native端，开发者需要在Hera框架初始化时通过addExtendsApi方法添加自定义的扩展api（实现IApi接口或继承AbsApi类），业务调用时会自动查找并调用。

`IApi` 接口的定义

```java
public interface IApi extends ILifecycle {

    /**
     * @return 支持可调用的api名称的数组
     */
    String[] apis();

    /**
     * 接收到对应的api调用时，会调用此方法，在此方法中处理api调用的功能逻辑
     *
     * @param event    事件名称，即api名称
     * @param param    参数
     * @param callback 回调接口
     */
    void invoke(String event, JSONObject param, ICallback callback);
}
```

### 结果返回

当事件处理完毕后，通过 `ICallback` 接口的方法将调用结果返回。接口定义如下：

```java
public interface ICallback {

    /**
     * Api调用成功
     *
     * @param result Api调用返回的结果
     */
    void onSuccess(JSONObject result);

    /**
     * Api调用失败
     */
    void onFail();

    /**
     * Api调用取消
     */
    void onCancel();

    /**
     * 回调{@link android.app.Activity#startActivityForResult(Intent, int)}方法
     *
     * @param intent
     * @param requestCode
     */
    void startActivityForResult(Intent intent, int requestCode);
}
```

## iOS 端

### 注册需要立即返回结果的API

通过**WHHybridExtension**注册自定义API,处理完毕返回结果

```objc
[WHHybridExtension registerExtensionApi:@"openLink" handler:^id(id param) {
    // do something
    return @{WDHExtensionKeyCode:@(WDHExtensionCodeSuccess), WDHExtensionKeyData: @"hello world"};
}];
```

### 注册需要延迟返回结果的API

通过**WHHybridExtension**注册自定义API,处理事件对象需要实现**WDHRetrieveApiProtocol**接口,当事件处理完毕后调用**WDHApiCompletion**返回相应结果

```objc
[WHHybridExtension registerRetrieveApi:@"getResult" handler:^id(id param, WDHApiCompletion completion) {
    ViewController *vc = [[ViewController alloc] init];
    if([vc respondsToSelector:@selector(didReceiveApi:withParam:completion:)]){
        [vc didReceiveApi:@"getResult" withParam:param completion:completion];
        UINavigationController *navi = (UINavigationController *)self.window.rootViewController;
        [navi pushViewController:vc animated:YES];
        return @{WDHExtensionKeyCode:@(WDHExtensionCodeSuccess)};
    }
    return @{WDHExtensionKeyCode:@(WDHExtensionCodeFailure)};
}];
```
