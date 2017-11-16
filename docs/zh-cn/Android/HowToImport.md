# Android 接入指南
## 依赖配置
### Gradle

```gradle

minSdkVersion 17
targetSdkVersion 22
compile "com.weidian.lib:hera:0.0.1"

```

## Hera框架初始化
在使用Hera框架运行你的小程序之前，你应该选择合适的时机在主进程中对框架进行配置并完成初始化工作，例如在示例工程在 HeraApplication.java中进行了初始化操作：

```java
public class HeraApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        //在主进程中初始化框架配置，启动框架服务进程
        if (HeraTrace.isMainProcess(this)){
            HeraConfig config = new HeraConfig.Builder()
                    .setHostApiDispatcher(new HostApiDispatcher(this)) // 自定义扩展API配置
                    .setDebug(true) // 调试模式
                    .build();
            HeraService.start(this.getApplicationContext(), config);
        }
    }
}
```
其中 `setHostApiDispatcher` 用于进行自定义扩展API相关配置，详细介绍见`自定义API`



## 自定义API
Hera框架本身已经提供了丰富的原生[API]()实现，为了更好地满足在开发者需求，Hera也提供了自定义原生API的能力。
### Android端

#### 调用接收

在Native端，开发者需要在Hera框架初始化时提供一个实现了`IHostApiDispatcher`接口的对象，通过该接口的`dispatch`方法可以对来自小程序业务端的API调用事件进行接收和处理：

```java
    @Override
public void dispatch(
    String event, // 事件名称
    String param, // 事件参数，JSON String
    IHostApiCallback apiCallback // 回调
) {
        ...
}
```

#### 结果返回

当事件处理完毕后，通过`IHostApiCallback`对象对相应结果进行返回：

```
onResult(IHostApiCallback.SUCCEED, resultJson);// 处理成功后的结果返回
onResult(IHostApiCallback.FAILED, null);// 处理失败的后的结果返回
```

### JS端
[自定义API配置文件]()

## 打开小程序页面

启动小程序页面也非常简单，只需调用`launchHome`方法，并传入相应参数：

```java
HeraService.launchHome(getApplicationContext(), 
    userId, //标识宿主App业务用户id
    appId, //标识小程序业务的id
    appPath //指定小程序zip资源文件的本地存储路径，如果未空则读取并解压assets下以appId命名的zip文件
);
```

更多信息请参加示例代码。



