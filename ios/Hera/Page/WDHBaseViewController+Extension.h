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


#import <Foundation/Foundation.h>
#import "WDHBaseViewController.h"

/**
 该类目的为跟踪页面的行为 输出日志
 */
@interface WDHBaseViewController(Extension)

/**
 跟踪页面打开
 */
- (void)track_open_page;

/**
 跟踪页面是否打开成功
 */
- (void)track_open_page_success;

/**
 跟踪页面打开失败

 @param error 错误信息
 */
- (void)track_open_page_failure:(NSString *)error;

/**
 跟踪页面关闭

 @param pages 关闭的页面
 */
- (void)track_close_page:(NSString *)pages;

/**
 跟踪页面是否准备
 */
- (void)track_page_ready;

/**
 跟踪页面渲染
 */
- (void)track_renderContainer;

/**
 跟踪页面渲染成功
 */
- (void)track_renderContainer_success;

/**
 跟踪页面渲染失败

 @param error 失败信息
 */
- (void)track_renderContainer_failure:(NSString *)error;

@end

