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


#import <Foundation/Foundation.h>
#import <Photos/PHAsset.h>
#import <AssetsLibrary/ALAsset.h>
#import <UIKit/UIKit.h>

typedef enum : NSUInteger {
    /// 选择
    WHEFetchImageAssetClickTypeSelect,
    /// 预览
    WHEFetchImageAssetClickTypePreview,
    
} WHEFetchImageAssetClickType;

@interface WHEFetchImageAsset : NSObject


/// store data PHAsset or ALAsset
@property (nonatomic, strong) id    data;
/// default NO
@property (nonatomic, assign) BOOL              isSelected;
/// store click type
@property (nonatomic, assign) WHEFetchImageAssetClickType  clickType;
/// PHAsset fullScreenImage 的下载进度
@property (nonatomic, assign) CGFloat           progress;
/// PHAsset fullScreenImage
@property (nonatomic, strong) UIImage           *fullScreenImage;

/**
 *  用PHAsset实例化一个WHEFetchImageAsset 对象
 *
 */
+ (WHEFetchImageAsset *)getFetchImageAsseWithPHAsset:(PHAsset *)phAsset;


/**
 *  用ALAsset实例化一个WHEFetchImageAsset 对象
 *
 */
+ (WHEFetchImageAsset *)getFetchImageAsseWithALAsset:(ALAsset *)alAsset;
@end

