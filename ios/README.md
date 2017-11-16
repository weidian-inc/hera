# iOS接入指南

## Cocoapods

使用cocoapods接入，创建Podfile如下:

```text
source 'https://github.com/CocoaPods/Specs.git'
platform :ios, '9.0'

target 'TargetName' do
    pod 'Hera', '1.0.0'
end
```
## 如何使用

### 打开小程序页面
```objc
WDHAppInfo *appInfo = [[WDHAppInfo alloc] init];

//小程序标识
appInfo.appId = @"appId";       

//标识宿主app业务用户id
appInfo.userId = @"userId";     

//小程序资源zip路径,如果为空或未找到资源 则读取MainBundle下以appId命名的资源包(appId.zip)
appInfo.appPath = @"appPath";   

[[WDHInterface sharedInterface] startAppWithAppInfo:appInfo entrance:self.navigationController completion:^(BOOL success, NSString *msg) {
    // todo
}];
```

### 注册自定义API实现
Hera框架本身已经提供了丰富的原生API实现，为了更好地满足在开发者需求，Hera也提供了自定义原生API的能力。

###### 1.注册需要同步返回结果的API
通过**WHHybridExtension**注册自定义API,处理完毕返回结果
```objc
[WHHybridExtension registerExtensionApi:@"openLink" handler:^id(id param) {
    // do something	
    return @{WDHExtensionKeyCode:@(WDHExtensionCodeSuccess), WDHExtensionKeyData: @{@"key": @"value"}};
}];
```

###### 2.注册需要异步返回结果的API
通过**WHHybridExtension**注册自定义API,处理事件对象需要实现**WDHRetrieveApiProtocol**接口,当事件处理完毕后在主线程执行**WDHApiCompletion**返回相应结果
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
