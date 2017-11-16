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


#import "WDHToastView.h"
#import "WDHUtils.h"

@interface WDHToastView ()

@property (nonatomic, strong) UILabel *label;
@property (nonatomic, strong) UIImageView *iconView;
@property (nonatomic, copy) NSString *text;

@end

@implementation WDHToastView

- (void)setText:(NSString *)text
{
    _text = text;
    self.label.text = text;
}

- (void)drawRect:(CGRect)rect
{
    UIBezierPath *path = [UIBezierPath bezierPathWithRoundedRect:self.bounds cornerRadius:10];
    [[UIColor colorWithWhite:0 alpha:0.8] set];
    [path fill];
}

+ (UIFont *)kTextFont
{
    return [UIFont systemFontOfSize:12];
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        
        _label = [UILabel new];
        _label.font = [WDHToastView kTextFont];
        _label.textColor = [UIColor whiteColor];
        _label.textAlignment = NSTextAlignmentCenter;
        _label.numberOfLines = 0;
        //icon 待定
        //        iconView = UIImageView()
        
        self.backgroundColor = [UIColor clearColor];
        [self addSubview:_label];
    }
    
    return self;
}

- (void) layoutSubviews {
    
    [super layoutSubviews];
    
    CGFloat w = self.bounds.size.width;
    CGFloat h = self.bounds.size.height;
    
    self.label.frame = (CGRect){10,10,w-20,h-20};
}

+ (void) showInView:(UIView *)view text:(NSString *)text mask:(BOOL)mask duration:(int)duration {
    
    CGFloat maxWidth = view.frame.size.width * 0.75;
    
    CGFloat width = [WDHUtils getTextSize:text font:[WDHToastView kTextFont]].width + 30;
    CGFloat w = width;
    
    if (width > maxWidth) {
        w = maxWidth;
    }
    CGFloat h = [WDHUtils getTextHeight:text font:[WDHToastView kTextFont] width:w] + 30;
    
    CGFloat left = (view.frame.size.width - w)/2;
    left = (CGFloat)(ceilf((CGFloat)left));
    
    CGFloat top = (view.frame.size.height - h)/2;
    top = (CGFloat)(ceilf((CGFloat)top));
    
    if (mask) {
        view.userInteractionEnabled = mask;
    }
    
    WDHToastView *toast = [[WDHToastView alloc] initWithFrame:(CGRect){left,top,w,h}];
    toast.text = text;
    [view addSubview:toast];
    toast.alpha = 0;
    [UIView animateWithDuration:0.15 animations:^{
        toast.alpha = 1;
    } completion:^(BOOL finished) {
        CGFloat sec = (float)duration / 1000;
        
        __weak typeof(self) weak_self = self;
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(sec * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            [weak_self hideToast:toast inView:view];
        });

    }];

}

+ (void) hideToast:(WDHToastView *)toast inView:(UIView *)inView {
    [UIView animateWithDuration:0.15 animations:^{
        toast.alpha = 0;
    } completion:^(BOOL finished) {
        [toast removeFromSuperview];
    }];

    inView.userInteractionEnabled = true;
}

@end

