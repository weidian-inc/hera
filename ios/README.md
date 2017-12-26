# iOS接入指南

## Cocoapods

使用cocoapods接入，创建Podfile如下:

```text
source 'https://github.com/CocoaPods/Specs.git'
platform :ios, '9.0'

target 'TargetName' do
    pod 'Hera', '1.1.0'
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

```objc
[WHHybridExtension registerExtensionApi:@"getSum" handler:^(id param, WDHExtensionApiCallback callback) {
    NSInteger numA = [param[@"numA"] integerValue];
    NSInteger numB = [param[@"numB"] integerValue];
    NSInteger sum = numA + numB;
    callback(WDHExtensionCodeSuccess, @{@"result": @(sum)});
}];
```
