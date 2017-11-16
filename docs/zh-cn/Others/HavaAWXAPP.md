# 使用已有的小程序

> 如果你想直接使用现有的小程序，需要做更多配置：因为小程序生成的代码需要打包成 zip 发送至各个平台，最终要打包的代码内不能有冗余的文件存在。

如果您已有编写好的小程序，可以将其放置到一个新的文件夹中，并在新文件夹的根目录创建一个 config.json 文件，在其中填入开发好的小程序的目录名称即可：

```json
{
  "dir": "path/to/wxapp"
}
```

可以参考如下结构，您只需在意小程序源码和配置文件部分

```tree
herademo
├── config.json     配置文件
├── .gitignore
├── heraPlatforms   客户端代码
├── heraTmp         中间产物
├── heraTmp         中间产物
├── src             小程序 Build 之前的代码
└── dist            小程序 Build 之后的代码
```
