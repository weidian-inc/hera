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
#import "WDHSystemConfig.h"
#import "WDHAppInfo.h"

@class UINavigationController;
@class UIViewController;

@interface WDHApp : NSObject

/**
 小程序配置信息
 */
@property (nonatomic, strong) WDHAppInfo *appInfo;

/**
 初始化

 @param appInfo 小程序配置信息
 @return 小程序实例
 */
- (instancetype)initWithAppInfo:(WDHAppInfo *)appInfo;

/**
 开启小程序
 */
- (void)startAppWithEntrance:(UINavigationController *)entrance;

/**
 停止小程序
 */
- (void)stopApp;

/**
 小程序进入前台
如果从非小程序页面进入小程序页面 则认为小程序进入前台 初始化进入除外
 */
- (void)onAppEnterForeground;

/**
 小程序进入后台
 如果将要展示的页面不是小程序页面 则认为小程序进入后台
 */
- (void)onAppEnterBackground;

/**
 判断是否为小程序根页面

 @return YES:是 NO:否
 */
- (BOOL)isAppRootPage:(UIViewController *)page;

@end

