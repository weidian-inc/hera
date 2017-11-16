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


#import "WHEImagePickerManager.h"
#import <AssetsLibrary/AssetsLibrary.h>
#import "WHEImageProcessor.h"
#import "WHEFetchImageController.h"

@interface WHEImagePickerManager ()

@property (nonatomic, weak) UIViewController *parentViewController;
@property (nonatomic, copy) imagePickerDidFinishPickBlock   pickBlock;

@end

static WHEImagePickerManager *instance = nil;

@implementation WHEImagePickerManager


+ (WHEImagePickerManager*)shareInstance
{
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
        instance = [[WHEImagePickerManager alloc] init];
    });
    return instance;
}


- (NSDictionary *)phAssetDicWithFullScreenImage:(UIImage *)fullScreenImage
{
    @autoreleasepool {
        NSMutableDictionary *retDictionary = [[NSMutableDictionary alloc] init];
        if (NSClassFromString(@"WDSConfigManager")) {
            CGFloat expectedWidth = 1080;
            // scale
            NSData * data = UIImageJPEGRepresentation(fullScreenImage, 1);
            NSLog(@"************************** dataLength:%zd  size w:%f  size h:%f", data.length, fullScreenImage.size.width, fullScreenImage.size.height);
            
            if (fullScreenImage.size.width > expectedWidth) {
                
                fullScreenImage = [WHEImageProcessor scaleImageByOriginalProportion:fullScreenImage width:expectedWidth];
            }
        }
        
        if (fullScreenImage) {
            [retDictionary setObject:fullScreenImage forKey:@"UIImagePickerControllerOriginalImage"];
        }
        return retDictionary;
    }
}


- (NSDictionary *)alAssetDicWithALAsset:(ALAsset *)alAsset
{
    
    NSMutableDictionary *workingDictionary = [[NSMutableDictionary alloc] init];
    [workingDictionary setObject:[alAsset valueForProperty:ALAssetPropertyType]
                          forKey:@"UIImagePickerControllerMediaType"];
    
    ALAssetRepresentation *assetRep = [alAsset defaultRepresentation];
    // 处理图片方向
    ALAssetOrientation alOrientation = [assetRep orientation];
    UIImageOrientation targetImageOrientation ;
    
    if (alOrientation == ALAssetOrientationUp) {
        targetImageOrientation = UIImageOrientationUp;
    } else if (alOrientation == ALAssetOrientationLeft) {
        targetImageOrientation = UIImageOrientationLeft;
    } else if (alOrientation == ALAssetOrientationDown) {
        targetImageOrientation = UIImageOrientationDown;
    } else if (alOrientation == ALAssetOrientationRight) {
        targetImageOrientation = UIImageOrientationRight;
    } else targetImageOrientation = UIImageOrientationUp;
    
    @autoreleasepool {
        CGFloat targetScale = assetRep.scale;
        CGImageRef imgRef = [assetRep fullResolutionImage];
        
        // 通过第三方工具编辑过的相册，可能会返回NULL，这里做个兼容。
        if (!imgRef) {
            imgRef = assetRep.fullScreenImage;
        }
        UIImage *img = [UIImage imageWithCGImage:imgRef
                                           scale:targetScale
                                     orientation:targetImageOrientation];
        
        if (targetImageOrientation == UIImageOrientationRight) {
            img = [img rotateImgByDegrees:90];
        }
        
        // scale
        NSData * data = UIImageJPEGRepresentation(img, 1);
        NSLog(@"************************** dataLength:%zd  size w:%f  size h:%f", data.length, img.size.width, img.size.height);
        
        
        if (NSClassFromString(@"WDSConfigManager")) {
            
            CGFloat expectedWidth = 1080;
            if (img.size.width > expectedWidth) {
                
                // scale
                UIImage *tempImg = [WHEImageProcessor scaleImageByOriginalProportion:img width:expectedWidth];
                img = nil;
                img = tempImg;
            }
        }
        [workingDictionary setObject:img forKey:@"UIImagePickerControllerOriginalImage"];
        
        
        // 这里，当相册里的图片是坏图片时，tmp会为空，所以需要做下兼容
        NSArray *tmp = [[alAsset valueForProperty:ALAssetPropertyURLs] allKeys];
        
        if (tmp && tmp.count > 0) {
            [workingDictionary setObject:[[alAsset valueForProperty:ALAssetPropertyURLs]
                                          valueForKey:[[[alAsset valueForProperty:ALAssetPropertyURLs] allKeys] objectAtIndex:0]]
                                  forKey:@"UIImagePickerControllerReferenceURL"];
        } else {
            return nil;
        }
    }
    return workingDictionary;
}



- (void)presentPickMultiPicturesWithController:(UIViewController *)parentViewController imagePickerDidFinishPickBlock:(imagePickerDidFinishPickBlock)pickBlock
{
    self.parentViewController = parentViewController;
    self.pickBlock = pickBlock;
    
    
    if (parentViewController && [parentViewController isKindOfClass:[UIViewController class]]) {
        typeof(self) __weak weak_self = self;
        WHEFetchImageController *fetchImageController = [[WHEFetchImageController alloc] initWithMaxSelectedCount:self.maxSelectedCount finishBlock: ^ (NSArray *assetArray){
            
            if (weak_self.parentViewController) {
                
                [weak_self.parentViewController dismissViewControllerAnimated:YES completion:^{
                    // 图片处理
                    weak_self.parentViewController.view.userInteractionEnabled = NO;
                    
                    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                        
                        NSMutableArray *returnArray = [[NSMutableArray alloc] init];
                        
                        for(WHEFetchImageAsset *fetchImageAsset in assetArray) {
                            if ([fetchImageAsset.data isKindOfClass:[ALAsset class]]) {
                                NSDictionary *infoDic = [self alAssetDicWithALAsset:fetchImageAsset.data];
                                if (infoDic) {
                                    [returnArray addObject:infoDic];
                                }
                            } else if ([fetchImageAsset.data isKindOfClass:[PHAsset class]]) {
                                NSDictionary *infoDic = [self phAssetDicWithFullScreenImage:fetchImageAsset.fullScreenImage];
                                if (infoDic) {
                                    [returnArray addObject:infoDic];
                                }
                            }
                        }
                        
                        dispatch_async(dispatch_get_main_queue(), ^{
                            
                            //                            [WDSLoadingToastView hideLoadingToast:parentViewController.view];
                            weak_self.parentViewController.view.userInteractionEnabled = YES;
                            
                            
                            if (weak_self.pickBlock) {
                                weak_self.pickBlock(NO,returnArray);
                            }
                            
                            weak_self.parentViewController = nil;
                            weak_self.pickBlock = nil;
                        });
                    });
                }];
            }
            
        } cancelBlock:^{
            if (weak_self.parentViewController) {
                [weak_self.parentViewController dismissViewControllerAnimated:YES completion:nil];
            }
            
            if (weak_self.pickBlock) {
                weak_self.pickBlock(YES,nil);
            }
            
            weak_self.parentViewController = nil;
            weak_self.pickBlock = nil;
        }];
        
        [self.parentViewController presentViewController:fetchImageController animated:YES completion:nil];
    }
}





@end




@implementation UIImage (imagePickerExt)

/********************************************
 *
 * @brief 图片顺时针旋转
 *
 * @param degrees 旋转角度
 *
 * @return 旋转后的图片
 *
 *******************************************/
- (UIImage *)rotateImgByDegrees:(CGFloat)degrees
{
    if (degrees <= 0.0) {
        return self;
    }
    
    // box frame
    CGRect viewRect = CGRectMake(0, 0, self.size.width, self.size.height);
    
    // new image frame
    CGRect newFrame = CGRectMake(-self.size.width / 2, -self.size.height / 2, self.size.width, self.size.height);
    
    
    if (degrees == 90.0 || degrees == 270.0) {
        
        viewRect = CGRectMake(0, 0, self.size.height, self.size.width);
        newFrame = CGRectMake(-self.size.height / 2, -self.size.width / 2, self.size.height, self.size.width);
    }
    
    
    UIView *rotatedViewBox = [[UIView alloc] initWithFrame:viewRect];
    CGAffineTransform t = CGAffineTransformMakeRotation([self degreesToRadians:degrees]);
    rotatedViewBox.transform = t;
    CGSize rotatedSize = rotatedViewBox.frame.size;
    
    // Create the bitmap context
    UIGraphicsBeginImageContext(rotatedSize);
    CGContextRef bitmap = UIGraphicsGetCurrentContext();
    
    // Move the origin to the middle of the image so we will rotate and scale around the center.
    CGContextTranslateCTM(bitmap, rotatedSize.width / 2, rotatedSize.height / 2);
    
    // Rotate the image context
    CGContextRotateCTM(bitmap, [self degreesToRadians:degrees]);
    
    // Now, draw the rotated/scaled image into the context
    CGContextScaleCTM(bitmap, 1.0, -1.0);
    CGContextDrawImage(bitmap, newFrame, [self CGImage]);
    
    UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return newImage;
}

- (CGFloat)degreesToRadians:(CGFloat)degrees
{
    return degrees * M_PI / 180;
}

- (CGFloat)radiansToDegrees:(CGFloat)radians
{
    return radians * 180/M_PI;
}

@end

