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


#import "WDHPageApi.h"
#import "WDHService.h"
#import "WDHPageManager.h"
#import "WDHPageBaseViewController.h"
#import "WDHTabBarViewController.h"


@interface WDHPageApi ()


@property (nonatomic, weak) WDHPageManager *pageManager;

@end

@implementation WDHPageApi

- (instancetype)initWithPageManager:(WDHPageManager *)pageManager
{
    if (self = [super init]) {
        self.pageManager = pageManager;
    }
    
    return self;
}

- (void) receive:(NSString *)command param:(NSDictionary *)param callback:(WDHApiRequestCallback)callback {
    self.pageManager.config = self.service.appConfig;

    if ([command isEqualToString:@"navigateTo"]) {
        if ( param[@"url"]) {
            [self.pageManager startPage:self.basePath pagePath:param[@"url"] openNewPage:YES];
        }
    }else if ([command isEqualToString:@"redirectTo"]) {
        if ( param[@"url"]) {
            [self.pageManager startPage:self.basePath pagePath:param[@"url"] openNewPage:NO];
        }
    }else if ([command isEqualToString:@"navigateBack"]) {
        if (param[@"delta"]) {
            [self.pageManager gotoPageAtIndex:[param[@"delta"] intValue]];
        }
    }else if ([command isEqualToString:@"showToast"]) {
        [self parseShowToast:param callback:callback];
    }else if ([command isEqualToString:@"hideToast"]) {
        [self hideToast];
    }else if ([command isEqualToString:@"setNavigationBarTitle"]) {
        if (param[@"title"]) {
            [self.pageManager setTopPageTitle:param[@"title"]];
        }
    }else if ([command isEqualToString:@"showNavigationBarLoading"]) {
        [self showNavigationBarLoading];
    } else if ([command isEqualToString:@"hideNavigationBarLoading"]) {
        [self hideNavigationBarLoading];
    } else if ([command isEqualToString:@"setNavigationBarColor"]) {
        [self parseNaviColorWithParam:param callback:callback];
    }else if ([command isEqualToString:@"switchTab"]) {
        [self.pageManager switchTabbar:param];
    }else if ([command isEqualToString:@"reLaunch"]) {
        if ( param[@"url"]) {
            [self.pageManager startPage:self.basePath pagePath:param[@"url"] openNewPage:NO];
        }
	} else if ([command isEqualToString:@"startPullDownRefresh"]) {
		WDHBaseViewController *vc = [self.pageManager.pageStack top];
		[vc startPullDownRefresh];
		if (callback) {
			callback(@{});
		}
	} else if ([command isEqualToString:@"stopPullDownRefresh"]) {
		WDHBaseViewController *vc = [self.pageManager.pageStack top];
		[vc stopPullDownRefresh];
		if (callback) {
			callback(@{});
		}
	}
}

- (void) parseShowToast:(NSDictionary *)param callback:(WDHApiRequestCallback)callback {
	
	if (!param) {
		return;
	}
	
	NSString *titleString = param[@"title"];
	NSString *iconString = param[@"icon"];
	int duration = 2.0;
	if (param[@"duration"]) {
		duration = [param[@"duration"] intValue];
	}
	
	BOOL mask = false;
	if (param[@"mask"]) {
		mask = [param[@"mask"] boolValue];
	}
	
	void (^toastBlock)(NSString *titleString) = ^(NSString *titleString){
		if (titleString != nil) {
			[self showToast:titleString icon:iconString duration:duration mask:mask];
			if (callback) {
				callback(@{});
			}
		}
	};
	
	if (iconString != nil) {
		if([iconString isEqualToString:@"loading"]) {
			[self showLoading:titleString mask:mask];
			if (callback) {
				callback(@{});
			}
		} else {
			toastBlock( titleString);
		}
	} else {
		toastBlock( titleString);
	}
}

- (void) parseShowLoading:(NSDictionary *)param {
    if (!param) {
        return;
    }
	
    NSString *titleString = param[@"title"];
    BOOL mask = false;
    if (param[@"mask"]) {
        mask = [param[@"mask"] boolValue];
    }

    [self showLoading:titleString mask:mask];

}


// navigationbar

- (void)parseNaviColorWithParam:(NSDictionary *)param callback:(WDHApiRequestCallback)callback {
    if (!param) {
        callback(@{@"errMsg": @"参数为空"});
        return;
    }
    
    NSString *frontColor = param[@"frontColor"];
    if (!frontColor) {
        if (callback) {
            callback(@{@"errMsg": @"参数frontColor 为空"});
        }
        return;
    }
    
    // 仅支持#ffffff #000000
    if (![[frontColor lowercaseString] isEqualToString:@"#ffffff"] && ![frontColor isEqualToString:@"#000000"]){
        if(callback) {
            callback(@{@"errMsg": @"参数frontColor 仅支持#ffffff和#000000"});
        }
        return;
    }
    
    NSString *bgColor = param[@"backgroundColor"];
    if (!bgColor) {
        if (callback) {
            callback(@{@"errMsg": @"参数backgroundColor 为空"});
        }
        return;
    }
    
    NSMutableDictionary *animationParam = [NSMutableDictionary dictionary];
    animationParam[@"duration"] = @0;
    animationParam[@"timingFunc"] = @"linear";
    
    NSDictionary *animation = param[@"animation"];
    if (animation && [animation isKindOfClass:NSDictionary.class]) {
        if (param[@"durarion"]) {
            animationParam[@"durarion"] = animation[@"durarion"];
        }
        
        if (param[@"timingFunc"]) {
            animationParam[@"timingFunc"] = animation[@"timingFunc"];
        }
    }
    
    WDHBaseViewController *vc = [self.pageManager.pageStack top];
    [vc setNaviFrontColor:frontColor andBgColor:bgColor withAnimationParam:animationParam];
}


- (void)showNavigationBarLoading {
    WDHBaseViewController *vc = [self.pageManager.pageStack top];
    [vc startNaviLoading];
}


- (void)hideNavigationBarLoading {
    WDHBaseViewController *vc = [self.pageManager.pageStack top];
    [vc hideNaviLoading];
}

//toast
- (void) showToast:(NSString *)title
                       icon:(NSString *)icon
                       duration:(int)duration
                       mask:(BOOL)mask {
    WDHBaseViewController *vc = [self.pageManager.pageStack top];
    [vc showToast:title mask:mask duration:duration];
}

- (void) hideToast {
    [self hideLoading];
}

//loading
- (void) showLoading:(NSString *)title mask:(BOOL)mask {
    WDHBaseViewController *vc = [self.pageManager.pageStack currentPage];
    [vc startLoading:title mask:YES];
}

- (void) hideLoading {
	// 隐藏Loading原则 首先隐藏当前页面的Loading 如果当前页没有Loading 则移除队首的页面的Loading
	WDHPageBaseViewController *currentPage = [self.pageManager.pageStack currentPage];
	[currentPage stopLoading];
}



@end

