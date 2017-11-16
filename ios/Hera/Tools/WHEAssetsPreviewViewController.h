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


#import <UIKit/UIKit.h>
#import "WHEImagePickerBaseViewController.h"
@class WHEFetchImageAsset;

typedef void(^clickSelectBlock)(void);
typedef void(^clickFinishBlock)(void);
typedef BOOL(^clickCheckBlock)(WHEFetchImageAsset *);
@interface WHEAssetsPreviewViewController : WHEImagePickerBaseViewController
/// 最大选择数
@property (nonatomic, assign) NSInteger     maxSelectedCount;
/// 当前展示的
@property (nonatomic, retain) WHEFetchImageAsset *currentShowAsset;
/// data
@property (nonatomic, copy) NSArray *assetsDataArray;
/// 选择的Asset
@property (nonatomic, retain) NSMutableArray *selectAssetsArray;
/// 选择 block
@property (nonatomic, copy) clickSelectBlock clickSelectBlock;
/// 完成 block
@property (nonatomic, copy) clickFinishBlock clickFinishBlock;
/// check block
@property (nonatomic, copy) clickCheckBlock clickCheckBlock;


@end

