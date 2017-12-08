# 从源码构建

## Clone 源码

```sh
git clone https://github.com/weidian-inc/hera.git
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
