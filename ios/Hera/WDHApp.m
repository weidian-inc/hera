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


#import "WDHApp.h"
#import "WDHFileManager.h"
#import "WDHManager.h"
#import "WHHybridExtension.h"
#import "WDHAppManager.h"
#import "WDHManager.h"
#import "NSObject+WDHJson.h"
#import "WDHBaseViewController.h"

@interface WDHApp ()

@property (nonatomic, strong) WDHManager *manager;

@end

@implementation WDHApp

- (instancetype)initWithAppInfo:(WDHAppInfo *)appInfo {
	
	if (self = [super init]) {
		_appInfo = appInfo;
	}

	return self;
}

#pragma mark - Helper

- (BOOL)isAppRootPage:(UIViewController *)page {
	return [self.manager.pageManager isRootPage:page];
}

#pragma mark - Life Cyle

- (void)startAppWithEntrance:(UINavigationController *)entrance {
	
	_manager = [[WDHManager alloc] initWithAppInfo:self.appInfo];
	[_manager setupEntrance:entrance];
	[_manager startService];
	
	[[WDHAppManager sharedManager] addApp:self];
}

- (void)stopApp {
	
	[self.manager stopService];
	[self.manager.pageManager resetNavigationBarHidden];
	[[WDHAppManager sharedManager] removeApp:self];
}

- (void)onAppEnterBackground {
	[self.manager.pageManager resetNavigationBarHidden];
	[self.manager.service callSubscribeHandlerWithEvent:@"onAppEnterBackground" jsonParam:[@{@"mode": @"hang"} wdh_jsonString]];
}

- (void)onAppEnterForeground {
	
	[self.manager.service callSubscribeHandlerWithEvent:@"onAppEnterForeground" jsonParam: @"{}"];
	
	//重置UserAgent
	NSString *userAgent = [[[UIWebView alloc] init] stringByEvaluatingJavaScriptFromString:@"navigator.userAgent"];
	NSString * customUA = [userAgent stringByAppendingFormat:@" Hera(JSBridgeVersion/3.0)"];
	[[NSUserDefaults standardUserDefaults] registerDefaults:@{@"UserAgent" : customUA}];
}

@end

