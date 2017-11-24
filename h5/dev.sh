#!/bin/bash

# 使用前请使用 npm i 命令安装前端依赖

# 可以将 app 替换成本地小程序的地址
app='./demo'


# 使用说明
## 构建 app： ./dev.sh app
## 构建 小程序框架： ./dev.sh fra
## 同时构建上述二者： ./dev.sh

# 其它
## 如果你使用了 npm run dev 来启动 framework 的自动构建
## 你可以在前述命令后增加 dev 参数，这样可以省略构建 framwork 的过程
## 例：./dev.sh app dev 或 ./dev.sh fra dev 或 ./dev.sh

if [ "$2" != "dev" ] && [ "$1" != "dev" ]; then
    echo "=> Building framework"
    npm run build:dev
fi

if [ "$1" == "app" ]; then
    echo "=> Building app"
    ./bin/weweb $app
    cp dist/app.zip ../ios/HeraDemo/demoapp.zip
    cp dist/app.zip ../android/sample/src/main/assets/demoapp.zip
elif [ "$1" == "fra" ]; then
    echo "=> Zipping framework"
    ./bin/weweb -b
    cp dist/framework.zip ../ios/Hera/Resources/HeraRes.bundle/framework.zip
    cp dist/framework.zip ../ios/HeraDemo/HeraRes.bundle/framework.zip
    cp dist/framework.zip ../android/hera/src/main/assets/framework.zip
else
    echo "=> Zipping framework"
    ./bin/weweb -b
    cp dist/framework.zip ../ios/Hera/Resources/HeraRes.bundle/framework.zip
    cp dist/framework.zip ../ios/HeraDemo/HeraRes.bundle/framework.zip
    cp dist/framework.zip ../android/hera/src/main/assets/framework.zip
    echo "=> Building app"
    ./bin/weweb $app
    cp dist/app.zip ../ios/HeraDemo/demoapp.zip
    cp dist/app.zip ../android/sample/src/main/assets/demoapp.zip
fi

echo '##############################################'
echo '# 请使用 Xcode 或 Android Studio 构建移动应用 #'
echo '##############################################'
