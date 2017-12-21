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

@interface WHHybridExtension : NSObject <WDHApiProtocol>

/**
 扩展API处理后的回调
 
 @param code 处理结果码
 @param result 处理结果数据
 */
typedef void (^WDHExtensionApiCallback)(WDHExtensionCode code, NSDictionary<NSString *, NSObject *> *result);


/**
 扩展API处理
 
 @param param 业务参数
 @param callback 扩展API处理完毕的回调
 */
typedef void (^WDHExtensionApiHandler)(id param, WDHExtensionApiCallback callback);


/**
 注册扩展API
 宿主注册需要自定义实现的API
 @param api API名
 */
+ (void)registerExtensionApi:(NSString *)api handler:(WDHExtensionApiHandler)handler;

@end

