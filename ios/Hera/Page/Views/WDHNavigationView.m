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


#import "WDHNavigationView.h"
#import "WDHUtils.h"
#import "WDHDeviceMacro.h"
#import "WDHBundleUtil.h"

@interface WDHNavigationView()

@property (nonatomic, weak) UIActivityIndicatorView *activityView;  //指向当前的菊花图


@end

@implementation WDHNavigationView

- (void)setTitle:(NSString *)title
{
    _title = title;
    self.titleLabel.text = _title;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame])
    {
//        self.leftButton = [UIButton buttonWithType:UIButtonTypeCustom];
//        self.rightButton = [UIButton buttonWithType:UIButtonTypeCustom];
        // 使用system的修改tintColor才能起作用
        self.leftButton = [UIButton buttonWithType:UIButtonTypeSystem];
        self.rightButton = [UIButton buttonWithType:UIButtonTypeSystem];
        self.titleLabel = [UILabel new];
        
        [self addSubview:self.leftButton];
        [self addSubview:self.rightButton];
        [self addSubview:self.titleLabel];

        self.titleLabel.textColor = UIColor.whiteColor;
        
        self.leftButton.tintColor = [UIColor whiteColor];
        self.rightButton.tintColor = [UIColor whiteColor];
        
        UIImage *img = [WDHBundleUtil imageFromBundleWithName:@"WDIPh_btn_navi_back"];
        [self.leftButton setImage:img forState:UIControlStateNormal];
        //        self.leftButton.imageEdgeInsets = UIEdgeInsets(top:0,left:10,bottom:0,right:0)
        self.titleLabel.textAlignment = NSTextAlignmentCenter;
        SEL leftAction = @selector(leftButtonAction:);
        SEL rightAction = @selector(rightButtonAction:);
        [self.leftButton addTarget:self action:leftAction forControlEvents:UIControlEventTouchUpInside];
        
        //MARK:------->TEST:------>
        //        self.rightButton.setTitle("SX", for: UIControlState.normal)
        [self.leftButton addTarget:self action:rightAction forControlEvents:UIControlEventTouchUpInside];
    }
    
    return self;
}

- (void)layoutSubviews{
    [super layoutSubviews];

    CGFloat w = self.bounds.size.width;
    CGFloat h = self.bounds.size.height;
	CGFloat controlTop =  IS_IPHONE_X ? 44.0 : 20.0;
    CGFloat controlHeight = h - controlTop;
    CGFloat btnWidth = h;
    self.leftButton.frame = (CGRect){0,controlTop,btnWidth,controlHeight};
//    self.titleLabel.frame = (CGRect){btnWidth,controlTop,w-2*btnWidth,controlHeight};
    self.rightButton.frame = (CGRect){w-btnWidth,controlTop,btnWidth,controlHeight};
    
    // activityView 宽高默认为20
    if (self.activityView) {
        CGSize textSize = [_titleLabel.text sizeWithAttributes:@{NSFontAttributeName:[_titleLabel font]}];
        CGFloat activityX = (w / 2) - (textSize.width / 2) - 10;
        if (textSize.width > self.titleLabel.bounds.size.width) {
            activityX = btnWidth;
        }
        
        self.activityView.frame = (CGRect){activityX,0,20,20};
        // 与titleLabel保持在同一水平线上
        self.activityView.center = CGPointMake(self.activityView.center.x, self.titleLabel.center.y);
        self.titleLabel.frame = (CGRect){btnWidth + 20,controlTop,w-2*btnWidth,controlHeight};
        
    } else {
        self.titleLabel.frame = (CGRect){btnWidth,controlTop,w-2*btnWidth,controlHeight};
    }
}

#pragma mark - User Interaction

- (void)leftButtonAction:(UIButton *)btn {
    if (self.leftClick) {
        self.leftClick(self);
    }
}

- (void)rightButtonAction:(UIButton *)btn {
    if (self.rightClick) {
        self.rightClick(self);
    }
}


#pragma mark - Public

- (void)startLoadingAnimation {
    // 防止重复
    if (self.activityView) {
        if (!self.activityView.isAnimating) {
            [self.activityView startAnimating];
        }
        return;
    }
    
    UIActivityIndicatorView *activityView = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhite];
    activityView.color = self.titleLabel.textColor;
    [self addSubview:activityView];
    self.activityView = activityView;
    [self layoutIfNeeded];
    
    [self.activityView startAnimating];
}

- (void)hideLoadingAnimation {
    if (self.activityView) {
        [self.activityView stopAnimating];
        [self.activityView removeFromSuperview];
        self.activityView = nil;
    }
}

- (void)setNaviFrontColor:(NSString *)frontColor andBgColor:(NSString *)bgColor withAnimationParam:(NSDictionary *)param {
    
    UIViewAnimationOptions option;
    NSString *timingFunc = param[@"timingFunc"];
    if (!timingFunc) {
        option = UIViewAnimationOptionCurveLinear;
    } else if ([timingFunc isEqualToString:@"easeIn"]) {
        option = UIViewAnimationOptionCurveEaseIn;
    } else if ([timingFunc isEqualToString:@"easeOut"]) {
        option = UIViewAnimationOptionCurveEaseOut;
    } else if ([timingFunc isEqualToString:@"easeInOut"]) {
        option = UIViewAnimationOptionCurveEaseInOut;
    } else {
        option = UIViewAnimationOptionCurveLinear;
    }
    
    // 此处为毫秒 需要转换
    NSTimeInterval duration = [param[@"duration"] integerValue] / 1000.0;
    
    [UIView animateWithDuration: duration delay:0.0 options:option animations:^{
        // front color
        self.titleLabel.textColor = [WDHUtils WH_Color_Conversion:frontColor];
        self.activityView.color = [WDHUtils WH_Color_Conversion:frontColor];
        self.leftButton.tintColor = [WDHUtils WH_Color_Conversion:frontColor];
        self.rightButton.tintColor = [WDHUtils WH_Color_Conversion:frontColor];
        
        // background color
        self.backgroundColor = [WDHUtils WH_Color_Conversion:bgColor];
    } completion:^(BOOL finished) {
        
    }];
    
}


@end

