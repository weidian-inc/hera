# Hera扩展api配置

Hera框架本身已经提供了丰富的原生[API](#/others/api)实现，为了更好地满足在开发者需求，Hera也提供了自定义原生API的能力。

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
在Native端，开发者需要在Hera框架初始化时提供一个实现了 `IHostApiDispatcher` 接口的对象，通过该接口的 `dispatch` 方法可以对来自小程序业务端的API调用事件进行接收和处理.
```
@Override
    public void dispatch(String event, //事件名称，即api名称
                         String param, //调用参数
                         IHostApiCallback apiCallback //回调接口
    ) {
        //此处处理api调用
        //处理完毕后应调用IHostApiCallback的回调方法将结果回传，否则调用的api将收不到结果
    }
```
`IHostApiCallback` 接口的定义
```
/**
 * 结果的回调方法
 *
 * @param status 状态码，参考以下状态码说明，无效值按'UNDEFINE'处理
 * @param result json结果
 */
void onResult(int status, JSONObject result);

/**
 * 成功状态码，即api调用成功，将结果返回
 */
SUCCEED;

/**
 * 失败状态码，即api调用失败
 */
FAILED;

/**
 * 未定义状态码，即调用的api不存在或未实现
 */
UNDEFIN;

/**
 * 中间状态，与"openPageForResult" api配合使用，
 * 用与打开其他Activity页面并接收其返回的结果，参考sample示例
 */
PENDING;
```

### 结果返回
当事件处理完毕后，通过 `IHostApiDispatcher` 接口对象的 `onResult` 方法将调用结果返回。如下：
```
onResult(IHostApiDispatcher.SUCCEED, resultJson); //处理调用成功的结果返回
onResult(IHostApiDispatcher.FAILED, null); //处理调用失败的结果返回
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
