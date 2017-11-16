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


#import "WHEAssetsListCell.h"

#define kTipWidth 30
// iPhone6Plus 标准模式
#define WHE_DEVICE_IPHONE_6_Plus                 ([UIScreen instancesRespondToSelector:@selector(currentMode)] ? CGSizeEqualToSize(CGSizeMake(1242, 2208), [[UIScreen mainScreen] currentMode].size) : NO)

/// iPhone6Plus 放大模式
#define WHE_DEVICE_IPHONE_6_Plus_Scale           ([UIScreen instancesRespondToSelector:@selector(currentMode)] ? CGSizeEqualToSize(CGSizeMake(1125, 2001), [[UIScreen mainScreen] currentMode].size) : NO)

/// 包含（iPhone6Plus和 放大模式）
#define WHE_DEVICE_IPHONE_6_Plus_Or_Scale        (IS_DEVICE_IPHONE_6_Plus_Scale || IS_DEVICE_IPHONE_6_Plus)

/// iPhone6 的手机
#define WHE_DEVICE_IPHONE_6                      ([UIScreen instancesRespondToSelector:@selector(currentMode)] ? CGSizeEqualToSize(CGSizeMake(750, 1334), [[UIScreen mainScreen] currentMode].size) : NO)

/// iPhone5 的手机
#define WHE_DEVICE_IPHONE_5                      ([UIScreen instancesRespondToSelector:@selector(currentMode)] ? CGSizeEqualToSize(CGSizeMake(640, 1136), [[UIScreen mainScreen] currentMode].size) : NO)

/// iPhone4 的手机
#define WHE_DEVICE_IPHONE_4                      ([UIScreen instancesRespondToSelector:@selector(currentMode)] ? CGSizeEqualToSize(CGSizeMake(640, 960), [[UIScreen mainScreen] currentMode].size) : NO)

#import "WHEAssetsListCell.h"
#import "WHEFetchImageAsset.h"
#import "WHEFetchImageManager.h"
#import "WDHBundleUtil.h"
CGFloat     kELCAssetCellHeight;
NSInteger   kELCAssetCellColoumns;
NSInteger   kELCAssertWidth;
CGFloat     kELCAssertOffset;

@interface WHEAssetsListCell () <UIAlertViewDelegate>

@property (nonatomic, strong) NSArray *rowAssets;
@property (nonatomic, strong) NSMutableArray *imageViewArray;
@property (nonatomic, strong) NSMutableArray *overCheckArray;
@property (nonatomic, strong) NSMutableArray *overUncheckArray;

@property (nonatomic, strong) WHEFetchImageAsset *tempfetchImageAsset;
@property (nonatomic, strong) UIImageView       *tempOverCheckView;
@property (nonatomic, strong) UIImageView       *tempOverUncheckView;

@end

@implementation WHEAssetsListCell

- (CGSize)targetSize
{
    CGFloat scale = [UIScreen mainScreen].scale;
    return CGSizeMake(kELCAssertWidth * scale, kELCAssertWidth * scale);
}

+ (void)load
{
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        
        if (WHE_DEVICE_IPHONE_6) {
            kELCAssetCellHeight = 92;
            kELCAssertWidth = 85;
            kELCAssetCellColoumns = 4;
            
        } else if(WHE_DEVICE_IPHONE_6_Plus) {
            kELCAssetCellHeight = 102;
            kELCAssertWidth = 96;
            kELCAssetCellColoumns = 4;
        } else{
            kELCAssetCellHeight = 79;
            kELCAssertWidth = 75;
            kELCAssetCellColoumns =  [[UIScreen mainScreen] bounds].size.width / 80;
        }
        
        kELCAssertOffset = (kELCAssetCellHeight - kELCAssertWidth)/2;
    });
}

- (id)initWithAssets:(NSArray *)assets reuseIdentifier:(NSString *)identifier
{
    self = [super initWithStyle:UITableViewCellStyleDefault reuseIdentifier:identifier];
    if(self) {
        UITapGestureRecognizer *tapRecognizer = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(cellTapped:)];
        [self addGestureRecognizer:tapRecognizer];
        
        NSMutableArray *mutableArray = [[NSMutableArray alloc] initWithCapacity:4];
        self.imageViewArray = mutableArray;
        
        self.overCheckArray = [[NSMutableArray alloc] initWithCapacity:5];
        self.overUncheckArray = [[NSMutableArray alloc] initWithCapacity:5];
        
        [self setAssets:assets];
    }
    return self;
}

- (void)setAssets:(NSArray *)assets
{
    self.rowAssets = assets;
    // 重置
    for (UIImageView * iv in _imageViewArray) {
        iv.hidden = YES;
    }
    for (UIImageView * iv in _overUncheckArray) {
        iv.hidden = YES;
    }
    for (UIImageView * iv in _overCheckArray) {
        iv.hidden = YES;
    }
    
    //set up a pointer here so we don't keep calling [WHEImage imageNamed:] if creating overlays
    UIImage *overUncheck = nil;
    UIImage *overCheck = nil;
    
    for (int i = 0; i < [_rowAssets count]; ++i) {
        
        WHEFetchImageAsset *fetchImageAsset = [_rowAssets objectAtIndex:i];
        UIImageView *imageView = nil;
        if (i < [_imageViewArray count]) {
            imageView = [_imageViewArray objectAtIndex:i];
        } else {
            imageView = [[UIImageView alloc] init];
            imageView.contentMode = UIViewContentModeScaleAspectFill;
            imageView.clipsToBounds = YES;
            [_imageViewArray addObject:imageView];
        }
        imageView.hidden = NO;
        [[WHEFetchImageManager sharedInstance] fetchImageWithAsset:fetchImageAsset targetSize:[self targetSize] completion:^(UIImage *image) {
            imageView.image = image;
        } progress:^(double progress) {
            
        }];
        
        
        if (i < [_overCheckArray count]) {
            
            UIImageView *overCheckView = [_overCheckArray objectAtIndex:i];
            UIImageView *overUncheckView = [_overUncheckArray objectAtIndex:i];
            
            if (fetchImageAsset.isSelected) {
                overUncheckView.hidden = YES;
                overCheckView.hidden = NO;
            }else{
                overUncheckView.hidden = NO;
                overCheckView.hidden = YES;
            }
        } else {
            if (overCheck == nil) {
                overCheck = [WDHBundleUtil imageFromBundleWithName:@"WHEPicker_select_image_check_small"];
                overUncheck = [WDHBundleUtil imageFromBundleWithName:@"WHEPicker_select_image_uncheck_small"];
            }
            
            UIImageView *overCheckView = [[UIImageView alloc] initWithImage:overCheck];
            UIImageView *overUncheckView = [[UIImageView alloc] initWithImage:overUncheck];
            
            [_overCheckArray addObject:overCheckView];
            [_overUncheckArray addObject:overUncheckView];
            
            if (fetchImageAsset.isSelected) {
                overUncheckView.hidden = YES;
                overCheckView.hidden = NO;
            } else {
                overUncheckView.hidden = NO;
                overCheckView.hidden = YES;
            }
        }
    }
}

- (void)cellTapped:(UITapGestureRecognizer *)tapRecognizer
{
    CGPoint point = [tapRecognizer locationInView:self];
    
    for (int i = 0; i < [_rowAssets count]; ++i) {
        
        CGRect frame = CGRectMake( 2*(i+1)*kELCAssertOffset + kELCAssertWidth*i, kELCAssertOffset, kELCAssertWidth, kELCAssertWidth);
        
        if (CGRectContainsPoint(frame, point)) {
            
            WHEFetchImageAsset *fetchImageAsset = [_rowAssets objectAtIndex:i];
            
            CGRect tipRect = CGRectMake(CGRectGetMaxX(frame) - kTipWidth, frame.origin.y, kTipWidth, kTipWidth);
            
            if(!CGRectContainsPoint(tipRect, point)){
                // 点击显示大图
                fetchImageAsset.clickType = WHEFetchImageAssetClickTypePreview;
            } else {
                //
                fetchImageAsset.clickType = WHEFetchImageAssetClickTypeSelect;
                if (self.clickCheckBlock) {
                    BOOL ret = self.clickCheckBlock(fetchImageAsset);
                    if (ret) {
                        fetchImageAsset.isSelected = !fetchImageAsset.isSelected;
                        UIImageView *overCheckView = [_overCheckArray objectAtIndex:i];
                        UIImageView *overUncheckView = [_overUncheckArray objectAtIndex:i];
                        
                        if (fetchImageAsset.isSelected) {
                            // 本次选中
                            BOOL isLocalFlag = [[WHEFetchImageManager sharedInstance] checkImageIsInLocalAblumWithAsset:fetchImageAsset];
                            if (!isLocalFlag) {
                                // 不在本地
                                self.tempfetchImageAsset = fetchImageAsset;
                                self.tempOverCheckView = overCheckView;
                                self.tempOverUncheckView = overUncheckView;
                                
                                NSString *message = @"你选择的是iCloud照片，同步速度较慢，确定添加?";
                                UIAlertView *av = [[UIAlertView alloc] initWithTitle:nil
                                                                             message:message
                                                                            delegate:self
                                                                   cancelButtonTitle:@"取消"
                                                                   otherButtonTitles:@"确定", nil];
                                [av show];
                                
                                return;
                            }
                        }
                        
                        if (fetchImageAsset.isSelected) {
                            overUncheckView.hidden = YES;
                            overCheckView.hidden = NO;
                        }else{
                            overUncheckView.hidden = NO;
                            overCheckView.hidden = YES;
                        }
                    } else {
                        // 超过最大选择个数
                        return;
                    }
                }
            }
            if (_clickAssetBlock) {
                _clickAssetBlock(fetchImageAsset);
            }
            break;
        }
    }
}


- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    if (buttonIndex == 0) {
        // 取消
        self.tempfetchImageAsset.isSelected = NO;
        
        
    } else if (buttonIndex == 1) {
        // 确定 DO 下载
        [[WHEFetchImageManager sharedInstance] fetchPreviewImageWithAsset:self.tempfetchImageAsset completion:^(UIImage *previewImage) {
            
        } progress:^(double progress) {
            
        }];
    }
    if (self.tempfetchImageAsset.isSelected) {
        self.tempOverUncheckView.hidden = YES;
        self.tempOverCheckView.hidden = NO;
    }else{
        self.tempOverUncheckView.hidden = NO;
        self.tempOverCheckView.hidden = YES;
    }
    
    if (_clickAssetBlock) {
        _clickAssetBlock(self.tempfetchImageAsset);
    }
    
}



- (void)layoutSubviews
{
    [super layoutSubviews];
    CGRect frame = CGRectMake(2*kELCAssertOffset, kELCAssertOffset, kELCAssertWidth, kELCAssertWidth);
    CGFloat off = 5;
    CGFloat width = 24;
    [_overCheckArray makeObjectsPerformSelector:@selector(removeFromSuperview)];
    [_overUncheckArray makeObjectsPerformSelector:@selector(removeFromSuperview)];

    for (int i = 0; i < [_rowAssets count]; ++i) {
        
        UIImageView *imageView = [_imageViewArray objectAtIndex:i];
        imageView.frame = frame;
        [self addSubview:imageView];
        
        UIImageView *overCheckView = [_overCheckArray objectAtIndex:i];
        UIImageView *overUncheckView = [_overUncheckArray objectAtIndex:i];
        overUncheckView.frame = overCheckView.frame = CGRectMake(CGRectGetMaxX(frame) - off - width , off, width, width);
        [self addSubview:overCheckView];
        [self addSubview:overUncheckView];
        
        frame.origin.x = frame.origin.x + frame.size.width + 2*kELCAssertOffset;
    }
}


@end


