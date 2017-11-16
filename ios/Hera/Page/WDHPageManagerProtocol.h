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


#ifndef WDHPageManagerProtocol_h
#define WDHPageManagerProtocol_h

@class WDHPageBaseViewController;

//页面管理的协议
//WHPageManager做为协调者，代理各个需求方实现这些协议
//需求方有 WHMananger, WHPageApi, WDHPageBaseViewController, WDHPageBridge
@protocol WDHPageManagerProtocol <NSObject>

//开始一个页面
- (void)startPage:(NSString *)basePath pagePath:(NSString *)pagePath openNewPage:(BOOL)openNewPage;
//退出栈顶一个页面
- (void)pop;
//页面栈长
- (int)stackLength;

//调js
//- (void)callSubscribeHandlerWithEventName:(NSString *)eventName jsonParam:(NSString *)jsonParam webIds:(NSArray *)webIds;
- (void)callSubscribeHandler:(NSString *)eventName jsonParam:(NSString *)jsonParam webIds:(NSArray *)webIds;

- (void)callPageConfig:(unsigned long long)webId;

- (BOOL)isRootPage:(UIViewController *)page;

//Active View State
- (void)activePageDidDisappear:(WDHPageBaseViewController *)vc;
- (void)activePageDidAppear:(WDHPageBaseViewController *)vc;
- (void)activePageWillAppear:(WDHPageBaseViewController *)vc;

@end



//js与webiew之间的桥接协议
@protocol WDHPageBridgeJSProtocol <NSObject>

    //收到js消息
- (void)onReceiveJSMessage:(NSString *)name body:(id)body controller:(WDHPageBaseViewController *)controller;
    
- (void)onReceiveJSAlert:(NSString *)message;
    
    //调js
- (void)callJS:(NSString *)js controller:(WDHPageBaseViewController *)controller callback:(void (^)(id result))callback;
    
@end

#endif /* WDHPageManagerProtocol_h */

