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


#define kLoadingTag         6666

#import "GLPinchableImageView.h"
#import "GLProgressHUD.h"

@interface GLPinchableImageView ()<UIScrollViewDelegate>

@property (nonatomic, strong) UIImageView *mImageView;

@end

@implementation GLPinchableImageView


- (instancetype)initWithFrame:(CGRect)frame
{
    if ((self = [super initWithFrame:frame]))
    {
        self.delegate = self;
        [self setMinimumZoomScale:1.0];
        [self setMaximumZoomScale:3.0];
        [self setZoomScale:1.0];
        [self setAutoresizingMask:UIViewAutoresizingFlexibleWidth|UIViewAutoresizingFlexibleHeight];
        [self setContentSize:frame.size];
        
        self.showsHorizontalScrollIndicator = NO;
        self.showsVerticalScrollIndicator   = NO;
        
        _mImageView = [[UIImageView alloc] initWithFrame:frame];
        _mImageView.contentMode = UIViewContentModeScaleAspectFit;
        _mImageView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
        [self addSubview:_mImageView];
    }
    
    return self;
}

- (instancetype)initWithFrame:(CGRect)frame pinchImage:(UIImage *)image;
{
    if ((self = [self initWithFrame:frame]))
    {
        _mImageView.image = image;
    }
    
    return self;
}

- (void)setImage:(UIImage *)image
{
    self.zoomScale = 1;
    self.mImageView.image = image;
}

- (UIImage *)image
{
    return self.mImageView.image;
}

- (void)setAutoresizingMask:(UIViewAutoresizing)autoresizingMask
{
    self.mImageView.autoresizingMask = autoresizingMask;
}

- (UIViewAutoresizing)autoresizingMask
{
    return self.mImageView.autoresizingMask;
}

- (void)setContentMode:(UIViewContentMode)contentMode
{
    self.mImageView.contentMode = contentMode;
}

- (UIViewContentMode)contentMode
{
    return self.mImageView.contentMode;
}


- (UIView *)viewForZoomingInScrollView:(UIScrollView *)scrollView
{
    return self.mImageView;
}


- (void)showProgressView:(CGFloat)progress
{
    if (![NSThread currentThread].isMainThread) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self showProgressView:progress];
        });
        return;
    }
    GLProgressHUD *hud = (GLProgressHUD *)[self viewWithTag:kLoadingTag];
    if (!hud || hud.mode != GLProgressHUDModeText) {
        if (hud) {
            [hud removeFromSuperview];
            hud = nil;
        }
        hud      = [[GLProgressHUD alloc] initWithView:self];
        hud.tag  = kLoadingTag;
        hud.mode = GLProgressHUDModeText;
        hud.labelFont = [UIFont systemFontOfSize:15];
        hud.removeFromSuperViewOnHide = YES;
        [self addSubview:hud];
    } else {
        hud.mode = GLProgressHUDModeText;
        [hud.superview bringSubviewToFront:hud];
    }
    // 显示
    if (progress < 1.0) {
        hud.labelText = [NSString stringWithFormat:@"iCloud照片同步中(%zd%%)...",(NSInteger)(progress * 100)];
        [hud show:YES];
    } else {
        [hud hide:YES];
    }
}


- (void)hideProgressView
{
    if (![NSThread currentThread].isMainThread) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self hideProgressView];
        });
        return;
    }
    
    GLProgressHUD *hud = (GLProgressHUD *)[self viewWithTag:kLoadingTag];
    if (hud && hud.mode == GLProgressHUDModeText) {
        [hud hide:YES];
    }
}

@end

