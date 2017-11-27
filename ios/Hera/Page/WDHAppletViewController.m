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

#import "WDHAppletViewController.h"
#import "WDHBundleUtil.h"
#import "WDHDeviceMacro.h"

@interface WDHHomeTitleLoading: UIView
@property (nonatomic,strong) NSArray<UIColor *>*colors;
@end
@implementation WDHHomeTitleLoading
- (void)drawRect:(CGRect)rect
{
    CGFloat size = 6;
    CGFloat padding = 5;
    CGFloat left = (self.bounds.size.width - 3 * size - 2 * padding) / 2;
    CGFloat top = 0;
    for (NSInteger i = 0 ; i < self.colors.count; i++) {
        [self.colors[i] setFill];
        [[UIBezierPath bezierPathWithOvalInRect:CGRectMake(left, top, size, size)] fill];
        left += size;
        left += padding;
    }
}
@end

@interface WDHHomeTitleLoadingView: UIView
@property (nonatomic,strong) UILabel *titleLabel;
@property (nonatomic,strong) UIImageView *iconView;
@property (nonatomic,strong) WDHHomeTitleLoading *loadingView;
@property (nonatomic,copy)dispatch_block_t completion;
- (void)startLoad;
- (CGFloat)layoutViews;

@end

@implementation WDHHomeTitleLoadingView
{
    dispatch_source_t _timer;
}
- (CGFloat)layoutViews
{
    CGFloat bottom = 0;
    self.iconView.hidden = self.iconView.image == nil;
    if(!self.iconView.hidden) {
        CGFloat imageTop = 14;
        CGFloat imageSize = 28;
        CGFloat imageLeft = (self.bounds.size.width - imageSize) * .5;
        self.iconView.frame = CGRectMake(imageLeft, imageTop, imageSize, imageSize);
        bottom = self.iconView.frame.size.height + self.iconView.frame.origin.y;
    }
    
    self.titleLabel.hidden = self.titleLabel.text == nil;
    if(!self.titleLabel.hidden) {
        [self.titleLabel sizeToFit];
        CGFloat lft = (self.bounds.size.width - self.titleLabel.bounds.size.width) / 2;
        if(!self.iconView.hidden) {
            CGFloat titleLabelTop = self.iconView.frame.size.height + self.iconView.frame.origin.y + 15;
            self.titleLabel.frame = CGRectMake(lft, titleLabelTop, self.titleLabel.bounds.size.width, self.titleLabel.bounds.size.height);
        } else {
            CGFloat titleLabelTop = (44 - self.titleLabel.bounds.size.height) / 2;
            self.titleLabel.frame = CGRectMake(lft, titleLabelTop, self.titleLabel.bounds.size.width, self.titleLabel.bounds.size.height);
        }
        bottom = self.titleLabel.frame.size.height + self.titleLabel.frame.origin.y;
    }
    
    CGFloat iconWidth = 6 * 3 + 5 * 2;
    self.loadingView.frame = CGRectMake((self.bounds.size.width - iconWidth) * .5 ,bottom + 22, iconWidth, 10);
    bottom += 22;
    bottom += 10;
    
    return bottom;
}

- (UIImageView *)iconView
{
    if(!_iconView) {
        _iconView = [[UIImageView alloc] init];
        [self addSubview:_iconView];
    }
    return _iconView;
}

- (UILabel *)titleLabel
{
    if (!_titleLabel) {
        _titleLabel = [[UILabel alloc] init];
        _titleLabel.font = [UIFont boldSystemFontOfSize:20];
        _titleLabel.textColor = [UIColor blackColor];
        [self addSubview:_titleLabel];
    }
    return _titleLabel;
}

- (WDHHomeTitleLoading *)loadingView
{
    if(!_loadingView) {
        _loadingView = [[WDHHomeTitleLoading alloc] init];
        _loadingView.backgroundColor = [UIColor clearColor];
        UIColor *clr0 = [UIColor colorWithRed:205./255. green:205./255. blue:205./255. alpha:1];
        UIColor *clr1 = [UIColor colorWithRed:221./255. green:221./255. blue:221./255. alpha:1];
        UIColor *clr2 = [UIColor colorWithRed:213./255. green:213./255. blue:213./255. alpha:1];
        _loadingView.colors = @[clr0,clr1,clr2];
        [self addSubview:_loadingView];
    }
    return _loadingView;
}


- (void)startLoad
{
    dispatch_source_t timer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, dispatch_get_main_queue());
    dispatch_source_set_timer(timer, DISPATCH_TIME_NOW, 0.3 * NSEC_PER_SEC, 0.0);
    
    __weak typeof(self) weakSelf = self;
    dispatch_source_set_event_handler(timer, ^{
        NSArray *arr = weakSelf.loadingView.colors;
        UIColor *clr0 = arr[0];
        UIColor *clr1 = arr[1];
        UIColor *clr2 = arr[2];
        NSMutableArray *narr = @[].mutableCopy;
        narr[0] = clr2;
        narr[1] = clr0;
        narr[2] = clr1;
        weakSelf.loadingView.colors = narr;
        [weakSelf.loadingView setNeedsDisplay];
    });
    
    _timer = timer;
    dispatch_resume(timer);
}

- (void)stopLoadWithCompletion:(dispatch_block_t)completion
{
    [UIView animateWithDuration:0.4 animations:^{
        self.iconView.frame = CGRectMake(self.bounds.size.width/2, 0, 0, 0);
        CGFloat lft = (self.bounds.size.width - self.titleLabel.bounds.size.width) / 2;
        CGFloat titleLabelTop = (44 - self.titleLabel.bounds.size.height) / 2;
        self.titleLabel.frame = CGRectMake(lft, titleLabelTop, self.titleLabel.bounds.size.width, self.titleLabel.bounds.size.height);
        self.loadingView.alpha = 0;
        self.loadingView.frame = CGRectMake(self.loadingView.frame.origin.x,
                                            self.titleLabel.frame.origin.y + self.titleLabel.frame.size.height + 22,
                                            self.loadingView.frame.size.width,
                                            self.loadingView.frame.size.height);
        dispatch_source_cancel(_timer);
    } completion:^(BOOL finished) {
        if(completion) {
            completion();
        }
    }];
}
@end

@interface WDHAppletViewController ()
@property (nonatomic,copy) NSString *wdh_applet_page_id;
@property (nonatomic,strong) WDHHomeTitleLoadingView *titleLoaddingView;
@property (nonatomic, strong) UIButton *leftButton;
@end

@implementation WDHAppletViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.wdh_applet_page_id = @"Weidian_Wechat_Applet_Page";
    if (!self.navigationController.isNavigationBarHidden) {
        [self.navigationController setNavigationBarHidden:YES animated:YES];
    }
    
    _titleLoaddingView = [[WDHHomeTitleLoadingView alloc] initWithFrame:CGRectMake(0, [UIApplication sharedApplication].statusBarFrame.size.height, self.view.bounds.size.width, 120)];
    [self.view addSubview:_titleLoaddingView];
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    if(self.navigationController.viewControllers.count > 1 &&
       [UIApplication sharedApplication].keyWindow.rootViewController != self) {
        self.leftButton.hidden = NO;
    } else {
        _leftButton.hidden = YES;
    }
}

- (UIButton *)leftButton
{
    if(!_leftButton) {
        _leftButton = [UIButton buttonWithType:UIButtonTypeSystem];
        _leftButton.backgroundColor = [UIColor clearColor];
        [_leftButton setImage:[WDHBundleUtil imageFromBundleWithName:@"WDIPh_btn_navi_back"] forState:UIControlStateNormal];
        [_leftButton addTarget:self action:@selector(leftButtonAction:) forControlEvents:UIControlEventTouchUpInside];
        _leftButton.hidden = YES;
        _leftButton.tintColor = [UIColor blackColor];
        [self.view addSubview:_leftButton];
    }
    return _leftButton;
}

- (void)setTitle:(NSString *)title
{
    [super setTitle:title];
    self.titleLoaddingView.titleLabel.text = title;
}

- (void)viewDidLayoutSubviews
{
    [super viewDidLayoutSubviews];
    if(self.navigationItem.title) {
        self.titleLoaddingView.titleLabel.text = self.navigationItem.title;
    }
    
    if(!_leftButton.hidden) {
        CGFloat h =  IS_IPHONE_X ? 88 : 64;
        CGFloat controlTop =  IS_IPHONE_X ? 44.0 : 20.0;
        CGFloat controlHeight = h - controlTop;
        CGFloat btnWidth = h;
        _leftButton.frame = (CGRect){0,controlTop,btnWidth,controlHeight};
    }
}

- (void)startLoadingWithImage:(UIImage *)image title:(NSString *)title
{
    self.isLoadding = YES;
    self.titleLoaddingView.iconView.image = image;
    self.titleLoaddingView.titleLabel.text = title;
    [self.titleLoaddingView layoutViews];
    [self.titleLoaddingView startLoad];
}

- (void)stopLoadingWithCompletion:(dispatch_block_t)completion
{
    self.isLoadding = NO;
    [self.titleLoaddingView stopLoadWithCompletion:completion];
}

- (void)leftButtonAction:(id)sender
{
    [self.navigationController popViewControllerAnimated:YES];
}

@end
