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
#import "WDHNavigationView.h"
#import "WDHPageModel.h"

@interface WDHBaseViewController : UIViewController

@property (nonatomic, strong) WDHNavigationView *naviView;

@property (nonatomic, strong) WDHPageModel *pageModel;

/**
 内存清理
 */
- (void)cleanMemory;

/**
 展示一个Toast
 
 @param mask 是否允许UserInteraction
 */
- (void)showToast:(NSString *)text mask:(BOOL)mask duration:(int)duration;

/**
 展示一个Loading

 @param mask 是否允许UserInteraction
 */
- (void)startLoading:(NSString *)text mask:(BOOL)mask;

/**
 停止Loading
 */
- (void)stopLoading;

/**
 停止下拉刷新
 */
- (void)stopPullDownRefresh;

/**
 开始下拉刷新
 */
- (void)startPullDownRefresh;

/**
 开启NavigationBar Loading
 */
- (void)startNaviLoading;

/**
 停止NavigationBar Loading
 */
- (void)hideNaviLoading;

/**
 设置NavigationBar的颜色
 
 @param frontColor 前景颜色值，包括按钮、标题、状态栏的颜色，仅支持 #ffffff 和 #000000
 @param bgColor 背景颜色值，有效值为十六进制颜色
 @param param 动画效果
 */
- (void)setNaviFrontColor:(NSString *)frontColor andBgColor:(NSString *)bgColor withAnimationParam:(NSDictionary *)param;


@end

