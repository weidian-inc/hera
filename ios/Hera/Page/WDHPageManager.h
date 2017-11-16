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


#import <UIKit/UIKit.h>
#import "WDHManagerProtocol.h"
#import "WDHPageManagerProtocol.h"

@class WDHBaseViewController;
@class WDHPageBaseViewController;

@interface WDHPageStack : NSObject

@property (nonatomic, assign) NSUInteger initialIndex;

@property (nonatomic, strong) UINavigationController *naviController;

/**
 获取小程序栈顶控制器
 
 @return 小程序栈顶控制器
 */
- (WDHBaseViewController *)top;

/**
 获取小程序当前显示的页面

 @return 小程序当前显示的页面控制器
 */
- (WDHPageBaseViewController *)currentPage;

@end

/*
 被WHManager强持有，弱引用WHManager
 */
/// 页面管理者
@interface WDHPageManager : NSObject <WDHPageManagerProtocol>

@property (nonatomic, strong) WDHPageStack *pageStack;

@property (nonatomic, weak) id <WDHManagerProtocol> whManager;

/// config
@property (nonatomic, strong) NSDictionary *config;

/**
 开启页面

 @param basePath 页面根目录路径
 @param pagePath 页面路径
 @param isRoot 是否为根页面
 */
- (void)startPage:(NSString *)basePath pagePath:(NSString *)pagePath isRoot:(BOOL)isRoot;

/**
 开启页面

 @param basePath 页面根目录路径
 @param pagePath 页面路径
 @param openNewPage 是否开启新页 YES:Push新的ViewController NO:当前Web页面跳转
 */
- (void)startPage:(NSString *)basePath pagePath:(NSString *)pagePath openNewPage:(BOOL)openNewPage;

- (void)startPage:(NSString *)basePath pagePath:(NSString *)pagePath isRoot:(BOOL)isRoot openNewPage:(BOOL)openNewPage;

/**
 开启Tab类型的页面

 @param config 页面配置
 @param basePath 页面根目录拒绝
 @param defaultPagePath 默认页面路径
 */
- (void)startTabarPage:(NSDictionary *)config basePath:(NSString *)basePath defaultPagePath:(NSString *)defaultPagePath;

/**
 加载页面配置

 @param webId 页面ID
 @param pageConfig 页面配置信息
 */
- (void)loadPageConfig:(unsigned long long)webId pageConfig:(NSDictionary *)pageConfig;

/**
 获取小程序页面栈长

 @return 小程序页面栈长
 */
- (NSUInteger)stackLength;

/**
 跳转到某一页
 */
- (void)gotoPageAtIndex:(NSUInteger)existPageId ;

/**
 切换Tab

 @param itemInfo tab的info信息
 */
- (void)switchTabbar:(NSDictionary *)itemInfo;

/**
 设置当前页面Title
 */
- (void)setTopPageTitle:(NSString *)title;

/**
 ViewWillAppear时 激活页面
 */
- (void)activePageWillAppear:(WDHPageBaseViewController *)vc;
- (void)activePageDidDisappear:(WDHPageBaseViewController *)vc;
- (void)activePageDidAppear:(WDHPageBaseViewController *)vc;

/**
 设置NavigationController
 */
- (void)setupWithNaviController:(UINavigationController *)naviController;

/**
 重置NavigationBar隐藏属性
 */
- (void)resetNavigationBarHidden;

@end

