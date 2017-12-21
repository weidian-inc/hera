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


#import "WHHybridExtension.h"
#import "WHEBaseApi.h"
#import <Hera/WDHodoer.h>
#import "WDHybridExtensionConverter.h"
#import "WDHApiRequest.h"
#import "WDHAppManager.h"
#import "WDHApp.h"

@interface WHHybridExtension ()

@end

/// 扩展的api信息数组
static NSMutableDictionary *extensionApis = nil;

@implementation WHHybridExtension

+ (void)registerExtensionApi:(NSString *)api handler:(WDHExtensionApiHandler)handler
{
	if (!extensionApis) {
		extensionApis = [NSMutableDictionary new];
	}
	
	extensionApis[api] = handler;
}


#pragma mark - WDHApiProtocol
#pragma mark -

- (void)didRecieveHybridApiWithApi:(WDHApiRequest *)request
{
	//优先常规api
	WHEBaseApi *api = [WDHybridExtensionConverter apiWithRequest:request];
	if (api) {
		
		[api setupApiWithSuccess:^(NSDictionary<NSString *,id> * _Nonnull result) {
			
			if (request.callback) {
				dispatch_async(dispatch_get_main_queue(), ^{
					request.callback(result);
				});
			}
		} failure:^(NSDictionary* _Nullable failureInfo) {
			
			if (request.callback) {
				NSMutableDictionary *result = [NSMutableDictionary dictionaryWithDictionary:failureInfo];
				if(!result[@"errMsg"]) {
					[result setObject:[NSString stringWithFormat:@"%@:fail",request.command] forKey:@"errMsg"];
				}
				
				dispatch_async(dispatch_get_main_queue(), ^{
					request.callback(result);
				});
			}
		} cancel:^{
			
			if (request.callback) {
				NSDictionary *result = @{@"errMsg":[NSString stringWithFormat:@"%@:cancel",request.command]};
				
				dispatch_async(dispatch_get_main_queue(), ^{
					request.callback(result);
				});
			}
		}];
		
		return;
	}
	
	//扩展的api
	if (extensionApis[request.command]) {
		
		WDHExtensionApiHandler handler = extensionApis[request.command];
		WDHExtensionApiCallback callbck = ^void(WDHExtensionCode code, NSDictionary<NSString *, NSObject *> *result){
			switch (code) {
					case WDHExtensionCodeSuccess:
					
					if (request.callback) {
						dispatch_async(dispatch_get_main_queue(), ^{
							request.callback(result);
						});
					}
					
					break;
					case WDHExtensionCodeCancel:
				{
					if (request.callback) {
						
						dispatch_async(dispatch_get_main_queue(), ^{
							request.callback(@{@"errMsg":[NSString stringWithFormat:@"%@:cancel",request.command]});
						});
					}
					break;
				}
					case WDHExtensionCodeFailure:
				{
					if (request.callback) {
						NSMutableDictionary *failResult = result == nil ? [NSMutableDictionary dictionary] : [NSMutableDictionary dictionaryWithDictionary:result];
						
						if (!failResult[@"errMsg"]) {
							failResult[@"errMsg"] = [NSString stringWithFormat:@"%@:fail",request.command];
						}
						
						dispatch_async(dispatch_get_main_queue(), ^{
							request.callback(failResult);
						});
					}
					break;
				}
				default:
					break;
			}
		};
		
		handler(request.param, callbck);
	}
}


@end

