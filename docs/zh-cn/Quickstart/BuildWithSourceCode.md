# 从源码构建

如果您运行时发现一些错误，它们可能已经被修复了，您可以先尝试使用源码来运行您的程序，如果错误仍然存在，请提 issue 或是在群里向管理员反映。

## Clone 源码

```sh
## clone 源码
git clone https://github.com/weidian-inc/hera.git

## 切换到 dev 分支
git checkout master-dev
```



## 进入 h5 目录

```sh
cd h5
```

## 安装前端依赖

```sh
npm i
```

## 更改 app 地址

修改 `dev.sh` 里的 `app` 变量

```sh
app='~/work/demo'
```

## 构建

```sh
sh dev.sh
```

## 运行

### iOS

返回项目根目录，进入 `ios` 目录

```sh
cd ../ios
```

安装依赖

```sh
pod update
```

然后点击 `ios` 目录下的 `HeraDemo.xcworkspace`，使用 `xcode` 进行构建运行即可

### Android

返回项目根目录，通过 `Android Studio` 打开 `android` 文件夹， 构建运行即可
