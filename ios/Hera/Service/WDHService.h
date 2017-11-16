//
// Copyright (c) 2017, weidian.com
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above copyright notice, this
// list of conditions and the following disclaimer.
//
// * Redistributions in binary form must reproduce the above copyright notice,
// this list of conditions and the following disclaimer in the documentation
// and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//


#import <Foundation/Foundation.h>


extern NSString * kWDHServiceOpenTypeAppLaunch ;
extern NSString * kWDHServiceOpenTypeNavigateBack ;
extern NSString * kWDHServiceOpenTypeRedirectTo ;

@class WDHManager;
@interface WDHService : NSObject

/**
 app配置
 */
@property (nonatomic, strong) NSDictionary *appConfig;

- (instancetype)initWithAppConfiguration:(NSDictionary *)appConfiguration manager:(WDHManager *)manager;

/**
 加载配置文件

 @param completion 配置文件内容
 */
- (void)loadConfigFileWithCompletion:(void(^)(NSDictionary *dic))completion;

/**
 publish事件

 @param callbackId 回调参数
 */
- (void)publishCallbackHandler:(NSString *)callbackId;

/**
 app路由跳转

 @param routeType 路由类型
 @param htmlPath 页面地址
 @param queryString 参数
 @param webId 页面ID
 */
- (void)onAppRoute:(NSString *)routeType htmlPath:(NSString *)htmlPath queryString:(NSString *)queryString webId:(unsigned long long)webId;

/**
 调用Service层订阅事件
 
 @param eventName 事件名
 @param jsonParam 参数JSON字符串
 @param webId 页面Id
 */
- (void)callSubscribeHandlerWithEvent:(NSString *)eventName jsonParam:(NSString *)jsonParam webId:(unsigned long long)webId;

/**
 调用Service层订阅事件
 
 @param eventName 事件名
 @param jsonParam 参数JSON字符串
 */
- (void)callSubscribeHandlerWithEvent:(NSString *)eventName jsonParam:(NSString *)jsonParam;

/**
 调用Service层回调处理
 
 @param callbackId 回调ID
 @param param 参数
 */
- (void)invokeCallbackHandler:(int)callbackId param:(NSString *)param;

@end

