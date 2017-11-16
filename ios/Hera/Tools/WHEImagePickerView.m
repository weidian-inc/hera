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


#import "WHEImagePickerView.h"
#import "WHEImagePickerManager.h"
#import "WHECommonUtil.h"
#import "WHEUIConstants.h"
#import "WDSDeviceMacros.h"

#define kSpace          10
#define kButtonHeight   44


@interface WHEImagePickerView()<UIImagePickerControllerDelegate,UINavigationControllerDelegate,UIPopoverControllerDelegate>{
    BOOL _obtainSingleImage;
    BOOL _allowsEditing;
}

@property (nonatomic, assign) UIViewController *parentController;
@property (nonatomic, strong) UIView *coverView;
@property (nonatomic, strong) UIView *containerView;

/// 照片选择
@property (nonatomic, strong) UIPopoverController *popOver;

@end



@implementation WHEImagePickerView


-(id)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        [self _initialize];
    }
    return self;
}

- (void)_initialize
{
    self.frame = CGRectMake(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    self.backgroundColor = [UIColor clearColor];

    _coverView = [[UIView alloc]initWithFrame:[self topView].bounds];
    _coverView.backgroundColor = [UIColor blackColor];
    _coverView.alpha = 0;
    [self addSubview:_coverView];
    
    UITapGestureRecognizer *tap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(removeSelf)];
    [_coverView addGestureRecognizer:tap];


    _containerView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, SCREEN_WIDTH, 3 * kButtonHeight + 1+ kSpace)];

    UIView *bgView = [[UIView alloc] initWithFrame:CGRectMake(kSpace, 0, SCREEN_WIDTH - 2*kSpace, 2*kButtonHeight + 1)];
    bgView.backgroundColor = [UIColor whiteColor];
    bgView.layer.cornerRadius = 3;
    [_containerView addSubview:bgView];
    
    UIFont *font    = [UIFont systemFontOfSize:20];
    UIColor *color  = UIColorFromRGB(0x007aff);
    UIButton *cameraBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    cameraBtn.frame = CGRectMake(kSpace, 0 , SCREEN_WIDTH - 2*kSpace, kButtonHeight);
    [cameraBtn setTitle:@"拍照" forState:UIControlStateNormal];
    cameraBtn.titleLabel.font = font;
    [cameraBtn setTitleColor:color forState:UIControlStateNormal];
    [cameraBtn addTarget:self action:@selector(clickCamera) forControlEvents:UIControlEventTouchUpInside];
    [_containerView addSubview:cameraBtn];
    
    UIView *line = [[UIView alloc] initWithFrame:CGRectMake(kSpace, kButtonHeight, SCREEN_WIDTH - 2*kSpace, 0.5)];
    line.backgroundColor = [UIColor blackColor];
    line.alpha = 0.3;
    [_containerView addSubview:line];
    
    UIButton *albumBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    albumBtn.frame = CGRectMake(kSpace, kButtonHeight+1, SCREEN_WIDTH - 2*kSpace, kButtonHeight);
    [albumBtn setTitle:@"从手机相册选择" forState:UIControlStateNormal];
    albumBtn.titleLabel.font = font;
    [albumBtn setTitleColor:color forState:UIControlStateNormal];
    [albumBtn addTarget:self action:@selector(clickAlbum) forControlEvents:UIControlEventTouchUpInside];
    [_containerView addSubview:albumBtn];
    
    
    UIButton *cancelBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    cancelBtn.frame = CGRectMake(kSpace, 2*kButtonHeight + 1+kSpace , SCREEN_WIDTH - 2*kSpace, kButtonHeight);
    [cancelBtn setTitle:@"取消" forState:UIControlStateNormal];
    cancelBtn.titleLabel.font = [UIFont boldSystemFontOfSize:20];
    [cancelBtn setTitleColor:color forState:UIControlStateNormal];
    cancelBtn.backgroundColor = [UIColor whiteColor];
    cancelBtn.layer.cornerRadius = 3;
    [cancelBtn addTarget:self action:@selector(removeSelf) forControlEvents:UIControlEventTouchUpInside];
    [_containerView addSubview:cancelBtn];
    
    
    [self addSubview:_containerView];
}


- (UIView*)topView{
    UIWindow *window = [UIApplication sharedApplication].delegate.window;
    UIView *view = window.subviews.firstObject;
    return view;
}

-(void)showWithParentController:(UIViewController *)parentController obtainSingleImage:(BOOL)isSingle allowEditing:(BOOL)allowEditing
{
    self.parentController = parentController;
    _obtainSingleImage = isSingle;
    _allowsEditing = allowEditing;
    
    [[self topView] addSubview:self];
    
    CGRect rect = _containerView.frame;
    rect.origin.y = SCREEN_HEIGHT;
    _containerView.frame = rect;

    rect.origin.y = SCREEN_HEIGHT - rect.size.height - kSpace;

    [UIView animateWithDuration:0.25 animations:^{
        _coverView.alpha = 0.3;
        _containerView.frame = rect;
        
    } completion:^(BOOL finished) {
        
    }];
}

- (void)actionWithParentController:(UIViewController *)parentController pickerType:(WHEImagePickerViewType)type
{
     self.parentController = parentController;
    [[self topView] addSubview:self];
    self.hidden = YES;
    if (type == WHEImagePickerViewTypeCamera) {
        [self clickCamera];
    } else if (type == WHEImagePickerViewTypePictureSingle) {
        _obtainSingleImage = YES;
        [self clickAlbum];
    } else if (type == WHEImagePickerViewTypePictureMulti) {
        _obtainSingleImage = NO;
        [self clickAlbum];
    }
}


- (void)hideAndRemove:(BOOL)remove
{
    [UIView animateWithDuration:0.25 animations:^{
        _coverView.alpha = 0.0;
        CGRect rect = _containerView.frame;
        rect.origin.y = SCREEN_HEIGHT;
        _containerView.frame = rect;
        
    } completion:^(BOOL finished) {
        if (remove) {
            [self removeFromSuperview];
        }
    }];
}

-(void)removeSelf
{
    [self hideAndRemove:YES];
}


#pragma mark -- ImagePicker


-(UIImagePickerController *)commonPicker
{
    UIImagePickerController *picker = [[UIImagePickerController alloc] init];
    picker.delegate      = self;
    picker.allowsEditing = _allowsEditing;
//    if ([WDCommonUtil isIOS7X]) {
        picker.navigationBar.barStyle = UIBarStyleBlackTranslucent;
        picker.navigationBar.translucent    = NO;
        picker.navigationBar.barTintColor   = UIColorFromRGB_Red_A;
        picker.navigationBar.tintColor = [UIColor whiteColor];
        picker.navigationBar.titleTextAttributes = self.parentController.navigationController.navigationBar.titleTextAttributes;
        [picker.view.layer setValue:[NSNumber numberWithBool:YES] forKeyPath:@"WD_UIImagePickerController"];

//    }
    return picker;
}

-(void)clickCamera
{
    [self hideAndRemove:NO];
    
    //相机权限
    if (![WHECommonUtil detectHasPermissionOfAccessVideo])
    {
        if (self.completeBlock) {
            self.completeBlock(YES,nil);
        }
        [self removeFromSuperview];
        return;
    }
    
    UIImagePickerController *picker = [self commonPicker];
    picker.sourceType = UIImagePickerControllerSourceTypeCamera;
    [self.parentController presentViewController:picker animated:YES completion:nil];
}

-(void)clickAlbum
{
    [self hideAndRemove:NO];
    
    if (![UIImagePickerController isSourceTypeAvailable:UIImagePickerControllerSourceTypePhotoLibrary]) {
        
        NSString *msg = @"该设备不支持访问图片";
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:nil message:msg delegate:nil cancelButtonTitle:@"好的" otherButtonTitles:nil, nil];
        [alert show];
        if (self.completeBlock) {
            self.completeBlock(YES,nil);
        }
        [self removeFromSuperview];
        return;
    }
    

//    //相册权限    无用代码
//    if (![WHECommonUtil detectHasPermissionOfAccessAlbum])
//    {
//        if (self.completeBlock) {
//            self.completeBlock(YES,nil);
//        }
//        [self removeFromSuperview];
//        return;
//    }
    
    
    if (_obtainSingleImage) {
        
        UIImagePickerController *picker = [self commonPicker];
        picker.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
        
        if (IS_DEVICE_IPHONE) {
            [self.parentController presentViewController:picker animated:YES completion:nil];
        }
        else {
            UIPopoverController *popover = [[UIPopoverController alloc] initWithContentViewController:picker];
            [popover presentPopoverFromRect:CGRectMake(0, 0, 115, 100) inView:self permittedArrowDirections:UIPopoverArrowDirectionAny animated:YES];
            popover.delegate = self;
            self.popOver = popover;
        }
    }else{
        // 相册列表 多选
        
        WEAK(self);
        WHEImagePickerManager *imagePickerManager = [WHEImagePickerManager shareInstance];
        imagePickerManager.maxSelectedCount = self.maxSelectedCount;
        [imagePickerManager presentPickMultiPicturesWithController:self.parentController
                                     imagePickerDidFinishPickBlock:^(BOOL isCancel, NSArray *imageArray) {
            if (isCancel) {
                if (weak_self.completeMultiSelectedBlock) {
                    weak_self.completeMultiSelectedBlock(YES,nil);
                }
                
                [weak_self removeFromSuperview];
            } else {
                if (weak_self.completeMultiSelectedBlock) {
                    weak_self.completeMultiSelectedBlock(NO,imageArray);
                }
                
                [weak_self removeFromSuperview];
            }
        }];
        
       
    }
}

#pragma mark - UIImagePickerControllerDelegate

- (void)imagePickerController:(UIImagePickerController *)picker didFinishPickingMediaWithInfo:(NSDictionary *)info
{
    
    UIImage *selectedImage = nil;
    if(_allowsEditing){
       selectedImage = [info objectForKey:UIImagePickerControllerEditedImage];
    }else{
        selectedImage = [info objectForKey:UIImagePickerControllerOriginalImage];
    }
    
    if (selectedImage.imageOrientation == UIImageOrientationRight) {
        
        selectedImage = [selectedImage rotateImgByDegrees:90.0];
    }
    
    if (picker.sourceType == UIImagePickerControllerSourceTypeCamera) {
        
//        UIImageWriteToSavedPhotosAlbum(selectedImage, nil, nil, nil);
        
        if (!_obtainSingleImage) {
//            [ImageUtils shareInstance].imageNumberAlreadySelected ++;
        }
        
        [picker dismissViewControllerAnimated:YES completion:nil];
    }
    else if(picker.sourceType == UIImagePickerControllerSourceTypePhotoLibrary) {
        
        if (IS_DEVICE_IPHONE) {
            [picker dismissViewControllerAnimated:YES completion:nil];
        }
        else {
            [self.popOver dismissPopoverAnimated:YES];
        }
    }
    
    if (self.completeBlock) {
        self.completeBlock(NO,selectedImage);
    }
    [self removeFromSuperview];
}


- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker
{
    if (picker.sourceType == UIImagePickerControllerSourceTypeCamera) {
        
        [picker dismissViewControllerAnimated:YES completion:nil];
    }
    else if(picker.sourceType == UIImagePickerControllerSourceTypePhotoLibrary){
        
        if (IS_DEVICE_IPHONE) {
            [picker dismissViewControllerAnimated:YES completion:nil];
        }
        else {
            [self.popOver dismissPopoverAnimated:YES];
        }
    }
    
    if (self.completeBlock) {
        self.completeBlock(YES,nil);
    }
    [self removeFromSuperview];
}


#pragma mark -- popover

- (void)popoverControllerDidDismissPopover:(UIPopoverController *)popoverController
{
    [self removeFromSuperview];
}


@end

