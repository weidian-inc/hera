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
#import <WebKit/WebKit.h>

#import "WDHServiceBridgeProtocol.h"
#import "WDHManagerProtocol.h"

/**
 Service层的JSBridge
 */
@interface WDHBridge : NSObject

- (instancetype)initWithWebViewDelegate:(id<WDHServiceBridgeProtocol>)webViewDelegate managerDelegate:(id<WDHManagerProtocol>)managerDelegate;

/**
 获取WKConetentController
 */
- (WKUserContentController *)getBridgeUserContentController;

/**
 加载配置文件

 @param completion NSDictionary:配置文件内容
 */
- (void)loadConfigFileWithCompletion:(void(^)(NSDictionary *))completion;

/**
 调用Service层订阅事件

 @param eventName 事件名
 @param jsonParam 参数JSON字符串
 @param webId 页面Id
 */
- (void)callSubscribeHandlerWithEvent:(NSString *)eventName jsonParam:(NSString *)jsonParam webId:(unsigned long long)webId;

/**
  调用Service层订阅事件

 @param eventName 事件名JSON字符串
 @param jsonParam 参数
 */
- (void)callSubscribeHandlerWithEvent:(NSString *)eventName jsonParam:(NSString *)jsonParam;

/**
 调用Service层回调处理

 @param callbackId 回调ID
 @param param 参数
 */
- (void)invokeCallbackHandlerWithCallbackId:(int)callbackId param:(NSString *)param;

@end

