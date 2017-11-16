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
//#import <GLImageProcessor/GLImageProcessor.h>

typedef NS_ENUM(NSUInteger, WHEImagePickerViewType) {
    WHEImagePickerViewTypeCamera,           // 相机
    WHEImagePickerViewTypePictureSingle,    // 单选
    WHEImagePickerViewTypePictureMulti      // 多选
};




@class GLViewController;


typedef void(^CompleteBlock)(BOOL isCancel,UIImage *image);
typedef void(^CompleteMultiSelectedBlock)(BOOL isCancel,NSArray *imageArray);

/**
 *  brief 选图控件
 *
 *  zhengxf add 2015-12-16
 */
@interface WHEImagePickerView : UIView

/**
 *  单选和拍照 回调 block
 */
@property (nonatomic, copy) CompleteBlock completeBlock;

/**
 *  多选 回调 block
 */
@property (nonatomic, copy) CompleteMultiSelectedBlock completeMultiSelectedBlock;

/**
 *   多选 最多选择照片书 must
 */
@property (nonatomic, assign) NSInteger maxSelectedCount;

/**
 *  brief 从相册里选图片
 *
 *  @param parentController 父 controller
 *  @param isSingle         单选 目前都是单选 多选未使用改组件
 *  @param allowEditing     是否允许编辑
 */
- (void)showWithParentController:(UIViewController *)parentController obtainSingleImage:(BOOL)isSingle allowEditing:(BOOL)allowEditing;

/**
 *  无选择视图出现
 *
 *  @param parentController
 *  @param type
 */
- (void)actionWithParentController:(UIViewController *)parentController pickerType:(WHEImagePickerViewType)type;

@end

