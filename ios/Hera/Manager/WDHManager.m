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

@interface WDHManager()

@property (nonatomic, strong) WDHAppInfo *appInfo;

@end

@implementation WDHManager

- (void)dealloc
{
	NSLog(@"deinit WDHManager");
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
	NSLog(@"%@", notification.object);
	[self.service callSubscribeHandlerWithEvent:notification.name jsonParam:@"{}" webId:[notification.object unsignedLongLongValue]];
}

- (void)setupEntrance:(UINavigationController *)controller
{
	[self.pageManager setupWithNaviController:controller];
}

- (void)startService
{
	NSLog(@"load_app_service");
	
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
	
	[[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void) startRootPage {
	self.pageManager.config = self.service.appConfig;
	NSDictionary *tabbar = self.service.appConfig[@"tabBar"];
	if (tabbar) {
		NSString *rootPagePath = self.service.appConfig[@"root"];
		[self.pageManager startTabarPage:self.service.appConfig basePath:[WDHFileManager appSourceDirPath:_appInfo.appId] defaultPagePath:rootPagePath];
	}else {
		NSString *rootPagePath = self.service.appConfig[@"root"];
		[self.pageManager startPage:[WDHFileManager appSourceDirPath:_appInfo.appId] pagePath:rootPagePath isRoot:YES];
	}
}

//MARK: - 实现协议方法
- (void)service_publishHandler:(NSString *)eventName param:(NSString *)param webIds:(NSArray *)webIds callbackId:(NSString *)callbackId
{
	//pageManager根据参数分发到具体页面
	if ([eventName isEqualToString:@"custom_event_appDataChange"]) {
		[self.pageManager callSubscribeHandler:eventName jsonParam:param webIds:webIds];
	}else if ([eventName isEqualToString:@"custom_event_serviceReady"]) {
		NSLog(@"app_service_ready");
		[self.service loadConfigFileWithCompletion:^(NSDictionary *dic) {
			//startLoad Page RootHtml
			[self startRootPage];
		}];
		
	}else if ([eventName isEqualToString:@"custom_event_H5_LOG_MSG"]) {
		NSDictionary *jsonParam = [param wdh_jsonObject];
		NSLog(@"custom_event_H5_LOG_MSG: %@", jsonParam);
	}else if ([eventName isEqualToString:@"custom_event_getConfig"]) {
		//加载项目配置文件
		NSDictionary *config = [param wdh_jsonObject];
		if (config) {
			self.service.appConfig = config;
			//startLoad Page RootHtml
			[self startRootPage];
		}
		
	} else {
		[self.pageManager callSubscribeHandler:eventName jsonParam:param webIds:webIds];
	}
	
	//publish的回调
	
	if (callbackId) {
		[self.service publishCallbackHandler:callbackId];
	}
}

- (void)page_publishHandler:(NSString *)eventName param:(NSString *)param pageModel:(WDHPageModel *)pageModel callbackId:(NSString *)callbackId
{
	
	NSString *url = [pageModel pagePathUrl];
	NSString * query = pageModel.query;
	unsigned long long webId = pageModel.pageId;
	
	//根据具体事件进行分发
	if ([eventName isEqualToString:@"custom_event_DOMContentLoaded"]) {
		NSString *opentype = pageModel.openType;
		if (opentype == nil) {
			opentype = @"appLaunch";
		}
		
		//MARK:发送onAppRoute事件
		[self.service onAppRoute:opentype htmlPath:url queryString:query webId:webId];
	}else if ([eventName isEqualToString:@"custom_event_getConfig"]) {
		NSDictionary *jsonParam = [param wdh_jsonObject];
		[self.pageManager loadPageConfig:webId pageConfig:jsonParam];
	}else if ([eventName isEqualToString:@"custom_event_PAGE_EVENT"]
			  || [eventName isEqualToString:@"custom_event_SPECIAL_PAGE_EVENT"]
			  || [eventName isEqualToString:@"custom_event_canvasInsert"]) {
		[self.service callSubscribeHandlerWithEvent:eventName jsonParam:param webId:webId];
	}else if ([eventName isEqualToString:@"custom_event_H5_LOG_MSG"]) {
		NSLog(@"custom_event_H5_LOG_MSG: %@", param);
	}else if ([eventName isEqualToString:@"custom_event_INVOKE_METHOD"]) {
		//demo使用方法
		[self.service callSubscribeHandlerWithEvent:eventName jsonParam:param webId:webId];
	} else if ([eventName isEqualToString:@"custom_event_SPECIAL_PAGE_EVENT"]) {
		[self.service callSubscribeHandlerWithEvent:eventName jsonParam:param webId:webId];
	} else if ([eventName isEqualToString:@"custom_event_canvasInsert"]) {
		[self.service callSubscribeHandlerWithEvent:eventName jsonParam:param webId:webId];
		
	} else if ([eventName isEqualToString:@"custom_event_H5_CONSOLE_LOG"]) {
		//控制台输出H5log
		NSLog(@"WDHodoer custom_event_H5_CONSOLE_LOG: %@", param);
	}
	
	//    else {
	//       [self.service callSubscribeHandlerWithEvent:eventName jsonParam:param webId:webId];
	//    }
	
}

- (void)service_apiRequest:(NSString *)command param:(NSString *)param callbackId:(int)callbackId
{
	NSLog(@"service_api--->command: %@, param: %@", command, param);
	
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
		
		NSLog(@"service_api--->api: %@, data: %@", command, resultJsonString);
		
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

