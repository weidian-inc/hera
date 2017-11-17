
## 前端依赖

首先，我们需要在系统中安装 `Node.js` 环境, 打开命令提示符窗口, 输入以下命令

```sh
node -v
```

如果得到的版本低于`v7.6.0`，或是提示找不到 `node` 命令，请[点此](http://nodejs.cn/download/)下载最新的 `Node.js` 安装包。

 下载完点击安装，全程点确定或下一步即可。安装完请重启命令提示符窗口，再次执行上述操作，以确认是否安装成功。

## 安卓依赖

如果想要在安卓虚拟机或真机上运行，需要安装 `Android Studio` 以及：

- Android SDK Platform 25
- Android SDK Build-Tools 25.0.3

如果您的系统中没有以上环境，请按[此教程](#/android/andorid-env-setup)搭建安卓开发环境

## 安装运行

安装脚手架

> Tips: 如果下载时出现网络问题，可以尝试使用 [nrm](https://github.com/Pana/nrm) 或 [npm config](http://cnodejs.org/topic/4f9904f9407edba21468f31e) 命令切换至[国内的 npm 源](http://www.jianshu.com/p/171ec231ced4)


```sh
# 从内部npm仓库安装
npm i hera-cli -g
```

初始化小程序

```sh
hera init projName
```

进入新建的项目, 确认根目录有 `config.json` 文件：

```sh
# 进入项目
cd projName

# 查看配置文件
cat config.json
```

运行

```sh
hera run android
```

## 参考

环境搭建部分参考了: [React Native中文网](https://reactnative.cn/docs/0.50/getting-started.html#android-studio)
