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

#import "WDHPhotoPreviewView.h"
#import "WDHPhotoPreviewLayout.m"
#import "WDHPhotoPreviewCollectionViewCell.h"

#define kHorizitalSpacing 10

@interface WDHPhotoPreviewView () <UICollectionViewDelegate,UICollectionViewDataSource>

@property (nonatomic,strong) WDHPhotoPreviewLayout *collectionLayout;

@property (nonatomic,strong) UIPageControl *pageControl;

@property (nonatomic,strong) NSArray *imgs;

@property (nonatomic,assign) NSInteger defaultIndex;

@property (nonatomic,strong) UIImage *defaultImage;

@property (nonatomic,weak) UIImageView *defaultImageView;

@property (nonatomic,strong) NSArray *visibleViews;

@property (nonatomic,assign) CGRect originRect;

@property (nonatomic,copy) void (^closeBlock)(NSInteger currentIndex);

@end

static CGFloat itemPadding = 10;

@implementation WDHPhotoPreviewView

- (instancetype)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if(self)
    {
        WDHPhotoPreviewLayout *layout = [[WDHPhotoPreviewLayout alloc]init];
        layout.itemPadding = itemPadding;
        self.collectionLayout = layout;
        
        UICollectionView *collectionView = [[UICollectionView alloc]initWithFrame:CGRectMake(-itemPadding * 0.5, 0, self.bounds.size.width + itemPadding, self.bounds.size.height) collectionViewLayout:layout];
        collectionView.backgroundColor = [UIColor clearColor];
        collectionView.delegate = self;
        collectionView.dataSource = self;
        [collectionView registerClass:[WDHPhotoPreviewCollectionViewCell class] forCellWithReuseIdentifier:@"photoCell"];
        collectionView.pagingEnabled = YES;
        collectionView.showsHorizontalScrollIndicator = NO;
        collectionView.showsVerticalScrollIndicator = NO;
        collectionView.bounces = NO;
        [self addSubview:collectionView];
        
        _collectionView = collectionView;
    }
    return self;
}

- (UIPageControl *)pageControl
{
    if (_pageControl == nil)
    {
        _pageControl = [[UIPageControl alloc]init];
        [self addSubview:_pageControl];
    }
    return _pageControl;
}

- (void)setImgs:(NSArray *)imgs
{
    _imgs = imgs;
    
    self.pageControl.numberOfPages = imgs.count;
    self.pageControl.currentPageIndicatorTintColor = [UIColor whiteColor];
    
    [self bringSubviewToFront:self.pageControl];
    
    CGSize size = [self.pageControl sizeForNumberOfPages:_imgs.count];
    _pageControl.frame = CGRectMake(0, 0, self.bounds.size.width, size.height);
    _pageControl.center = CGPointMake(self.center.x, self.bounds.size.height - size.height / 2 - 10);
    self.collectionView.contentSize = CGSizeMake(self.collectionView.bounds.size.width * imgs.count, self.collectionView.bounds.size.height);
    [self.collectionView reloadData];
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if(self.defaultIndex < imgs.count)
        {
            self.pageControl.currentPage = self.defaultIndex;
            
            CGFloat wid = self.collectionView.bounds.size.width * self.defaultIndex;
            
            [self.collectionView setContentOffset:CGPointMake(wid, 0) animated:NO];
            
            [self updateOriImageViewVisible:YES];
        }
    });
}

- (void)startAnimate:(UIImageView *)clickedView
{
    UIWindow *wd =  [UIApplication sharedApplication].keyWindow;
    
    CGRect originRect = [clickedView.superview convertRect:clickedView.frame toView:wd];
    
    self.originRect = originRect;
    
    UIImageView *tempView = [[UIImageView alloc] init];
    tempView.image = clickedView.image;
    tempView.contentMode = clickedView.contentMode;
    tempView.frame = originRect;
    tempView.clipsToBounds = YES;
    [wd addSubview:tempView];
    
    UIImage *image = clickedView.image;
    CGFloat imageWidthHeightRatio = image != nil ? (image.size.width / image.size.height) : 1;
    CGFloat width = self.bounds.size.width;
    CGFloat height = self.bounds.size.width / imageWidthHeightRatio;
    CGFloat x = 0;
    CGFloat y;
    if (height > self.bounds.size.height) {
        y = 0;
    } else {
        y = (self.bounds.size.height - height ) * 0.5;
    }
    // 目标frame
    CGRect targetRect = CGRectMake(x, y, width, height);
    
    // 动画修改图片视图的frame , 居中同时放大
    self.backgroundColor = [UIColor clearColor];
    self.collectionView.hidden = YES;
    [UIView animateWithDuration:0.25 animations:^{
        tempView.frame = targetRect;
        self.backgroundColor = [UIColor blackColor];
    } completion:^(BOOL finished) {
        self.collectionView.hidden = NO;
        [tempView removeFromSuperview];
    }];
}

- (void)layoutSubviews
{
    [super layoutSubviews];
}

+ (void)showWithImgs:(NSArray *)imgs
       selectedIndex:(NSInteger)selectedIndex
   selectedImageView:(nullable UIImageView *)selectedImageView
     allVisibleViews:(nullable NSArray *)visibleViews
          closeBlock:(nullable void (^)(NSInteger currentIndex))closeBlock
{
    if(![imgs isKindOfClass:NSArray.class] || imgs.count == 0) return;
    NSAssert(selectedIndex < imgs.count, @"index不能超过或等于图片数量");
    
    UIWindow *wd =  [UIApplication sharedApplication].keyWindow;
    WDHPhotoPreviewView *view = [[WDHPhotoPreviewView alloc] initWithFrame:wd.bounds];
    view.closeBlock = closeBlock;
    view.defaultIndex = selectedIndex;
    view.visibleViews = visibleViews;
    view.defaultImage = selectedImageView.image;
    view.defaultImageView = selectedImageView;
    [wd addSubview:view];
    
    view.imgs = imgs;
    
    if(selectedImageView)
    {
        [view startAnimate:selectedImageView];
    }
    else
    {
        if(selectedIndex < visibleViews.count)
        {
            selectedImageView = visibleViews[selectedIndex];
            if([selectedImageView isKindOfClass:[UIView class]])
            {
                [view startAnimate:selectedImageView];
            }
        }
        else
        {
            view.alpha = 0;
            [UIView animateWithDuration:0.25 animations:^{
                view.alpha = 1;
                view.backgroundColor = [UIColor blackColor];
            }];
        }
    }
}

- (void)dismissWithImv:(UIImageView *)imv
{
    CGRect finalRect = CGRectZero;
    
    if(self.pageControl.currentPage != self.defaultIndex)
    {
        UIWindow *wd =  [UIApplication sharedApplication].keyWindow;
        
        NSInteger ind = self.pageControl.currentPage;
        if(ind < self.visibleViews.count)
        {
            UIView *v = self.visibleViews[ind];
            if([v isKindOfClass:[UIView class]])
            {
                finalRect = [v.superview convertRect:v.frame toView:wd];
            }
        }
    }
    else
    {
        if(!CGRectEqualToRect(self.originRect, CGRectZero))
        {
            finalRect = self.originRect;
        }
        else
        {
            UIWindow *wd =  [UIApplication sharedApplication].keyWindow;
            
            if(self.visibleViews.count > 0 && self.defaultIndex < self.visibleViews.count)
            {
                UIView *v = self.visibleViews[self.defaultIndex];
                if([v isKindOfClass:[UIView class]])
                {
                    finalRect = [v.superview convertRect:v.frame toView:wd];
                }
            }
        }
    }
    
    if(CGRectEqualToRect(finalRect, CGRectZero) || !CGRectContainsRect(self.frame, finalRect))
    {
        [UIView animateWithDuration:0.15 animations:^{
            self.alpha = 0;
        } completion:^(BOOL finished) {
            [self updateOriImageViewVisible:NO];
            [self removeFromSuperview];
        }];
    }
    else
    {
        UIWindow *wd =  [UIApplication sharedApplication].keyWindow;
        
        WDHPhotoPreviewCollectionViewCell *cell = (WDHPhotoPreviewCollectionViewCell*)[self.collectionView cellForItemAtIndexPath:[NSIndexPath indexPathForItem:self.pageControl.currentPage inSection:0]];
        CGRect rect = [cell.imageView.superview convertRect:cell.imageView.frame toView:wd];
        
        UIImageView *tempView = [[UIImageView alloc] init];
        tempView.image = cell.imageView.image;
        tempView.contentMode = self.defaultImageView.contentMode;
        tempView.frame = rect;
        tempView.clipsToBounds = YES;
        [wd addSubview:tempView];
        
        self.collectionView.hidden = YES;
        [UIView animateWithDuration:0.25 animations:^{
            tempView.frame = finalRect;
            self.backgroundColor = [UIColor colorWithWhite:0 alpha:0];
        } completion:^(BOOL finished) {
            [self updateOriImageViewVisible:NO];
            [tempView removeFromSuperview];
            [self removeFromSuperview];
        }];
    }
    
    if(self.closeBlock)
    {
        self.closeBlock(self.pageControl.currentPage);
    }
}

#pragma mark --<UICollectionViewDataSource,UICollectionViewDelegate>
- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView
{
    return 1;
}

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section{
    
    return self.imgs.count;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath{
    
    WDHPhotoPreviewCollectionViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:@"photoCell" forIndexPath:indexPath];
    cell.photosView = self;
    
    if(indexPath.item >= self.imgs.count) return [UICollectionViewCell new];
    
    if(self.defaultIndex == indexPath.item && self.defaultImage) {
        cell.placeholderImage = self.defaultImage;
    }
    
    id obj = self.imgs[indexPath.item];
    if([obj isKindOfClass:[UIImage class]]) {
        cell.image = obj;
    } else if([obj isKindOfClass:[NSString class]]) {
        cell.url = obj;
    }
    __weak typeof(self) wself = self;
    cell.closeActionBlock = ^(UIImageView *imv) {
        [wself dismissWithImv:imv];
    };
    return cell;
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView
{
    NSInteger page = (NSInteger)(scrollView.contentOffset.x / scrollView.frame.size.width + 0.5) % self.imgs.count;
    if(page != self.pageControl.currentPage)
    {
        self.pageControl.currentPage = page;
        [self updateOriImageViewVisible:YES];
    }
}

- (void)updateOriImageViewVisible:(BOOL)hidden
{
    if(self.pageControl.currentPage < self.visibleViews.count)
    {
        NSInteger indx = 0;
        while (indx < self.visibleViews.count) {
            UIView *originView = self.visibleViews[indx];
            originView.hidden = hidden ? indx == self.pageControl.currentPage : NO;
            indx++;
        }
    }
}

@end
