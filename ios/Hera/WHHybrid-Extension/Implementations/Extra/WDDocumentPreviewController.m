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


#import "WDDocumentPreviewController.h"
#import <WebKit/WebKit.h>

@interface WDDocumentPreviewController () <WKNavigationDelegate>

// 资源url
@property (nonatomic, copy) NSURL *url;

@property (nonatomic, strong) WKWebView *webView;
@property (nonatomic, weak) UIActivityIndicatorView *activityView;

@end

@implementation WDDocumentPreviewController

- (instancetype)initWithUrl:(NSURL *)url {
    
    if (self = [super init]) {
        _url = url;
    }
    
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    
    CGRect webFrame = {0, 0, UIScreen.mainScreen.bounds.size.width, UIScreen.mainScreen.bounds.size.height};
    _webView = [[WKWebView alloc] initWithFrame:webFrame];
    _webView.navigationDelegate = self;
    [self.view addSubview:_webView];
    [_webView loadFileURL:self.url allowingReadAccessToURL:self.url];
    
    UIActivityIndicatorView *activityView = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleGray];
    activityView.center = _webView.center;
    [self.view addSubview:activityView];
    self.activityView = activityView;
    
    UITapGestureRecognizer *tap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(tappedOnWebView)];
    [self.webView addGestureRecognizer:tap];
    [self.webView setUserInteractionEnabled:YES];
    
    UIBarButtonItem *doneItem = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemDone target:self action:@selector(tappedOnDoneBarItem)];
    self.navigationItem.leftBarButtonItem = doneItem;
    
    self.title = @"文件预览";
    
    [activityView startAnimating];
}

#pragma mark - User Interaction

- (void)tappedOnDoneBarItem {
    [self dismissViewControllerAnimated:YES completion:nil];
}


- (void)tappedOnWebView {
    BOOL isHidden = self.navigationController.navigationBar.isHidden;
    [self.navigationController setNavigationBarHidden:!isHidden animated:YES];
}

#pragma mark - WKNavigationDelegate

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
    [_activityView stopAnimating];
    [_activityView removeFromSuperview];
    _activityView = nil;
}

@end

