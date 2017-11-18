
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

## 安装 Git

如果您的系统中没有安装 Git 命令行工具，请[点此下载安装](https://git-scm.com/downloads)。

## 安装运行

首先切换 npm 源，如果您已经使用了代理则可忽略这一步骤

```sh
npm config set registry https://registry.npm.taobao.org
```

> Tips: 也可以使用 [nrm](https://github.com/Pana/nrm) 命令切换至[国内的 npm 源](http://www.jianshu.com/p/171ec231ced4)

从`npm`仓库安装脚手架

```sh
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

查看是否连接了设备：

```sh
adb devices
```

如果设备处于活跃状态会显示如下信息，如果列表为空或设备处于离线状态，请重新连接安卓手机或重启虚拟机

```sh
List of devices attached
0ec123456    device
```

构建应用并开启虚拟机：

```sh
hera run android
```

> 注意: 初次运行可能会下载 Gradle， 如果您没有使用代理可能会下很长时间, 如果出现`java.util.zip.ZipException`错误，请删除用户根目录下的.gradle 目录后重新尝试上面的命令或是[手动安装 Gradle 3.3](https://gradle.org/install/)

