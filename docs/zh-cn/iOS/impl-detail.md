# Hera iOS端实的设计实现

Hera提供了可供小程序运行的丰富的API和组件，同时也提供了扩展API的能力。SDK的核心功能主要有两部分:`逻辑流程控制`和`API实现`

## 逻辑流程控制
SDK Native层`WDHManager`作为逻辑流程控制中心，建立了页面视图层Page与应用逻辑层`WDHService`之间的联系，处理两层之间的事件传递及数据流转，同时也处理API的调用并返回结果。

## API实现
SDK本身提供了丰富的api实现，同时也提供了扩展api的接口，方便被接入的App实现自定义的API功能。`WHHybridExtension`负责API的调配与扩展。

## 主要功能模块构成
### 1.WDHApp
负责管理小程序的整个生命周期

### 2.WDHService
负责处理页面反馈的事件

### 3.WHHybridExtension
负责API调配与API扩展

### 4.WDHManager
消息调度中心，负责消息转发与处理

### 5.WDHPageManager
负责页面管理

## 结构图

![](assets/impl-detail/结构图.jpg)
