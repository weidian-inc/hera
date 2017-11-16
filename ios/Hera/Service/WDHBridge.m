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


#import "WDHBridge.h"
#import "NSObject+WDHJson.h"
#import "WDHScriptMessageHandlerDelegate.h"

@interface WDHBridge()<WKScriptMessageHandler>

@property (nonatomic, weak) id <WDHServiceBridgeProtocol> webViewDelegate;
@property (nonatomic, weak) id <WDHManagerProtocol> managerDelegate;

@end

NSString * const WHServiceBridgeObject = @"ServiceJSBridge";
NSString * const WHServiceBridgeMethod_InvokeCallbackHandler = @"invokeCallbackHandler";

@implementation WDHBridge

- (instancetype)initWithWebViewDelegate:(id<WDHServiceBridgeProtocol>)webViewDelegate managerDelegate:(id<WDHManagerProtocol>)managerDelegate
{
    if (self = [super init]) {
        self.webViewDelegate = webViewDelegate;
        self.managerDelegate = managerDelegate;
        
    }
    
    return self;
}

- (WKUserContentController *)getBridgeUserContentController {
    WKUserContentController *userContentController = WKUserContentController.new;
    
    WDHWeakScriptMessageDelegate *scriptMessageDelegate = [WDHWeakScriptMessageDelegate new];
    scriptMessageDelegate.scriptDelegate = self;
    [userContentController addScriptMessageHandler:scriptMessageDelegate name:@"invokeHandler"];
    [userContentController addScriptMessageHandler:scriptMessageDelegate name:@"publishHandler"];
    
    return userContentController;
}

- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message
{
    NSString *name = message.name;
    id body = message.body;
    
    NSString *oc_method = [NSString stringWithFormat:@"%@:",name];
    SEL selector = NSSelectorFromString(oc_method);
	
	NSLog(@"service2app_get---->desc: %@", @{@"event":name,@"info":body});
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"
    if ([self respondsToSelector:selector]) {
        [self performSelector:selector withObject:body];
    }else {
        NSLog(@"[\(self)]未实行方法：%@", oc_method);
    }
#pragma clang diagnostic pop
}

//MARK:..........Script Handlers..........

- (void)invokeHandler:(NSDictionary *)data
{
    NSLog(@"<service> invokeHandler: %@",data);
    
    NSString *command = data[@"C"];
    NSString *paramsString = data[@"paramsString"];
    
    int cId = [data[@"callbackId"] intValue];
    
    BOOL isInnerApi = [self checkIsInnerRequestWithCommand:command param:paramsString callbackId:cId];
    if (isInnerApi) {
        if (self.managerDelegate && [self.managerDelegate respondsToSelector:@selector(service_innerApiRequest:param:callbackId:)]) {
            [self.managerDelegate service_innerApiRequest:command param:paramsString callbackId:cId];
        } 
    }else {
        if (self.managerDelegate && [self.managerDelegate respondsToSelector:@selector(service_apiRequest:param:callbackId:)]) {
            [self.managerDelegate service_apiRequest:command param:paramsString callbackId:cId];
        }
    }
}

- (void)publishHandler:(NSDictionary *)data {
    
    NSLog(@"<Service> publishHandler:%@",data);
    NSString *event = data[@"event"];
    NSString *paramsString = data[@"paramsString"];
    NSArray *webviewIds = [data[@"webviewIds"] wdh_jsonObject];
    
    if (self.managerDelegate && [self.managerDelegate respondsToSelector:@selector(service_publishHandler:param:webIds:callbackId:)]) {
        [self.managerDelegate service_publishHandler:event param:paramsString webIds:webviewIds callbackId:@""];
    }
}

- (BOOL) checkIsInnerRequestWithCommand:(NSString *)command param:(NSString *)param callbackId:(int)callbackId
{
    NSArray *innerReqList = @[@"navigateTo",@"redirectTo",@"showToast",@"hideToast",@"navigateBack",@"setNavigationBarTitle",@"showNavigationBarLoading",@"hideNavigationBarLoading",@"setNavigationBarColor",@"switchTab",@"reLaunch", @"startPullDownRefresh", @"stopPullDownRefresh"];
    return [innerReqList containsObject:command];
}

- (void)loadConfigFileWithCompletion:(void(^)(NSDictionary *))completion
{
	NSLog(@"read_serviceConfig");
    
    [self injectScriptString:@"__wxConfig__" completionHandler:^(id result, NSError *error) {
        if (completion) {
            completion(result);
        }
    }];
}

- (void)injectScriptString:(NSString *)script completionHandler:(void(^)(id result,NSError *error))completion
{
    NSLog(@"<Service> injectScriptString: %@",script);
	
    if (self.webViewDelegate && [self.webViewDelegate respondsToSelector:@selector(serviceBridgeDidNeedInjectScript:completionHandler:)]) {
        [self.webViewDelegate serviceBridgeDidNeedInjectScript:script completionHandler:completion];
    }
}

- (void)callSubscribeHandlerWithEvent:(NSString *)eventName jsonParam:(NSString *)jsonParam webId:(unsigned long long)webId  {
    NSString *js = [NSString stringWithFormat:@"ServiceJSBridge.subscribeHandler('%@',%@, %llu)",eventName,jsonParam,webId];
    NSLog(@"<Service> 执行: %@",js);
    [self injectScriptString:js completionHandler:^(id result, NSError *error) {
        
    }];
}

- (void)callSubscribeHandlerWithEvent:(NSString *)eventName jsonParam:(NSString *)jsonParam {
	NSString *js = [NSString stringWithFormat:@"ServiceJSBridge.subscribeHandler('%@',%@)",eventName,jsonParam];
	NSLog(@"<Service> 执行: %@",js);
	[self injectScriptString:js completionHandler:^(id result, NSError *error) {
		
	}];
}

- (void)invokeCallbackHandlerWithCallbackId:(int)callbackId param:(NSString *)param
{
    NSString *js = [NSString stringWithFormat:@"%@.%@('%d',%@)",WHServiceBridgeObject,WHServiceBridgeMethod_InvokeCallbackHandler,callbackId,param];
    NSLog(@"<Service> 执行: %@",js);
    
    [self injectScriptString:js completionHandler:NULL];
    
}

@end

