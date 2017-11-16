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


NSString *const WDHExtensionKeyCode = @"code";
NSString *const WDHExtensionKeyData = @"data";

@interface WHHybridExtension ()

///需要从业务方获取数据的请求
@property (nonatomic, strong) WDHApiRequest *businessDataRequest;

@end

/// 扩展的api信息数组
static NSMutableDictionary *extensionApis = nil;
static NSMutableDictionary *retrieveApis = nil;

@implementation WHHybridExtension

/*注册扩展的api，对业务宿主有用*/
+ (void)registerExtensionApi:(NSString *)api handler:(id(^)(id))handler
{
    if (!extensionApis) {
        extensionApis = [NSMutableDictionary new];
    }
    
    extensionApis[api] = handler;
}

/*注册扩展且要返回处理结果的api，对业务宿主有用*/
+ (void)registerRetrieveApi:(NSString *)api handler:(id (^)(id, WDHApiCompletion))handler {
	if (!retrieveApis) {
		retrieveApis = [NSMutableDictionary new];
	}
	
	retrieveApis[api] = handler;
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
				[result setObject:[NSString stringWithFormat:@"%@:fail",request.command] forKey:@"errMsg"];
				
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
        id(^methodCall)(id data) = extensionApis[request.command];
        NSDictionary<NSString *,id> * _Nonnull result = methodCall(request.param);
        NSInteger requestCode = -1;
        if (result[WDHExtensionKeyCode]) {
            requestCode = [result[WDHExtensionKeyCode] integerValue];
        }
        
        //结果码
        NSDictionary *data = result[WDHExtensionKeyData];
        switch (requestCode) {
            case WDHExtensionCodeSuccess:
				if ([request.command isEqualToString:@"openPageForResult"]) {
					self.businessDataRequest = request;
					return;
				}
				
                if (request.callback) {
                    
                    dispatch_async(dispatch_get_main_queue(), ^{
                        request.callback(data);
                    });
                }
                break;
            case WDHExtensionCodeCancel:
            {
                if (request.callback) {
                    NSDictionary *result = @{@"errMsg":[NSString stringWithFormat:@"%@:cancel",request.command]};
                    
                    dispatch_async(dispatch_get_main_queue(), ^{
                        request.callback(result);
                    });
                }
                break;
            }
            case WDHExtensionCodeFailure:
            {
                if (request.callback) {
                    NSMutableDictionary *result = [NSMutableDictionary dictionaryWithDictionary:data];
                    [result setObject:[NSString stringWithFormat:@"%@:fail",request.command] forKey:@"errMsg"];
					
                    dispatch_async(dispatch_get_main_queue(), ^{
                        request.callback(result);
                    });
                }
                break;
            }
            default:
                break;
        }
        
        return;
    }
	
	// 需要回传返回结果的api接口
	if(retrieveApis[request.command]) {
		id(^methodCall)(id param, WDHApiCompletion completion) = retrieveApis[request.command];
		methodCall(request.param, request.callback);
	}
    
}

@end

