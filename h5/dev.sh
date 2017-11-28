#!/bin/bash

# 使用前请使用 npm i 命令安装前端依赖

# 可以将 app 替换成本地小程序的地址
app='./demo'

# 使用说明
## 构建app和框架： ./dev.sh

# 单独构建
## 只构建 app： ./dev.sh app
## 只构建 小程序框架： ./dev.sh fra

# 打包小程序（压缩代码，发布时用）
## ./dev.sh build

# 构建加速（调试时用）
## 如果你使用了 npm run dev 来启动 framework 的自动构建
## 你可以在前述命令后增加 dev 参数，这样可以省略构建 framwork 的过程
## 例：./dev.sh dev 或 ./dev.sh app dev


if [ "$2" != "dev" ] && [ "$1" != "dev" ]; then
    if [ "$2" == "build" ] || [ "$1" == "build" ]; then
        echo "=> Building framework [uglyfied]"
        npm run build
    else
        echo "=> Building framework [untouched]"
        npm run build:dev
    fi
fi

appSrc='dist/app.zip'
fraSrc='dist/framework.zip'

if [ "$1" == "app" ]; then
    echo "=> Building app"
    ./bin/weweb $app
    cp $appSrc ../ios/HeraDemo/demoapp.zip
    cp $appSrc ../android/sample/src/main/assets/demoapp.zip
elif [ "$1" == "fra" ]; then
    echo "=> Zipping framework"
    ./bin/weweb -b
    cp $fraSrc ../ios/Hera/Resources/HeraRes.bundle/framework.zip
    cp $fraSrc ../ios/HeraDemo/HeraRes.bundle/framework.zip
    cp $fraSrc ../android/hera/src/main/assets/framework.zip
else
    echo "=> Zipping framework"
    ./bin/weweb -b
    cp $fraSrc ../ios/Hera/Resources/HeraRes.bundle/framework.zip
    cp $fraSrc ../ios/HeraDemo/HeraRes.bundle/framework.zip
    cp $fraSrc ../android/hera/src/main/assets/framework.zip
    echo "=> Building app"
    ./bin/weweb $app
    cp $appSrc ../ios/HeraDemo/demoapp.zip
    cp $appSrc ../android/sample/src/main/assets/demoapp.zip
fi

echo '##############################################'
echo '# 请使用 Xcode 或 Android Studio 构建移动应用 #'
echo '##############################################'
