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


#import "UINavigationController+WDHodoerLifeCycle.h"
#import <objc/runtime.h>
#import "WDHBaseViewController.h"
#import "WDHAppManager.h"
#import "WDHApp.h"

@implementation UINavigationController (WDHodoerLifeCycle)

+ (void)load {
	static dispatch_once_t onceToken;
	dispatch_once(&onceToken, ^{
		swizzleMethod([self class], @selector(popViewControllerAnimated:), @selector(wh_popViewControllerAnimated:));
		swizzleMethod([self class], @selector(popToViewController:animated:), @selector(wh_popToViewController:animated:));
		swizzleMethod([self class], @selector(popToRootViewControllerAnimated:), @selector(wh_popToRootViewControllerAnimated:));
		swizzleMethod([self class], @selector(pushViewController:animated:), @selector(wh_pushViewController:animated:));
	});
}

#pragma mark - Handler

/*监控被推出的页面*/
- (void)wdh_handlePopPages:(NSArray *)popedControllers
{
	// 被推出的页面是否全部为非小程序页面
	BOOL isAllNormalPage = YES;
	
	// 是否包含小程序根页面
	BOOL isContainAppRootPage = NO;
	
	//如果小程序根页面被推出了 则说明小程序退出了
	for (UIViewController *vc in popedControllers) {
		if ([vc isKindOfClass:[WDHBaseViewController class]]) {
			isAllNormalPage = NO;
			WDHApp *app = [[WDHAppManager sharedManager] currentApp];
			if ([app isAppRootPage:(WDHBaseViewController *)vc]) {
				[app stopApp];
				isContainAppRootPage = YES;
			}
		}
	}
	
	//如果返回到小程序 则小程序进入前台
	UIViewController *topVC = self.topViewController;
	if ([topVC isKindOfClass:WDHBaseViewController.class] && (isAllNormalPage || isContainAppRootPage)){
		WDHApp *app = [[WDHAppManager sharedManager] currentApp];
		[app onAppEnterForeground];
	}
}

/**
 监控被push的页面
 */
- (void)wdh_handlePushPage:(UIViewController *)viewController {
	
	UIViewController *topVC = [self topViewController];
	//判断当前是否在小程序页面
	if ([topVC isKindOfClass:[WDHBaseViewController class]]) {
		//如果将要展示的页面不是小程序页面 则认为小程序进入后台
		if (viewController && ![viewController isKindOfClass:WDHBaseViewController.class]){
			WDHApp *app = [[WDHAppManager sharedManager] currentApp];
			[app onAppEnterBackground];
		}
	}
}

#pragma mark - Pop

- (NSArray *)wh_popToRootViewControllerAnimated:(BOOL)animated
{
	NSArray *array = [self wh_popToRootViewControllerAnimated:animated];
	[self wdh_handlePopPages:array];
	return array;
}

- (UIViewController *)wh_popViewControllerAnimated:(BOOL)animated {
	
	UIViewController *vc = [self wh_popViewControllerAnimated: animated];
	
	if(vc) {
		[self wdh_handlePopPages:@[vc]];
	}
	
	return vc;
}

- (NSArray *)wh_popToViewController:(UIViewController *)controller animated:(BOOL)animated
{
	NSArray *array = [self wh_popToViewController:controller animated:animated];
	
	[self wdh_handlePopPages:array];
	
	return array;
}

#pragma mark - Push

- (void)wh_pushViewController:(UIViewController *)viewController animated:(BOOL)animated {
	
	[self wdh_handlePushPage:viewController];
	
	[self wh_pushViewController:viewController animated:animated];
}

#pragma mark - Helper

void swizzleMethod(Class class, SEL originalSelector, SEL swizzledSelector) {
	
	Method originalMethod = class_getInstanceMethod(class, originalSelector);
	Method swizzledMethod = class_getInstanceMethod(class, swizzledSelector);
	
	BOOL didAddMethod = class_addMethod(class, originalSelector, method_getImplementation(swizzledMethod), method_getTypeEncoding(swizzledMethod));
	
	if (didAddMethod) {
		class_replaceMethod(class, swizzledSelector, method_getImplementation(originalMethod), method_getTypeEncoding(originalMethod));
	} else {
		method_exchangeImplementations(originalMethod, swizzledMethod);
	}
}

@end

