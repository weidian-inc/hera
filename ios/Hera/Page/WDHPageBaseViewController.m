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


#import "WDHPageBaseViewController.h"
#import "WDHBaseViewController+Extension.h"
#import "WDHLoadingView.h"
#import "WDHNavigationView.h"
#import "WDHToastView.h"
#import "WDHScriptMessageHandlerDelegate.h"
#import "WDHUtils.h"
#import "WDHTabBar.h"
#import "WDHDeviceMacro.h"
#import <MJRefresh/MJRefresh.h>

@interface WDHPageBaseViewController ()<WKScriptMessageHandler,UIWebViewDelegate,WKUIDelegate,WKNavigationDelegate>

@property (nonatomic, assign) BOOL isBack;
@property (nonatomic, assign) BOOL isFirstViewAppear;
@end

@implementation WDHPageBaseViewController

#pragma mark - View Life Cycle

- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.isBack = NO;
    self.isFirstViewAppear = YES;
    self.view.backgroundColor = UIColor.whiteColor;
    self.navigationItem.hidesBackButton = YES;
    
    if (!_isTabBarVC) {
        self.naviView = [[WDHNavigationView alloc] initWithFrame:CGRectZero];
        
        __weak typeof(self) weak_self = self;
        [self.naviView setLeftClick:^(WDHNavigationView *view){
            if (weak_self.pageManager) {
                [weak_self.pageManager pop];
            }
        }];
        [self.view addSubview:self.naviView];
    }
	
	WDHWeakScriptMessageDelegate *scriptMessageDelegate = [WDHWeakScriptMessageDelegate new];
	scriptMessageDelegate.scriptDelegate = self;
	
	WKUserContentController *userContentController = [WKUserContentController new];
	[userContentController addScriptMessageHandler:scriptMessageDelegate name:@"invokeHandler"];
	[userContentController addScriptMessageHandler:scriptMessageDelegate name:@"publishHandler"];

	WKWebViewConfiguration *wkWebViewConfiguration = [WKWebViewConfiguration new];
	wkWebViewConfiguration.userContentController = userContentController;
	
	self.webView = [[WKWebView alloc] initWithFrame:self.view.bounds configuration:wkWebViewConfiguration];
	self.webView.UIDelegate = self;
	self.webView.navigationDelegate = self;
	[self.view addSubview:self.webView];
    
    [self loadData];
	
    NSLog(@"<page>: did load");
}


- (void)refresh{
	[self.webView reload];
}

- (void)dealloc {
    NSLog(@"deinit WDHPageBaseViewController");
    [self cleanMemory];
}

- (void)cleanMemory {

}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
	
	[self.navigationController setNavigationBarHidden:YES animated:YES];
	
    [self.pageManager activePageWillAppear:self];
    [self loadStyle];
	
    NSLog(@"<page>: viewWillAppear");
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
	
	//如果为根页面 禁止手势返回 防止手势过程中调用了系统pop方法 导致小程序退出
	if ([self.pageManager isRootPage:self] || [self.pageManager isRootPage:self.parentViewController]) {
		self.navigationController.interactivePopGestureRecognizer.enabled = NO;
	} else {
		self.navigationController.interactivePopGestureRecognizer.enabled = YES;
	}
	
    if (!_isFirstViewAppear) {
        
        [self.pageManager activePageDidAppear:self];
    }else {
        _isFirstViewAppear = NO;
    }
    
    self.isBack = true;
	
    [WDHLoadingView startAnimationInView:self.view];
	
    NSLog(@"<page>: viewDidAppear");
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
}

- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
    [self.pageManager activePageDidDisappear:self];
	
	// 防止收不到stopRefresh事件而造成下拉刷新不停止的情况
	if(self.webView.scrollView.mj_header.isRefreshing) {
		[self.webView.scrollView.mj_header endRefreshing];
	}
	
	[WDHLoadingView stopAnimationInView:self.view];
}

- (void)viewDidLayoutSubviews{
    [super viewDidLayoutSubviews];
    
    CGFloat w = self.view.bounds.size.width;
    CGFloat h = self.view.bounds.size.height;
    CGFloat webViewTop = 0.0;
    CGFloat naviHeight = 0.0;
    if (!_isTabBarVC) {
		naviHeight = IS_IPHONE_X ? 88 : 64;

        self.naviView.frame = (CGRect){0,0,w,naviHeight};
        webViewTop = self.naviView.frame.origin.y + self.naviView.frame.size.height;
    }
	
	self.webView.frame = (CGRect){0,webViewTop,w,h-naviHeight};
}

#pragma mark - Load Data

- (void)loadData {
	
	if (!self.pageModel.pagePath || [self.pageModel.pagePath isEqualToString:@"tabBar"]) {
		return;
	}
	
	[self track_open_page];
	
	NSString *url = [self.pageModel wholePageUrl];
	NSURL *baseUrl = [NSURL fileURLWithPath:self.pageModel.pageRootDir];
	
	NSArray *urlWithQueryArray = [url componentsSeparatedByString:@"?"];
	NSError *error = nil;
	NSString *html = [[NSString alloc] initWithContentsOfURL:[NSURL fileURLWithPath:urlWithQueryArray.firstObject] encoding:NSUTF8StringEncoding error:&error];
	if (html) {
		[self.webView loadHTMLString:html baseURL:baseUrl];
	}else {
		NSLog(@"%@", error.localizedDescription);
		[self track_open_page_failure:error.localizedDescription];
	}
}

- (void)loadStyle{
	if (!self.pageModel) {
		return;
	}
	
	//非tabbar中作为childVC存在
	if (!self.isTabBarVC) {
		//window 样式
		if (self.pageModel.pageStyle.navigationBarTitleText) {
			self.naviView.title = self.pageModel.pageStyle.navigationBarTitleText;
		}
		if (self.pageModel.pageStyle.navigationBarTitleText ) {
			self.naviView.title = self.pageModel.pageStyle.navigationBarTitleText;
		} else if (self.pageModel.windowStyle.navigationBarTitleText) {
			self.naviView.title = self.pageModel.windowStyle.navigationBarTitleText;
		}
		
		if (self.pageModel.pageStyle.navigationBarBackgroundColor) {
			self.naviView.backgroundColor = self.pageModel.pageStyle.navigationBarBackgroundColor;
		} else if (self.pageModel.windowStyle.navigationBarBackgroundColor) {
			self.naviView.backgroundColor = self.pageModel.windowStyle.navigationBarBackgroundColor;
		}
		
		NSString *backgroundTextStyle;
		if (self.pageModel.pageStyle.backgroundTextStyle) {
			backgroundTextStyle = self.pageModel.pageStyle.backgroundTextStyle;
		} else if (self.pageModel.windowStyle.backgroundTextStyle) {
			backgroundTextStyle = self.pageModel.windowStyle.backgroundTextStyle;
		}
		
		
		NSString *navigationBarTextStyle;
		if (self.pageModel.pageStyle.navigationBarTextStyle) {
			navigationBarTextStyle = self.pageModel.pageStyle.navigationBarTextStyle;
		} else if (self.pageModel.windowStyle.navigationBarTextStyle) {
			navigationBarTextStyle = self.pageModel.windowStyle.navigationBarTextStyle;
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
	
	
	if (self.pageModel.pageStyle.backgroundColor) {
		self.webView.scrollView.backgroundColor = self.pageModel.pageStyle.backgroundColor;
	} else if (self.pageModel.windowStyle.backgroundColor) {
		self.webView.scrollView.backgroundColor = self.pageModel.windowStyle.backgroundColor;
	}
	
	if (self.pageModel.pageStyle.enablePullDownRefresh) {
		self.webView.scrollView.mj_header = [MJRefreshNormalHeader headerWithRefreshingTarget:self refreshingAction:@selector(onRefreshHeaderPullDown)];
	} else {
		self.webView.scrollView.mj_header = nil;
	}
}

#pragma mark - Loading

- (void)startLoading:(NSString *)text mask:(BOOL)mask {
	[WDHLoadingView showInView:self.view text:text mask:mask];
}

- (void)stopLoading{
	[WDHLoadingView hideInView:self.view];
}

- (void)showToast:(NSString *)text mask:(BOOL)mask duration:(int)duration {
	if (text) {
		[WDHToastView showInView:self.view text:text mask:mask duration:duration];
	}
}


- (void)hideToast{
	
}

#pragma mark - 下拉刷新

- (void)onRefreshHeaderPullDown {
	[[NSNotificationCenter defaultCenter] postNotificationName:@"onPullDownRefresh" object:@(self.pageModel.pageId)];
}

- (void)stopPullDownRefresh {
	[self.webView.scrollView.mj_header endRefreshing];
}

- (void)startPullDownRefresh {
	[self.webView.scrollView.mj_header beginRefreshing];
}

#pragma mark - Navigation Bar

- (void)setNaviFrontColor:(NSString *)frontColor andBgColor:(NSString *)bgColor withAnimationParam:(NSDictionary *)param {
	[self.naviView setNaviFrontColor:frontColor andBgColor:bgColor withAnimationParam:param];
	
	if ([frontColor isEqualToString:@"#000000"]) {
		self.pageModel.pageStyle.navigationBarTextStyle = @"black";
	} else {
		self.pageModel.pageStyle.navigationBarTextStyle = @"white";
	}
	
	self.pageModel.pageStyle.navigationBarBackgroundColor = [WDHUtils WH_Color_Conversion:bgColor];
}


//MARK: - wk js message handler
- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message
{
    NSString *name = message.name;
    id body = message.body;
	
    if ([self.bridge respondsToSelector:@selector(onReceiveJSMessage:body:controller:)]) {
        [self.bridge onReceiveJSMessage:name body:body controller:self];
    }
}

//MARK: - WKNavigationDelegate
- (void)webView:(WKWebView *)webView didStartProvisionalNavigation:(null_unspecified WKNavigation *)navigation
{
    NSLog(@"<page>WEBVIEW START");
}

- (void)webView:(WKWebView *)webView decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler{
    if (navigationAction.navigationType == WKNavigationTypeLinkActivated) {
        decisionHandler(WKNavigationActionPolicyCancel);
    } else {
        decisionHandler(WKNavigationActionPolicyAllow);
    }
}


//MARK: - WKUIDelegate
- (void)webView:(WKWebView *)webView runJavaScriptAlertPanelWithMessage:(NSString *)message initiatedByFrame:(WKFrameInfo *)frame completionHandler:(void (^)(void))completionHandler
{
    // WKWebView不支持JS的alert 用此方法进行拦截
    // message为JS中alert显示的信息 可与前端开发约定好信息
    if ([self.bridge respondsToSelector:@selector(onReceiveJSAlert:)]) {
        [self.bridge onReceiveJSAlert:message];
    }
    completionHandler();
}

- (void)webView:(WKWebView *)webView runJavaScriptConfirmPanelWithMessage:(NSString *)message initiatedByFrame:(WKFrameInfo *)frame completionHandler:(void (^)(BOOL))completionHandler
{
    // 类比alert 拦截JS confirm
    completionHandler(NO);
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
    [self track_open_page_success];
}

- (void)webView:(WKWebView *)webView didFailNavigation:(WKNavigation *)navigation withError:(NSError *)error
{
    [self track_open_page_failure:error.localizedDescription];
}

@end

