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
@class WDHPageModel;

@protocol WDHManagerProtocol <NSObject>

/**
 处理Service层的publish消息

 @param eventName 事件名
 @param param 参数JSON对象
 @param webIds 页面Id
 @param callbackId 回调ID
 */
- (void)service_publishHandler:(NSString *)eventName param:(NSString *)param webIds:(NSArray *)webIds callbackId:(NSString *)callbackId;

/**
 处理Service层的API调用事件

 @param command 事件名
 @param param 参数
 @param callbackId 回调ID
 */
- (void)service_apiRequest:(NSString *)command param:(NSString *)param callbackId:(int)callbackId;

/**
 处理Service层的调用内部API事件

 @param command 事件
 @param param 参数
 @param callbackId 回调ID
 */
- (void)service_innerApiRequest:(NSString *)command param:(NSString *)param callbackId:(int)callbackId;

/**
 处理Page层的Publish事件

 @param eventName 事件名
 @param param 参数
 @param pageModel 页面数据
 @param callbackId 回调参数
 */
- (void)page_publishHandler:(NSString *)eventName param:(NSString *)param pageModel:(WDHPageModel *)pageModel callbackId:(NSString *)callbackId;
- (void)page_invokeHandler:(NSString *)eventName param:(NSString *)param pageModel:(WDHPageModel *)pageModel callbackId:(NSString *)callbackId;
/**
 开启服务
 */
- (void)startService;

/**
 停止服务
 */
- (void)stopService;


@end

