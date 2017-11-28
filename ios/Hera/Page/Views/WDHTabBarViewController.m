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


#import "WDHTabBarViewController.h"
#import "WDHTabBar.h"
#import "WDHNavigationView.h"
#import "WDHPageBaseViewController.h"
#import "WDHUtils.h"
#import "WDHDeviceMacro.h"
#import "WDHLog.h"

@interface WDHTabBarViewController ()

/// bar
@property (nonatomic, strong) WDHTabBar *tabbar;


@end

#define WDHTabBarViewTag 20

@implementation WDHTabBarViewController



#pragma mark - Getter & Setter

- (void)setPageModel:(WDHPageModel *)pageModel {
	self.currentController.pageModel = pageModel;
}

- (WDHPageModel *)pageModel {
	return self.currentController.pageModel;
}

- (void)setViewControllers:(NSArray *)viewControllers
{
    _viewControllers = viewControllers;
	for (UIViewController *vc in viewControllers) {
		[self addChildViewController:vc];
	}
}


#pragma mark - View Life Cycle

- (void)dealloc {
	HRLog(@"deinit WDHTabBarViewController");
}

- (void)viewDidLoad {
    [super viewDidLoad];
	
    self.view.backgroundColor = UIColor.whiteColor;

    [self createTab];
}

- (void)viewDidLayoutSubviews{
	[super viewDidLayoutSubviews];
	
	CGFloat w = self.view.bounds.size.width;
	CGFloat h = self.view.bounds.size.height;
	CGFloat naviHeight = CGRectGetMaxY(self.naviView.frame);
	
	//tabbar的frame
	CGRect tabbarFrame = CGRectZero;
	if (self.tabbar) {
		if (self.tabbar.positionStyle == WDHTabBarStyleTop) {
			tabbarFrame = (CGRect){0,naviHeight,w,49};
		}else {
			CGFloat tabbarHeight = IS_IPHONE_X ? 83 : 49;
			tabbarFrame = (CGRect){0,h - self.tabbar.wdh_view.bounds.size.height,w,tabbarHeight};
		}
		
		self.tabbar.wdh_view.frame = tabbarFrame;
	}
	
	UIView *vc = [self.view viewWithTag:WDHTabBarViewTag];
	CGFloat webViewTop = self.naviView.bounds.size.height;
	if (!CGRectEqualToRect(tabbarFrame, CGRectZero)) {
		if (self.tabbar.positionStyle == WDHTabBarStyleTop) {
			webViewTop = CGRectGetMaxY(tabbarFrame);
		}
	}
	
	vc.frame = (CGRect){0,webViewTop,w,h-naviHeight-tabbarFrame.size.height};
}

- (void)createTab
{
    WDHTabbarStyle *style = self.tabbarStyle;
    _tabbar = [[WDHTabBar alloc] init];
    UIView *view = [_tabbar generateWDHTabbarWithPoistion:style.position];
    _tabbar.color = style.color;
    _tabbar.selectedColor = style.selectedColor;
    _tabbar.backgroundColor = style.backgroundColor;
    _tabbar.borderStyle = style.borderStyle;
    [_tabbar configTabbarItemList:style.list];
    [self.view addSubview:view];
    
    __weak typeof(self) weak_self = self;
    [_tabbar didTapItem:^(NSString *pagePath, NSUInteger pageIndex) {
        [weak_self startPage:pagePath pageIndex:pageIndex];
    }];
    [_tabbar didInitDefaultItem:^(NSString *pagePath, NSUInteger pageIndex) {
        [weak_self startRootPage:pagePath pageIndex:pageIndex];
    }];
    
    [self.tabbar showDefaultTabarItem];
}


#pragma mark - Load Data
- (void)loadTabStyle
{
    [self createTab];
}

- (void)loadStyle:(WDHPageModel *)pageModel
{
    //window 样式
	self.naviView.leftButton.hidden = pageModel.pageStyle.disableNavigationBack;
    
    if (pageModel.pageStyle.navigationBarTitleText) {
        self.naviView.title = pageModel.pageStyle.navigationBarTitleText;
    }
    if (pageModel.pageStyle.navigationBarTitleText ) {
        self.naviView.title = pageModel.pageStyle.navigationBarTitleText;
    } else if (pageModel.windowStyle.navigationBarTitleText) {
        self.naviView.title = pageModel.windowStyle.navigationBarTitleText;
    }
    
    if (pageModel.pageStyle.navigationBarBackgroundColor) {
        self.naviView.backgroundColor = pageModel.pageStyle.navigationBarBackgroundColor;
    } else if (pageModel.windowStyle.navigationBarBackgroundColor) {
        self.naviView.backgroundColor = pageModel.windowStyle.navigationBarBackgroundColor;
    }
    
    
    NSString *backgroundTextStyle;
    if (pageModel.pageStyle.backgroundTextStyle) {
        backgroundTextStyle = pageModel.pageStyle.backgroundTextStyle;
    } else if (pageModel.windowStyle.backgroundTextStyle) {
        backgroundTextStyle = pageModel.windowStyle.backgroundTextStyle;
    }
    
    
    NSString *navigationBarTextStyle;
    if (pageModel.pageStyle.navigationBarTextStyle) {
        navigationBarTextStyle = pageModel.pageStyle.navigationBarTextStyle;
    } else if (pageModel.windowStyle.navigationBarTextStyle) {
        navigationBarTextStyle = pageModel.windowStyle.navigationBarTextStyle;
    }
    
    if (navigationBarTextStyle != nil ) {
        if  ([navigationBarTextStyle isEqualToString:@"black"])  {
            self.naviView.titleLabel.textColor = [UIColor blackColor];
            self.naviView.leftButton.tintColor = [UIColor blackColor];
            self.naviView.rightButton.tintColor = [UIColor blackColor];
        } else {
            self.naviView.titleLabel.textColor = UIColor.whiteColor;
            self.naviView.leftButton.tintColor = [UIColor whiteColor];
            self.naviView.rightButton.tintColor = [UIColor whiteColor];
        }
    }
}

#pragma mark - 页面管理

- (void)startRootPage:(NSString *)pagePath pageIndex:(NSUInteger)pageIndex
{
    if(self.childViewControllers.count <= pageIndex) {
        return;
    }
    [[self.view viewWithTag:WDHTabBarViewTag] removeFromSuperview];
    WDHPageBaseViewController *vc = self.childViewControllers[pageIndex];
    vc.view.tag = WDHTabBarViewTag;
    vc.pageModel.openType = @"appLaunch";
    [self loadStyle:vc.pageModel];
    [self.view addSubview:vc.view];
	
    _currentController = vc;
}

- (void)startPage:(NSString *)pagePath pageIndex:(NSUInteger)pageIndex
{
    if(self.childViewControllers.count <= pageIndex) {
        return;
    }
    HRLog(@"<switchTap>----->startPage:%lu",(unsigned long)pageIndex);
    [_currentController viewWillDisappear:YES];
    [_currentController viewDidDisappear:YES];
    
    [[self.view viewWithTag:WDHTabBarViewTag] removeFromSuperview];
    WDHPageBaseViewController *vc = self.childViewControllers[pageIndex];
    vc.view.tag = WDHTabBarViewTag;
    vc.pageModel.openType = @"switchTab";
    vc.pageModel.backType = @"switchTab";
    [self loadStyle:vc.pageModel];
    [self.view addSubview:vc.view];
    
    _currentController = vc;
}

- (void)switchTabBar:(NSString *)pagePath
{
    for (int i = 0; i < self.childViewControllers.count; i++)
    {
        WDHPageBaseViewController *vc = self.childViewControllers[i];
        if ([vc isKindOfClass:[WDHPageBaseViewController class]]) {
            if ([pagePath isEqualToString:vc.pageModel.pagePath] || [pagePath isEqualToString:[vc.pageModel.pagePath stringByAppendingString:@".html"]]) {
                [self.tabbar selectItemAtIndex:i];
            }
        }
    }
}

#pragma mark - Loading

- (void)showToast:(NSString *)text mask:(BOOL)mask duration:(int)duration {
	[self.currentController showToast:text mask:mask duration:duration];
}

- (void)startLoading:(NSString *)text mask:(BOOL)mask {
	[self.currentController startLoading:text mask:mask];
}

- (void)stopLoading {
	[self.currentController stopLoading];
}

#pragma mark - 下拉刷新

- (void)startPullDownRefresh {
	[self.currentController startPullDownRefresh];
}

- (void)stopPullDownRefresh {
	[self.currentController stopPullDownRefresh];
}

#pragma mark - NavigationBar

- (void)setNaviFrontColor:(NSString *)frontColor andBgColor:(NSString *)bgColor withAnimationParam:(NSDictionary *)param {
	[self.naviView setNaviFrontColor:frontColor andBgColor:bgColor withAnimationParam:param];
	
	if ([frontColor isEqualToString:@"#000000"]) {
		self.currentController.pageModel.pageStyle.navigationBarTextStyle = @"black";
	} else {
		self.currentController.pageModel.pageStyle.navigationBarTextStyle = @"white";
	}
	
	self.currentController.pageModel.pageStyle.navigationBarBackgroundColor = [WDHUtils WH_Color_Conversion:bgColor];

}

@end

