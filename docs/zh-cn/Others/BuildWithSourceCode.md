# 从源码构建

## clone 源码

```sh
git clone https://github.com/weidian-inc/hera.git
```

## 进入 h5目录

```sh
cd h5
```

## 安装前端依赖

```sh
npm i
```

## 修改 app 地址

修改 dev.sh 里的 app 目录

```sh
app='~/work/demo'
```

## 构建

```sh
sh dev.sh
```

## 运行

### iOS

返回项目根目录，进入 ios 目录

```sh
cd ../ios
```

安装依赖

```sh
pod update
```

然后点击ios 目录下的HeraDemo.xcworkspace，使用 xcode 进行构建即可

### Android

返回项目根目录，通过 Android Studio 打开 android 文件夹