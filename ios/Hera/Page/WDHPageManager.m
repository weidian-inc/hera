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


#import "WDHPageManager.h"
#import "WDHPageBridge.h"
#import "WDHBaseViewController+Extension.h"
#import "WDHTabBarViewController.h"
#import "NSString+WDH.h"
#import "WDHAppletViewController.h"
#import "WDHLog.h"
#import "WDHTimerJS.h"

@implementation WDHPageStack

- (void)setNaviController:(UINavigationController *)naviController
{
	_naviController = naviController;
	
	self.initialIndex = _naviController.viewControllers.count;
}

- (BOOL) isExist:(WDHBaseViewController *)page {
	
	BOOL exsists = NO;
	NSArray *nodes = [self nodes];
	
	//如果为TabBarVC则比较对象  如果为PageVC则比较页面路径
	if ([page isKindOfClass:WDHPageBaseViewController.class]) {
		WDHPageBaseViewController *thePage = (WDHPageBaseViewController *)page;
		for(WDHBaseViewController *vc in nodes) {
			if ([vc isKindOfClass:WDHPageBaseViewController.class]) {
				WDHPageBaseViewController *pageVC = (WDHPageBaseViewController *)vc;
				if (pageVC.pageModel.pagePath == thePage.pageModel.pagePath) {
					exsists = YES;
					break;
				}
			} else if ([vc isKindOfClass:WDHTabBarViewController.class]) {
				for(WDHPageBaseViewController *subVC in vc.childViewControllers) {
					if (subVC.pageModel.pagePath == thePage.pageModel.pagePath) {
						exsists = YES;
						break;
					}
				}
			}
		}
	} else if ([page isKindOfClass:WDHTabBarViewController.class]) {
		exsists = [nodes containsObject:page];
	}
	
	return exsists;
}

/**
 获取小程序栈顶视图控制器

 @return 小程序栈顶视图控制器
 */
- (WDHBaseViewController *)top {
	
	__block WDHBaseViewController *theTop = nil;
	
	[self.naviController.viewControllers enumerateObjectsWithOptions:NSEnumerationReverse usingBlock:^(__kindof UIViewController * _Nonnull vc, NSUInteger idx, BOOL * _Nonnull stop) {
		if ([vc isKindOfClass:WDHBaseViewController.class]) {
			theTop = vc;
			*stop = YES;
		}
	}];
	
	return theTop;
}

/**
 获取小程序当前显示的页面
 如果为TabBarVC 则为当前显示的ChildViewController
 
 @return 小程序当前显示的页面
 */
- (WDHBaseViewController *)currentPage {
	
	WDHPageBaseViewController *page = nil;
	WDHBaseViewController *topVC = [self top];
	
	if ([topVC isKindOfClass:WDHPageBaseViewController.class]) {
		page = (WDHPageBaseViewController *)topVC;
	} else if ([topVC isKindOfClass:WDHTabBarViewController.class]){
		page = [(WDHTabBarViewController *)topVC currentController];
	}
	
	return page;
}

- (WDHPageBaseViewController *)nodeAtIndex:(NSUInteger)atIndex {
	NSUInteger index = self.initialIndex + atIndex;
	
	if (index < self.naviController.viewControllers.count) {
		if ([self.naviController.viewControllers[index] isKindOfClass:[WDHPageBaseViewController class]]) {
			return (WDHPageBaseViewController *)self.naviController.viewControllers[index];
		}
	}
	return nil;
}


/**
 获取小程序所有页面 
 TabBarController的计算为ChildViewController

 @return 小程序所有页面
 */
- (NSArray <WDHPageBaseViewController *> *)nodes{
	NSMutableArray *arr = [NSMutableArray new];
	for (WDHPageBaseViewController *cell in [self stack]) {
		if ([cell isKindOfClass:[WDHPageBaseViewController class]]) {
			[arr addObject:cell];
		}else if ([cell isKindOfClass:[WDHTabBarViewController class]]) {
			for (WDHPageBaseViewController *tabBarCell in [(WDHTabBarViewController *)cell childViewControllers]) {
				[arr addObject:tabBarCell];
			}
		}
	}
	
	return [arr copy];
}


/**
 获取小程序页面控制器栈

 @return 程序页面控制器栈
 */
- (NSArray <WDHBaseViewController *> *)stack {
	NSMutableArray *arr = [NSMutableArray new];
	
	NSArray *viewControllers = self.naviController.viewControllers;
	NSUInteger index = [viewControllers indexOfObject:[self top]];
	if (index != NSNotFound) {
		for (NSInteger i = index; i >= 0; i--) {
			UIViewController *vc = [viewControllers objectAtIndex:i];
			if (![vc isKindOfClass:WDHBaseViewController.class]) {
				break;
			}
			
			[arr insertObject:vc atIndex:0];
		}
	}
	
	return [arr copy];
}

/////////action////////
- (void)push:(WDHBaseViewController *)page {
    //清除了所有定时器
    [[WDHTimerJS sharedInstance] clearAllTimeout];
	[self.naviController pushViewController:page animated:YES];
}

- (WDHBaseViewController *)pop {
    //清除了所有定时器
    [[WDHTimerJS sharedInstance] clearAllTimeout];
	
	NSArray *pages = [self stack];
	if (pages.count > 0) {
		WDHBaseViewController *popedVC = (WDHBaseViewController *)[self.naviController popViewControllerAnimated:YES];
		
		WDHBaseViewController *lastPage = self.naviController.viewControllers.lastObject;
		if ([lastPage isKindOfClass:[WDHPageBaseViewController class]]) {
			[(WDHPageBaseViewController *)lastPage pageModel].backType = @"navigateBack";
		}else if ([lastPage isKindOfClass:[WDHTabBarViewController class]]) {
			WDHTabBarViewController *tabBar = (WDHTabBarViewController *)lastPage;
			tabBar.pageModel.backType = @"navigateBack";
		}
		
		return popedVC;
	}
	
	return nil;
}

- (void)popToPage:(WDHBaseViewController *)toPage {
    //清除了所有定时器
    [[WDHTimerJS sharedInstance] clearAllTimeout];
	
	NSArray *pages = [self stack];
	[pages enumerateObjectsWithOptions:NSEnumerationReverse usingBlock:^(WDHBaseViewController *  _Nonnull page, NSUInteger idx, BOOL * _Nonnull stop) {
		if (page == toPage) {
			if ([page isKindOfClass:WDHPageBaseViewController.class]) {
				[(WDHPageBaseViewController *)page pageModel].backType = @"navigateBack";
			} else if ([page isKindOfClass:WDHTabBarViewController.class]) {
				[(WDHTabBarViewController *)page pageModel].backType = @"navigateBack";
			}
			
			[self.naviController popToViewController:page animated:YES];
			*stop = YES;
		}
	}];
}

- (UIViewController *)popToRoot {
    //清除了所有定时器
    [[WDHTimerJS sharedInstance] clearAllTimeout];
	
	NSArray *pages = [self stack];
	if (pages.count > 0) {
		WDHBaseViewController *rootPage = [pages firstObject];
		if ([rootPage isKindOfClass:WDHPageBaseViewController.class]) {
			[(WDHPageBaseViewController *)rootPage pageModel].backType = @"navigateBack";
		} else if ([rootPage isKindOfClass:WDHTabBarViewController.class]) {
			[(WDHTabBarViewController *)rootPage pageModel].backType = @"navigateBack";
		}
		
		[self.naviController popToViewController:rootPage animated:YES];
		
		return rootPage;
	}
	
	return nil;
}

- (NSUInteger)length{
	return [self stack].count;
}

@end

@interface WDHPageManager ()


/// start page后页面栈的长度
@property (nonatomic, assign) int lastStackLength;

@property (nonatomic, assign) BOOL originNavigationBarHidden;

/// 小程序根试图控制器
@property (nonatomic, strong) WDHBaseViewController *rootViewController;

@end

@implementation WDHPageManager


- (void)setupWithNaviController:(UINavigationController *)naviController {
	_originNavigationBarHidden = naviController.isNavigationBarHidden;
	self.pageStack.naviController = naviController;
}

- (void)resetNavigationBarHidden {
	[self.pageStack.naviController setNavigationBarHidden:_originNavigationBarHidden animated:NO];
}

- (instancetype)init
{
	if (self = [super init]) {
		self.pageStack = [WDHPageStack new];
	}
	
	return self;
}

//开始跳页
- (void)startPage:(NSString *)basePath pagePath:(NSString *)pagePath isRoot:(BOOL)isRoot {
	[self startPage:basePath pagePath:pagePath isRoot:isRoot openNewPage:YES];
}

- (void)startPage:(NSString *)basePath pagePath:(NSString *)pagePath openNewPage:(BOOL)openNewPage {
	[self startPage:basePath pagePath:pagePath isRoot:NO openNewPage:openNewPage];
}

- (void)startPage:(NSString *)basePath pagePath:(NSString *)pagePath isRoot:(BOOL)isRoot openNewPage:(BOOL)openNewPage
{
    [self startPage:basePath pagePath:pagePath isRoot:isRoot openNewPage:openNewPage isTabPage:NO];
}

- (void)startPage:(NSString *)basePath
         pagePath:(NSString *)pagePath
           isRoot:(BOOL)isRoot
      openNewPage:(BOOL)openNewPage
        isTabPage:(BOOL)isTabPage
{
    NSString *openType;
    NSDictionary *config = _config;
    if (isRoot) {
        openType = @"appLaunch";
    }else if (openNewPage) {
        openType = @"navigateTo";
    } else {
        openType = @"redirectTo";
    }
    
    if(isTabPage) {

        //配置tabbar
        NSDictionary *tabBar = config[@"tabBar"];
        WDHTabbarStyle *style = [[WDHTabbarStyle alloc] init];
        style.color = tabBar[@"color"];
        style.selectedColor = tabBar[@"selectedColor"];
        style.backgroundColor = tabBar[@"backgroundColor"];
        style.position = tabBar[@"position"];
        style.borderStyle = tabBar[@"borderStyle"];
        NSMutableArray *list = [NSMutableArray new];
        for (NSDictionary *item in tabBar[@"list"]) {
            WDHTabbarItemStyle *itemStyle = [[WDHTabbarItemStyle alloc] init];
            itemStyle.title = item[@"text"];
            itemStyle.pagePath = item[@"pagePath"];
            if ([itemStyle.pagePath isEqualToString:pagePath]) {
                itemStyle.isDefaultPath = YES;
            }
            
            if (item[@"iconPath"]) {
                itemStyle.iconPath = [basePath stringByAppendingPathComponent:item[@"iconPath"]];
            }
            
            if (item[@"selectedIconPath"]) {
                itemStyle.selectedIconPath = [basePath stringByAppendingPathComponent:item[@"selectedIconPath"]];
            }
            
            [list addObject:itemStyle];
        }
        style.list = list;
        
        NSMutableArray *controllers = [NSMutableArray new];
        for (WDHTabbarItemStyle *itemStyle in list) {
            WDHPageModel *model = [WDHPageModel new];
            NSString *visitPagePath = pagePath;
            NSArray *pagePathArray = [visitPagePath componentsSeparatedByString:@"?"];
            if (pagePathArray.count >= 2) {
                model.query = pagePathArray[1];
            }
            
            model.pagePath = itemStyle.pagePath;
            model.pageRootDir = basePath;
            model.openType = openType;
            
            [self parseConfig:self.config model:model];
            
            WDHPageBaseViewController *vc = [self createPage:model];
            vc.isTabBarVC = YES;
            [controllers addObject:vc];
            
        }
        
        if(openNewPage) {
            WDHTabBarViewController *vc = [[WDHTabBarViewController alloc] init];
            vc.pageManager = self;
            vc.viewControllers = [controllers copy];
            vc.tabbarStyle = style;
            if (isRoot) {
                self.rootViewController = vc;
            }
            [self gotoPage:vc];
        } else {
            WDHTabBarViewController * topVC = (WDHTabBarViewController *)[self.pageStack currentPage];
            if([topVC isKindOfClass:WDHTabBarViewController.class]) {
                topVC.viewControllers = [controllers copy];
                topVC.tabbarStyle = style;
                [topVC loadTabStyle];
            }
        }
    }
    else
    {
        
        WDHPageModel *model = [WDHPageModel new];
        NSString *visitPagePath = pagePath;
        
        NSArray *pagePathArray = [visitPagePath componentsSeparatedByString:@"?"];
        if (pagePathArray.count >= 2) {
            model.query = pagePathArray[1];
        }
        
        model.pagePath = pagePath;
        model.pageRootDir = basePath;
        model.openType = openType;
        
        [self parseConfig:config model:model];
        
        if (!openNewPage) {
            WDHPageBaseViewController * topVC = (WDHPageBaseViewController *)[self.pageStack currentPage];
            if([topVC isKindOfClass:WDHPageBaseViewController.class]) {
                topVC.pageModel = model;
                [topVC loadData];
                [topVC loadStyle];
            }
        } else {
            WDHPageBaseViewController *vc = [self createPage:model];
            [self gotoPage:vc];
            
            if (isRoot) {
                self.rootViewController = vc;
            }
        }
    }
}

- (void)parseConfig:(NSDictionary *)data model:(WDHPageModel *)model {
	
	if (data[@"window"]) {
		model.windowStyle = [WDHPageModel parseWindowStyleData:data[@"window"]];
		
		if (data[@"window"][@"pages"]) {
			model.pageStyle = [WDHPageModel parsePageStyleData:data[@"window"][@"pages"] path:[model pathKey]];
		}
		
	}else {
		model.windowStyle = nil;
	}
}

- (void)gotoPageAtIndex:(NSUInteger)atIndexFromTop {
	
	NSArray *pages = [self.pageStack stack];
	NSInteger index = pages.count - atIndexFromTop - 1;
	if (index < 0 || index >= pages.count) {
		[self.pageStack popToRoot];
	} else {
		[self.pageStack popToPage:[pages objectAtIndex:index]];
	}
}

- (void)setTopPageTitle:(NSString *)title {
	WDHBaseViewController *vc = [self.pageStack currentPage];
	[vc.pageModel updateTitle:title];
    if([vc isKindOfClass: [WDHPageBaseViewController class]]) {
        WDHPageBaseViewController *pvc = (WDHPageBaseViewController *)vc;
        [pvc loadStyle];
    }
}

- (void)gotoPage:(WDHBaseViewController *)page {
	if ([self.pageStack isExist:page]) {
		[self.pageStack popToPage:page];
	} else {
        BOOL resetPage = NO;
        if(self.pageStack.naviController.viewControllers.count > 0 && [self.pageStack.naviController.viewControllers.lastObject isKindOfClass:[WDHAppletViewController class]]) {
            WDHAppletViewController *home = self.pageStack.naviController.viewControllers.lastObject;
            NSString *pid = [home valueForKey:@"wdh_applet_page_id"];
            if([pid isKindOfClass:[NSString class]] && [pid isEqualToString:@"Weidian_Wechat_Applet_Page"]) {
                NSMutableArray *viewControllers = @[].mutableCopy;
                NSInteger count = self.pageStack.naviController.viewControllers.count;
                [self.pageStack.naviController.viewControllers enumerateObjectsUsingBlock:^(__kindof UIViewController * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
                    if(idx < count - 1) {
                        [viewControllers addObject:obj];
                    }
                }];
                [viewControllers addObject:page];

                if(home.isLoadding) {
                    [home stopLoadingWithCompletion:^{
                        [self.pageStack.naviController setViewControllers:viewControllers];
                    }];
                } else {
                    [self.pageStack.naviController setViewControllers:viewControllers];
                }

                resetPage = YES;
            }
        }
        
        if(!resetPage) {
            [self.pageStack push:page];
        }
        
	}
}

//创建页面，并连接page bridge
- (WDHPageBaseViewController *)createPage:(WDHPageModel *)model {
	WDHPageBaseViewController *vc = [WDHPageBaseViewController new];
	vc.pageModel = model;
	vc.pageManager = self;
	
	WDHPageBridge *bridge = [WDHPageBridge new];
	bridge.manager = self.whManager;
	vc.bridge =  bridge;
	
	return vc;
}

//MARK: - 实现协议
//page appear or disappear

- (void)activePageDidDisappear:(WDHPageBaseViewController *)vc {
	
}

- (void)activePageWillAppear:(WDHPageBaseViewController *)vc {
	
}

- (void)activePageDidAppear:(WDHPageBaseViewController *)vc {
	
	WDHPageModel *topModel = vc.pageModel;
	if (topModel.backType) {
		
		WDHPageModel *model = [WDHPageModel new];
		
		if (topModel) {
			model.pagePath = topModel.pagePath;
			model.query = topModel.query;
			model.pageId = topModel.pageId;
			model.pageRootDir = topModel.pageRootDir;
			model.openType = topModel.backType;
		}
		
		topModel.backType = nil;
		
		[self.whManager page_publishHandler:@"custom_event_DOMContentLoaded" param:@"" pageModel:model callbackId:@""];
	}
}

- (void)pop{
	[self.pageStack pop];
}

- (void)callSubscribeHandler:(NSString *)eventName jsonParam:(NSString *)jsonParam webIds:(NSArray *)webIds {
	
	HRLog(@"huck");
	for (NSString *webId in webIds) {
		unsigned long long index = [webId unsignedLongLongValue];
		for (WDHPageBaseViewController *c in [self.pageStack nodes]) {
			if (c.pageModel.pageId == index) {
				NSString *js = [NSString stringWithFormat:@"HeraJSBridge.subscribeHandler('%@',%@)",eventName,jsonParam];
				[c.bridge callJS:js controller:c callback:nil];
			}
		}
	}
}

- (void)callPageConfig:(unsigned long long)webId {
	
	void(^trackLoadConfig) (WDHPageModel *model,WDHPageBaseViewController *vc) = ^(WDHPageModel *model,WDHPageBaseViewController *vc) {
		
		if (model.windowStyle != nil) {
			[vc track_renderContainer_success];
		} else {
			[vc track_open_page_failure:@"config解析window节点失败"];
		}
	};
	
	for (WDHPageBaseViewController *c in [self.pageStack nodes]) {
		if (c.pageModel.pageId == webId) {
			NSString *js = @"__wxConfig";
			[c.bridge callJS:js controller:c callback:^(id result) {
				if ([result isKindOfClass:[NSDictionary class]]) {
					[c track_renderContainer];
					[self parseConfig:result model:c.pageModel];
					trackLoadConfig(c.pageModel, c);
					
					[c loadStyle];
				}
				
			}];
		}
	}
}

- (void)switchTabbar:(NSDictionary *)itemInfo
{
    //清除了所有定时器
    [[WDHTimerJS sharedInstance] clearAllTimeout];
	HRLog(@"itemInfo:%@",itemInfo);
	NSArray *arr = self.pageStack.naviController.viewControllers;
	[arr enumerateObjectsWithOptions:NSEnumerationReverse usingBlock:^(WDHTabBarViewController  *controller, NSUInteger idx, BOOL * _Nonnull stop) {
		if ([controller isKindOfClass:[WDHTabBarViewController class]]) {
			[self.pageStack popToRoot];
			[controller switchTabBar:itemInfo[@"url"]];
			*stop = YES;
		}
	}];
}

/// 根据外部传入的配置，渲染页面容器
///
/// - Parameters:
///   - webId: page标识
///   - pageConfig: 页面配置
- (void)loadPageConfig:(unsigned long long)webId pageConfig:(NSDictionary *)pageConfig {
	
	void(^trackLoadConfig)(WDHPageModel *model,WDHPageBaseViewController *vc) = ^(WDHPageModel *model,WDHPageBaseViewController *vc){
		
		if (model.windowStyle != nil) {
			[vc track_renderContainer_success];
		} else {
			[vc track_open_page_failure:@"config解析window节点失败"];
		}
	};
	
	for (WDHPageBaseViewController *c in [self.pageStack nodes]) {
		if (c.pageModel.pageId == webId) {
			
			[c track_renderContainer];
			[self parseConfig:pageConfig[@"data"] model:c.pageModel];
			trackLoadConfig(c.pageModel,c);
			[c loadStyle];
		}
	}
}

- (NSUInteger)stackLength {
	return [self.pageStack length];
}

- (BOOL)isRootPage:(UIViewController *)page {
	if (!page || ![page isKindOfClass:WDHBaseViewController.class]) {
		return NO;
	}
	
	if (!self.rootViewController) {
		return NO;
	}
	
	return page == self.rootViewController;
}

@end

