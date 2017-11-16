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


#import "WDHLoadingView.h"
#import "WDHBundleUtil.h"

@interface WDHLoadingView ()

@property (nonatomic, strong) UIImageView *indicator;
@property (nonatomic, strong) UIImageView *rotateImageView;
@property (nonatomic, strong) UILabel * loadingLabel;
@property (nonatomic, copy)  NSString *loadingText;

@end

@implementation WDHLoadingView

static NSMutableArray *loadingQueue = nil;

+ (void)initialize {
	if (!loadingQueue) {
		loadingQueue = [NSMutableArray array];
	}
}

- (void)setLoadingText:(NSString *)loadingText
{
    _loadingText = loadingText;
    self.loadingLabel.text = loadingText;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
		UIImage *indicatorImage = [WDHBundleUtil imageFromBundleWithName:@"WDIPh_common_activitor_loading_icon_white"];
        _indicator = [[UIImageView alloc] initWithImage:indicatorImage];
        
		UIImage *rotateImage = [WDHBundleUtil imageFromBundleWithName:@"WDIPh_common_activitor_outter_cycle_white"];
        _rotateImageView = [[UIImageView alloc] initWithImage:rotateImage];
        
        _loadingLabel = [UILabel new];
        _loadingLabel.font = [UIFont systemFontOfSize:11.5];
        _loadingLabel.textColor = [UIColor whiteColor];
        _loadingLabel.textAlignment = NSTextAlignmentCenter;
        
        [self addSubview:_indicator];
        [self addSubview:_rotateImageView];
        [self addSubview:_loadingLabel];
        
        self.backgroundColor = [UIColor clearColor];
    }
    
    return self;
}

- (void) layoutSubviews {
    [super layoutSubviews];
    
    CGFloat w = self.bounds.size.width;
    CGFloat h = self.bounds.size.height;
    
    CGFloat offset = 0;
    if (self.loadingText) {
        offset = 8;
    }
    
    self.indicator.frame = (CGRect){0,0,19,16};
    self.rotateImageView.frame = (CGRect){0,0,34,34};
    self.rotateImageView.center = (CGPoint){w*0.5,h*0.5-offset};
    self.indicator.center = self.rotateImageView.center;
    
    CGFloat labelTop = self.rotateImageView.frame.origin.y + self.rotateImageView.frame.size.height + 2;
    self.loadingLabel.frame = (CGRect){0,labelTop,w,20};
}

// Only override draw() if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
 - (void) drawRect:(CGRect)rect {
    // Drawing code
     UIBezierPath *path = [UIBezierPath bezierPathWithRoundedRect:self.bounds cornerRadius:10];
     [[UIColor colorWithWhite:0 alpha:0.6] set];
     [path fill];
}

+ (void) stopAnimationInView:(UIView *)view {
	WDHLoadingView *loadingView = [view viewWithTag:kLoaddingViewTagId];
	if (loadingView) {
		if ([loadingView.rotateImageView.layer animationForKey:@"rotationAnimation"]) {
			[loadingView.rotateImageView.layer removeAnimationForKey:@"rotationAnimation"];
		}
	}
}

+ (void) startAnimationInView:(UIView *)view {
	WDHLoadingView *loadingView = [view viewWithTag:kLoaddingViewTagId];
	if (loadingView) {
		if ([loadingView.rotateImageView.layer animationForKey:@"rotationAnimation"]) {
			[loadingView.rotateImageView.layer removeAnimationForKey:@"rotationAnimation"];
		}
		[loadingView startLoading];
	}
}

- (void) startLoading {
    CABasicAnimation *ani = [CABasicAnimation animation];
    ani.keyPath = @"transform.rotation.z";
    ani.fromValue = 0;
    ani.toValue = @(M_PI*2);
    ani.duration = 1.7;
    ani.repeatCount = NSIntegerMax;
	[self.rotateImageView.layer addAnimation:ani forKey:@"rotationAnimation"];
}

- (void) stopLoading {
    if ([self.rotateImageView.layer animationForKey:@"rotationAnimation"]) {
        [self.rotateImageView.layer removeAnimationForKey:@"rotationAnimation"];
    }
	
	[loadingQueue removeObject:self];
}


static NSInteger kLoaddingViewTagId = 1891008;
+ (void) showInView:(UIView *)view text:(NSString *)text mask:(BOOL)mask {
	
	WDHLoadingView *exsistsLoading = [view viewWithTag:kLoaddingViewTagId];
    if (exsistsLoading) {
		[exsistsLoading stopLoading];
        [exsistsLoading removeFromSuperview];
    }
    
    CGFloat w = 100;
    CGFloat h = 100;
    
    CGFloat left = (view.frame.size.width - w)/2;
    left = (CGFloat)(ceilf((CGFloat)left));
    
    CGFloat top = (view.frame.size.height - h)/2;
    top = (CGFloat)(ceilf((CGFloat)top));
    
    WDHLoadingView *loading = [[WDHLoadingView alloc] initWithFrame:(CGRect){left,top,w,h}];
    loading.loadingText = text;
    [view addSubview:loading];
    [loading startLoading];
    loading.alpha = 0;
    loading.tag = kLoaddingViewTagId;
    
    [UIView animateWithDuration:0.15 animations:^{
        loading.alpha = 1;
    }];
	
	view.userInteractionEnabled = mask;

	[loadingQueue addObject:loading];
}

+ (void) hideInView:(UIView *)view {

	WDHLoadingView *loadingView = [view viewWithTag:kLoaddingViewTagId];
	if (!loadingView) {
		loadingView = [loadingQueue firstObject];
	}
	
	if (loadingView) {
		[UIView animateWithDuration:0.15 animations:^{
			loadingView.alpha = 0;
		} completion:^(BOOL finished) {
			[loadingView stopLoading];
			[loadingView removeFromSuperview];
		}];
		
		view.userInteractionEnabled = true;
	}
}

+ (void)removeAllLoading {

	[loadingQueue enumerateObjectsUsingBlock:^(WDHLoadingView * _Nonnull loadingView, NSUInteger idx, BOOL * _Nonnull stop) {
		[loadingView stopLoading];
		[loadingView removeFromSuperview];
	}];
}

@end

