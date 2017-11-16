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


#import "WDHAppManager.h"
#import "WDHApp.h"
#import "WDHLoadingView.h"
#import "NSURLProtocol+WebKitSupport.h"

@interface WDHAppManager ()

@property (nonatomic, copy) NSMutableArray *apps;

@end

@implementation WDHAppManager

#pragma mark - Init

- (instancetype)init {
	
	if (self = [super init]) {
		_apps = [NSMutableArray array];
	}
	
	return self;
}

+ (instancetype)sharedManager {
	
	static WDHAppManager *_appManager = nil;
	static dispatch_once_t onceToken;
	dispatch_once(&onceToken, ^{
		if (!_appManager) {
			_appManager = [[WDHAppManager alloc] init];
		}
	});
	
	return _appManager;
}

#pragma mark - 小程序栈管理

- (void)addApp:(WDHApp *)app {
	if (app) {
		[self.apps addObject:app];
	}
}

- (void)removeApp:(WDHApp *)app {
	[self.apps removeObject:app];
	
	// 如果全部小程序退出 做清理工作
	if (self.apps.count <= 0) {
		[self cleanWDHodoer];
	}
}

- (WDHApp *)currentApp {
	return [self.apps lastObject];
}

#pragma mark - Helper 

- (void)cleanWDHodoer {
	
	// 清理所有loading框
	[WDHLoadingView removeAllLoading];
	
	// 注销schema拦截
	[NSURLProtocol wk_unregisterScheme:@"wdfile"];
}

@end

