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


#import "WDHPageModel.h"
#import "WDHUtils.h"


@implementation WDHTabbarItemStyle



@end

@implementation WDHTabbarStyle


@end

@implementation WDHPageStyle



@end

@implementation WDHPageModel

- (instancetype)init
{
    if (self = [super init]) {
        self.pageId = [self hash];
    }
    
    return self;
}

- (NSString *) pathKey {
    NSArray *pathArray = [_pagePath componentsSeparatedByString:@"."];
    NSString *pathKey = pathArray.firstObject;
    return pathKey;
}

- (NSString *)wholePageUrl{
    
    return [NSString stringWithFormat:@"%@/%@",self.pageRootDir,[self pagePathUrl]];
}

- (NSString *) pagePathUrl {
    NSArray *pathArray = [_pagePath componentsSeparatedByString:@"."];
    if(pathArray.count > 1) {
        return self.pagePath;
    }
    return [self.pagePath stringByAppendingString:@".html"];
}

- (void)updateTitle:(NSString *)title {
    if (self.pageStyle) {
        self.pageStyle.navigationBarTitleText = title;
    }
}

//解析Style
+ (WDHPageStyle *) parseWindowStyleData:(NSDictionary *)window {
    WDHPageStyle *model = [WDHPageStyle new];
    model.navigationBarBackgroundColor = [WDHUtils WH_Color_Conversion:window[@"navigationBarBackgroundColor"]];
    model.backgroundColor = [WDHUtils WH_Color_Conversion:window[@"backgroundColor"]];
    model.backgroundTextStyle = window[@"backgroundTextStyle"];
    model.navigationBarTextStyle = window[@"navigationBarTextStyle"];
    model.navigationBarTitleText = window[@"navigationBarTitleText"];
	model.enablePullDownRefresh =  [window[@"enablePullDownRefresh"] boolValue];
    
    return model;
}

+ (WDHPageStyle *)parsePageStyleData:(NSDictionary *)pages path:(NSString *)path {
    
    return [WDHPageModel parseWindowStyleData:pages[path]];
}

@end

