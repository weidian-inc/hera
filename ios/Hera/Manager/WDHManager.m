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


#import "WDHManager.h"
#import "NSObject+WDHJson.h"
#import "WDHPageModel.h"
#import "WDHURLProtocol.h"
#import "NSURLProtocol+WebKitSupport.h"
#import "WDHFileManager.h"
#import "WDHLog.h"
#import "WDHTimerJS.h"

@interface WDHManager()

@property (nonatomic, strong) WDHAppInfo *appInfo;

@end

@implementation WDHManager

- (void)dealloc
{
	HRLog(@"deinit WDHManager");
}

- (instancetype)initWithAppInfo:(WDHAppInfo *)appInfo;
{
	if (self = [super init]) {

		_appInfo = appInfo;
		_pageManager = [WDHPageManager new];
		_extensionApi = [[WHHybridExtension alloc] init];
		_pageApi = [[WDHPageApi alloc] initWithPageManager:_pageManager];

		self.pageManager.whManager = self;
		[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(handleRefresh:) name:@"onPullDownRefresh" object:nil];
	}

	return self;
}

- (void)handleRefresh:(NSNotification *)notification {
	HRLog(@"%@", notification.object);
	[self.service callSubscribeHandlerWithEvent:notification.name jsonParam:@"{}" webId:[notification.object unsignedLongLongValue]];
}

- (void)setupEntrance:(UINavigationController *)controller
{
	[self.pageManager setupWithNaviController:controller];
}

- (void)startService
{
	HRLog(@"load_app_service");

	//拦截schema
	[NSURLProtocol registerClass:[WDHURLProtocol class]];
	[NSURLProtocol wk_registerScheme:@"wdfile"];

	//注册UA
	NSString *userAgent = [[[UIWebView alloc] init] stringByEvaluatingJavaScriptFromString:@"navigator.userAgent"];
	NSString * customUA = [userAgent stringByAppendingFormat:@" Hera(JSBridgeVersion/3.0)"];
	[[NSUserDefaults standardUserDefaults] registerDefaults:@{@"UserAgent" : customUA}];

	NSDictionary *configuration = @{@"service_html":[WDHFileManager appServiceEnterencePath:_appInfo.appId],@"root":[WDHFileManager appSourceDirPath:_appInfo.appId]};
	self.service = [[WDHService alloc] initWithAppConfiguration:configuration manager:self];
}


- (void)stopService
{
	self.service = nil;
	self.pageManager = nil;
	self.pageApi = nil;
	self.extensionApi = nil;

	[[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void) startRootPage {
    if(self.startRootCompletion) {
        self.startRootCompletion();
    }
	self.pageManager.config = self.service.appConfig;
	NSDictionary *tabbar = self.service.appConfig[@"tabBar"];
    NSString *rootPagePath = self.service.appConfig[@"root"];
    [self.pageManager startPage:[WDHFileManager appSourceDirPath:_appInfo.appId] pagePath:rootPagePath isRoot:YES openNewPage:YES isTabPage:tabbar!=nil];
}

//MARK: - 实现协议方法
- (void)service_publishHandler:(NSString *)eventName param:(NSString *)param webIds:(NSArray *)webIds callbackId:(NSString *)callbackId
{
	//pageManager根据参数分发到具体页面
	if ([eventName isEqualToString:@"custom_event_appDataChange"]) {
		[self.pageManager callSubscribeHandler:eventName jsonParam:param webIds:webIds];
	}
	else if ([eventName isEqualToString:@"custom_event_serviceReady"]) {
		HRLog(@"app_service_ready");
		NSDictionary *config = [param wdh_jsonObject];
		if (config && [config isKindOfClass:NSDictionary.class]) {
			self.service.appConfig = config;
			[self startRootPage];
		}
	}
	else if ([eventName isEqualToString:@"custom_event_H5_LOG_MSG"]) {
		NSDictionary *jsonParam = [param wdh_jsonObject];
		HRLog(@"custom_event_H5_LOG_MSG: %@", jsonParam);
	}
    // setTimeout事件处理
    else if ([eventName isEqualToString:@"custom_event_setTimeout"]) {
        NSDictionary *jsonParam = [param wdh_jsonObject];
        HRLog(@"custom_event_setTimeout");
        
        [[WDHTimerJS sharedInstance] startWithParams:jsonParam repeat:NO callback:^(NSString *params) {
            [self.service callSubscribeHandlerWithEvent: @"onSetTimeout" jsonParam: params];
        }];
    }
    else if ([eventName isEqualToString:@"custom_event_setInterval"]) {
        NSDictionary *jsonParam = [param wdh_jsonObject];
        HRLog(@"custom_event_setInterval");
        [[WDHTimerJS sharedInstance] startWithParams:jsonParam repeat:YES callback:^(NSString *params) {
            [self.service callSubscribeHandlerWithEvent: @"onSetInterval" jsonParam: params];
        }];
    }
    else if ([eventName isEqualToString:@"custom_event_clearTimeout"]) {
        HRLog(@"custom_event_clearTimeout:%@",param);
        if (param && ![param isEqualToString:@""]){
            [[WDHTimerJS sharedInstance] clearTimeout:param];
        }
    }
	else {
		[self.pageManager callSubscribeHandler:eventName jsonParam:param webIds:webIds];
	}

	//publish的回调

	if (callbackId) {
		[self.service publishCallbackHandler:callbackId];
	}
}

- (void)page_publishHandler:(NSString *)eventName param:(NSString *)param pageModel:(WDHPageModel *)pageModel callbackId:(NSString *)callbackId
{


	unsigned long long webId = pageModel.pageId;

	//根据具体事件进行分发
	if ([eventName isEqualToString:@"custom_event_DOMContentLoaded"]) {
		NSString *opentype = pageModel.openType;
		NSString *url = [pageModel pagePathUrl];
		NSString * query = pageModel.query == nil ? @"appLaunch": pageModel.query;
		[self.service onAppRoute:opentype htmlPath:url queryString:query webId:webId];
	}else if ([eventName isEqualToString:@"custom_event_getConfig"]) {
		NSDictionary *jsonParam = [param wdh_jsonObject];
		[self.pageManager loadPageConfig:webId pageConfig:jsonParam];
	}else if ([eventName isEqualToString:@"custom_event_PAGE_EVENT"]) {
		[self.service callSubscribeHandlerWithEvent:eventName jsonParam:param webId:webId];
	} else if ([eventName isEqualToString:@"custom_event_SPECIAL_PAGE_EVENT"]) {
		[self.service callSubscribeHandlerWithEvent:eventName jsonParam:param webId:webId];
	} else if ([eventName isEqualToString:@"custom_event_canvasInsert"]) {
		[self.service callSubscribeHandlerWithEvent:eventName jsonParam:param webId:webId];
	} else if ([eventName isEqualToString:@"custom_event_video"]) {
		[self.service callSubscribeHandlerWithEvent:eventName jsonParam:param webId:webId];
	} else if ([eventName isEqualToString:@"custom_event_H5_LOG_MSG"]) {
		HRLog(@"custom_event_H5_LOG_MSG: %@", param);
	}else if ([eventName isEqualToString:@"custom_event_INVOKE_METHOD"]) {
		[self.service callSubscribeHandlerWithEvent:eventName jsonParam:param webId:webId];
	} else if ([eventName isEqualToString:@"custom_event_SPECIAL_PAGE_EVENT"]) {
		[self.service callSubscribeHandlerWithEvent:eventName jsonParam:param webId:webId];
	} else if ([eventName isEqualToString:@"custom_event_canvasInsert"]) {
		[self.service callSubscribeHandlerWithEvent:eventName jsonParam:param webId:webId];
	} else if ([eventName isEqualToString:@"custom_event_H5_CONSOLE_LOG"]) {
		HRLog(@"WDHodoer custom_event_H5_CONSOLE_LOG: %@", param);
	}


}

- (void)page_invokeHandler:(NSString *)eventName param:(NSString *)param pageModel:(WDHPageModel *)pageModel callbackId:(NSString *)callbackId
{


    unsigned long long webId = pageModel.pageId;

    //根据具体事件进行分发
    if ([eventName isEqualToString:@"insertHTMLWebView"]) {
    }

}

- (void)service_apiRequest:(NSString *)command param:(NSString *)param callbackId:(int)callbackId
{
	HRLog(@"service_api--->command: %@, param: %@", command, param);

	NSDictionary *paramDic = [param wdh_jsonObject];
	WDHApiRequest *request = [[WDHApiRequest alloc] init];
	request.command = command;
	request.param = paramDic;
	request.callback = ^(NSDictionary<NSString *,NSObject *> *result) {
		if (!callbackId) {
			return;
		}

		NSString *resultJsonString = [result wdh_jsonString];

		if (!resultJsonString) {
			resultJsonString = @"{}";
		}

		HRLog(@"service_api--->api: %@, data: %@", command, resultJsonString);

		[self.service invokeCallbackHandler:callbackId param:resultJsonString];
	};

	[self.extensionApi didRecieveHybridApiWithApi:request];
}

- (void)service_innerApiRequest:(NSString *)command param:(NSString *)param callbackId:(int)callbackId
{
	NSDictionary *paramsDict = [param wdh_jsonObject];

	self.pageApi.basePath = [WDHFileManager appSourceDirPath:self.appInfo.appId];
	self.pageApi.service = self.service;

	[self.pageApi receive:command param:paramsDict callback:^(NSDictionary<NSString *,NSObject *> *result) {
		if (!callbackId) {
			return;
		}

		NSString *resultJsonString = [result wdh_jsonString];

		if (!resultJsonString) {
			resultJsonString = @"{}";
		}

		[self.service invokeCallbackHandler:callbackId param:resultJsonString];
	}];
}

@end

