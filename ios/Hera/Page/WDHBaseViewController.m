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


#import "WDHBaseViewController.h"
#import "WDHDeviceMacro.h"
#import "WDHSystemConfig.h"

@interface WDHBaseViewController ()<UIGestureRecognizerDelegate>

@end

@implementation WDHBaseViewController


#pragma mark - Life Cycle

- (void)viewDidLoad {
    [super viewDidLoad];
	
	if (!self.navigationController.isNavigationBarHidden) {
		[self.navigationController setNavigationBarHidden:YES animated:YES];
	}
    
    //导航条
    __weak typeof(self) weak_self = self;
    CGFloat naviHeight = IS_IPHONE_X ? 88 : 64;
    self.naviView = [[WDHNavigationView alloc] initWithFrame:(CGRect){0,0,self.view.bounds.size.width,naviHeight}];
    
    [self.naviView setLeftClick:^(WDHNavigationView *view){
        if (weak_self.pageManager) {
            [weak_self.pageManager pop];
        }
    }];
    [self.view addSubview:self.naviView];
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
    
    //是否开启系统手势返回
    if ([[WDHSystemConfig sharedConfig] enablePopGesture]) {
        self.navigationController.interactivePopGestureRecognizer.delegate = self;
        self.navigationController.interactivePopGestureRecognizer.enabled = YES;
    } else {
        self.navigationController.interactivePopGestureRecognizer.enabled = NO;
    }
}

#pragma mark - Loading

/// 子类实现
- (void)showToast:(NSString *)text mask:(BOOL)mask duration:(int)duration {

}

/// 子类实现
- (void)startLoading:(NSString *)text mask:(BOOL)mask {
	
}

/// 子类实现
- (void)stopLoading {

}

#pragma mark - 下拉刷新

/// 子类实现
- (void)stopPullDownRefresh {

}

/// 子类实现
- (void)startPullDownRefresh {

}

#pragma mark - NavigationBar


- (void)startNaviLoading {
	[self.naviView startLoadingAnimation];
}


- (void)hideNaviLoading {
	[self.naviView hideLoadingAnimation];
}

/// 子类实现
- (void)setNaviFrontColor:(NSString *)frontColor andBgColor:(NSString *)bgColor withAnimationParam:(NSDictionary *)param {

}

#pragma mark - 内存清理

/// 子类实现
- (void)cleanMemory {
	
}

@end

