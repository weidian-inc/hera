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


#define kMarginBottom 44

#import "WHEAssetsPreviewViewController.h"
#import "WHEFetchImageAsset.h"
#import "WHEFetchImageManager.h"
#import "GLPinchableImageView.h"

#define UIColorFromRGB(rgbValue)  [UIColor colorWithRed:((float)((rgbValue & 0xFF0000) >> 16))/255.0 green:((float)((rgbValue & 0xFF00) >> 8))/255.0 blue:((float)(rgbValue & 0xFF))/255.0 alpha:1.0]

@interface WHEAssetsPreviewViewController ()<UICollectionViewDataSource, UICollectionViewDelegate>
{
    UIView *bottomView;
    BOOL isAfterLayout;

}
@property (nonatomic, strong) UICollectionView *collectionView;

/// 选择Button
@property (nonatomic, strong) UIButton *selectButton;

/// 完成Button
@property (nonatomic, strong) UIButton *finishButton;

/// 保存Nav颜色
@property (nonatomic, strong) UIColor *navColor;

@end

@implementation WHEAssetsPreviewViewController

- (void)configNavigationBar
{
    [self.navigationItem setLeftBarButtonItem:self.glLeftItem];
    
    // 设置 导航栏背景
    self.navigationController.navigationBar.barTintColor = [UIColor blackColor];
}

- (void)glGoBack
{
    [super glGoBack];
    // 恢复 导航栏背景
    self.navigationController.navigationBar.barTintColor = self.navColor;
}


- (void)viewDidLoad {
    
    [super viewDidLoad];
    
    self.navColor = self.navigationController.navigationBar.barTintColor;
    
    [self configNavigationBar];
    
    CGRect rect = self.view.bounds;
    rect.size.height -= kMarginBottom;
    
    UICollectionViewFlowLayout *flow = [[UICollectionViewFlowLayout alloc] init];
    flow.scrollDirection = UICollectionViewScrollDirectionHorizontal;
    flow.minimumInteritemSpacing = 0;
    flow.minimumLineSpacing = 0;
    
    self.collectionView = [[UICollectionView alloc] initWithFrame:rect collectionViewLayout:flow];
    _collectionView.delegate = self;
    _collectionView.dataSource = self;
    [_collectionView registerClass:[UICollectionViewCell class] forCellWithReuseIdentifier:@"cell"];
    _collectionView.pagingEnabled = YES;
    [self.view addSubview:_collectionView];
    
    bottomView = [[UIView alloc] initWithFrame:CGRectMake(0, self.view.bounds.size.height - kMarginBottom, [UIScreen mainScreen].bounds.size.width, kMarginBottom)];
    bottomView.backgroundColor = [UIColor blackColor];
    [self.view addSubview:bottomView];
    
    self.finishButton = [UIButton buttonWithType:UIButtonTypeCustom];
    self.finishButton.frame = CGRectMake([UIScreen mainScreen].bounds.size.width - 100, 0, 100, kMarginBottom);
    [self.finishButton addTarget:self action:@selector(finishButtonAction) forControlEvents:UIControlEventTouchUpInside];
    [self.finishButton setTitleColor:UIColorFromRGB(0xc60a1e) forState:UIControlStateNormal];
    self.finishButton.titleLabel.font = [UIFont systemFontOfSize:16];
    [bottomView addSubview:self.finishButton];
    
    [self updateButtonState];
}

- (void)viewWillLayoutSubviews
{
    if (!isAfterLayout) {
        isAfterLayout = YES;
        
        CGRect rect = self.view.bounds;
        rect.size.height -= kMarginBottom;
        self.collectionView.frame = rect;
        [self.collectionView reloadData];
        
        NSInteger index = [self.assetsDataArray indexOfObject:self.currentShowAsset];
        _collectionView.contentOffset = CGPointMake(CGRectGetWidth(self.view.frame)*index, 0);
        
        bottomView.frame = CGRectMake(0, self.view.bounds.size.height - kMarginBottom, [UIScreen mainScreen].bounds.size.width, kMarginBottom);
    }
}

- (void)updateButtonState
{
    if (!self.selectButton) {
        self.selectButton = [UIButton buttonWithType:UIButtonTypeCustom];
        self.selectButton.frame = CGRectMake(0, 0, 28, 28);
        [self.selectButton addTarget:self action:@selector(selectButtonAction) forControlEvents:UIControlEventTouchUpInside];
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithCustomView:self.selectButton];
    }
    
    if(self.currentShowAsset.isSelected){
        [self.selectButton setBackgroundImage:[WDHBundleUtil imageFromBundleWithName:@"GLPicker_select_image_check_big"] forState:UIControlStateNormal];
    }else{
        [self.selectButton setBackgroundImage:[WDHBundleUtil imageFromBundleWithName:@"GLPicker_select_image_uncheck_big"] forState:UIControlStateNormal];
    }
    
    if ([_selectAssetsArray count] > 0) {
        [self.finishButton setTitle:[NSString stringWithFormat:@"%zd/%zd 完成",[_selectAssetsArray count],self.maxSelectedCount] forState:UIControlStateNormal];
    }else{
        [self.finishButton setTitle:@"完成" forState:UIControlStateNormal];
    }
}
- (void)finishButtonAction
{
    if (self.selectAssetsArray.count == 0) {
        [self selectButtonAction];
    }
    
    if (self.clickFinishBlock) {
        self.clickFinishBlock();
    }
}

- (void)selectButtonAction
{
    if (self.clickCheckBlock) {
        BOOL ret = self.clickCheckBlock(self.currentShowAsset);
        if (ret) {
            
            self.currentShowAsset.isSelected = !self.currentShowAsset.isSelected;
            if (self.currentShowAsset.isSelected) {
                if (![self.selectAssetsArray containsObject:self.currentShowAsset]) {
                    [self.selectAssetsArray addObject:self.currentShowAsset];
                }
            } else {
                if ([self.selectAssetsArray containsObject:self.currentShowAsset]) {
                    [self.selectAssetsArray removeObject:self.currentShowAsset];
                }
            }
            
            if (self.clickSelectBlock) {
                self.clickSelectBlock();
            }
            
            [self updateButtonState];
        }
    }
}


#pragma mark --

#define kGLPinchableImageView 100

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section
{
    if (!isAfterLayout) {
        return 0;
    }
    
    return [self.assetsDataArray count];
}

- (CGSize)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout*)collectionViewLayout sizeForItemAtIndexPath:(NSIndexPath *)indexPath;
{
    return collectionView.frame.size;
}
- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath
{
    UICollectionViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:@"cell" forIndexPath:indexPath];
    GLPinchableImageView *imgView = (GLPinchableImageView *)[cell viewWithTag:kGLPinchableImageView];
    if (!imgView) {
        CGRect rect = cell.bounds;
        imgView = [[GLPinchableImageView alloc] initWithFrame:rect];
        imgView.tag = kGLPinchableImageView;
        [cell addSubview:imgView];
    }
    [imgView hideProgressView];
    
    if (indexPath.item < self.assetsDataArray.count) {
        WHEFetchImageAsset *fetchImageAsset = [self.assetsDataArray objectAtIndex:indexPath.item];
        imgView.viewIdentifier = fetchImageAsset;
        
        [[WHEFetchImageManager sharedInstance] fetchPreviewImageWithAsset:fetchImageAsset completion:^(UIImage *previewImage) {
            if (fetchImageAsset == imgView.viewIdentifier) {
                imgView.image = previewImage;
            }
        } progress:^(double progress) {
            if (fetchImageAsset == imgView.viewIdentifier) {
                [imgView showProgressView:progress];
            }
        }];
    }
    
    return cell;
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView
{
    NSInteger currentPage = scrollView.contentOffset.x/scrollView.frame.size.width;
    if (currentPage < self.assetsDataArray.count) {
        self.currentShowAsset = [self.assetsDataArray objectAtIndex:currentPage];
    }
    
    [self updateButtonState];
}

@end

