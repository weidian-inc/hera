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


#import <UIKit/UIKit.h>
#import "WDHApiProtocol.h"
#import "WDHodoer.h"

typedef NS_ENUM(NSInteger,WDHExtensionCode) {
    WDHExtensionCodeCancel  = -1,  //取消
    WDHExtensionCodeSuccess = 0,   //成功
    WDHExtensionCodeFailure = 1,   //失败
};

extern NSString *const WDHExtensionKeyCode;
extern NSString *const WDHExtensionKeyData;

typedef void(^WDHApiCompletion)(NSDictionary<NSString *, NSObject *> *result);


@protocol WDHRetrieveApiProtocol <NSObject>

/**
 宿主实现有返回结果的api协议

 @param api api名字
 @param params 参数
 @param completion 执行回调 note:需在主线程执行
 */
- (void)didReceiveApi:(NSString *)api withParam:(id)params completion:(WDHApiCompletion)completion;

@end


@interface WHHybridExtension : NSObject <WDHApiProtocol>

/**
 注册扩展的api，对业务宿主有用

 @param api api字符串
 @param handler 回调
 */
+ (void)registerExtensionApi:(NSString *)api handler:(id(^)(id param))handler;

/**
 注册扩展且要返回处理结果的api，对业务宿主有用

 @param api api字符串
 @param handler 回调
 */
+ (void)registerRetrieveApi:(NSString *)api handler:(id(^)(id param, WDHApiCompletion completion))handler;

@end

