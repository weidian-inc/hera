# Hera Android

## 编译运行sample示例工程

将android设备与电脑连接或启动android虚拟机，任意采用以下两种方式编译运行sample

* 在Android Studio中，选择 `File > Open...` 并选择 `hera/android` 文件夹，导入Hera Android工程，待成功导入后，点击工具栏中的 `Run` 按钮，即可编译安装运行sample。
* 在终端中进入 `hera/android/sample` 目录，输入 `../gradlew clean installDebug` 即可编译安装sample。

## Hera Android SDK运行环境

目前SDK最低支持的Android系统版本为4.2 [`minSdkVersion 17`]，目标运行的Android系统版本为5.1 [`targetSdkVersion 22`]，后续计划会放开Android系统版本的范围限制。

## 接入SDK

在你要接入的工程的 `build.gradle` 文件中添加如下配置：

```gradle
repositories {
    jcenter()
}

dependencies {
    compile "com.weidian.lib:hera:1.1.0"
}
```

即可让你的工程拥有运行小程序的能力。

## SDK初始化

在使用Hera框架运行你的小程序之前，你应该选择合适的时机在主进程中对框架进行配置并完成初始化工作，例如示例工程在 `HeraApplication.java` 中进行了初始化操作：

```java
public class HeraApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        //在主进程中初始化框架配置，启动框架服务进程
        if (HeraTrace.isMainProcess(this)){
            HeraConfig config = new HeraConfig.Builder()
                    .addExtendsApi(new XxxApi()) // 添加自定义扩展API，可连续调用添加或传入一组api列表
                    .setDebug(true) // 调试模式
                    .build();
            HeraService.start(this.getApplicationContext(), config);
        }
    }
}
```

其中 `addExtendsApi` 用于添加自定义扩展API。详见[自定义扩展API](../docs/zh-cn/Others/API-Extend.md)

## 打开小程序页面

启动小程序页面也非常简单，只需调用 `launchHome` 方法，并传入相应参数：

```java
HeraService.launchHome(
    getApplicationContext(),
    userId, //标识宿主App业务用户id，不可为空
    appId,  //标识小程序业务的id，不可为空
    appPath //指定小程序zip资源文件的本地存储路径，如果未空则读取并解压assets下以appId命名的zip文件
);
```
