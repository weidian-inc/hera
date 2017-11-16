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


@interface WDHPageStyle : NSObject

@property (nonatomic, strong) UIColor *backgroundColor;
@property (nonatomic, strong) UIColor *navigationBarBackgroundColor;
@property (nonatomic, copy) NSString *backgroundTextStyle;
@property (nonatomic, copy) NSString * navigationBarTextStyle;
@property (nonatomic, copy) NSString * navigationBarTitleText;
@property (nonatomic, assign) BOOL enablePullDownRefresh;

@end

@interface WDHTabbarItemStyle : NSObject

@property (nonatomic, copy) NSString *title;
@property (nonatomic, copy) NSString *pagePath;
@property (nonatomic, copy) NSString *iconPath;
@property (nonatomic, copy) NSString *selectedIconPath;
@property (nonatomic, assign) BOOL isDefaultPath;

@end


@interface WDHTabbarStyle : NSObject

@property (nonatomic, copy) NSString *color;
@property (nonatomic, copy) NSString *selectedColor;
@property (nonatomic, copy) NSString *backgroundColor;
@property (nonatomic, copy) NSString *position;
@property (nonatomic, copy) NSString *borderStyle;
@property (nonatomic, copy) NSArray <WDHTabbarItemStyle *> *list;
@property (nonatomic, copy) NSString *backType;

@end



/// 页面数据模型
@interface WDHPageModel : NSObject

@property (nonatomic, assign) unsigned long long  pageId;
@property (nonatomic, copy) NSString *pageRootDir;
@property (nonatomic, strong) WDHPageStyle * pageStyle;
@property (nonatomic, strong) WDHPageStyle *windowStyle;
@property (nonatomic, strong) WDHTabbarStyle *tabbarStyle;
@property (nonatomic, copy) NSString *openType;
@property (nonatomic, copy) NSString * query;
@property (nonatomic, copy) NSString * pagePath;
@property (nonatomic, copy) NSString *backType;

- (NSString *) pathKey;
- (NSString *)wholePageUrl;
- (NSString *) pagePathUrl;

/**
 更新当前页navigationbar的title
 */
- (void)updateTitle:(NSString *)title;

/**
 解析当前web页容器的样式数据

 @param window 当前页的容器WDHBaseViewController
 */
+ (WDHPageStyle *) parseWindowStyleData:(NSDictionary *)window;

/**
 解析当前web页的样式数据

 @param pages Web页面
 @param path 页面路径
 */
+ (WDHPageStyle *)parsePageStyleData:(NSDictionary *)pages path:(NSString *)path;

@end



