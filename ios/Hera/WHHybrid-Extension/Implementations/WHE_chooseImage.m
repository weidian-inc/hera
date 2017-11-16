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


#import "WHE_chooseImage.h"
#import <UIKit/UIKit.h>
#import "WHEImagePickerView.h"
#import "WHEImagePickerManager.h"
#import "WHECommonUtil.h"
#import "WHECryptUtil.h"
#import "WHEMacro.h"
#import "WDHApp.h"
#import "WDHAppManager.h"
#import "WDHFileManager.h"
#import "WDHAppInfo.h"
#import "WHEImageProcessor.h"

@interface WHE_chooseImage()

@end

@implementation WHE_chooseImage

- (void)setupApiWithSuccess:(void(^_Null_unspecified)(NSDictionary<NSString *, id> * _Nonnull))success
					failure:(void(^_Null_unspecified)(id _Nullable))failure
					 cancel:(void(^_Null_unspecified)(void))cancel
{
	NSString *count = self.count;
	if (!count) {
		self.count = @"9";
	}
	
	NSArray *sizeTypes = self.sizeType;
	if (!sizeTypes) {
		self.sizeType = @[@"original",@"compressed"];
	}
	
	NSArray *sourceTypes = self.sourceType;
	if (!sourceTypes) {
		self.sourceType = @[@"album",@"camera"];
	}
	
	BOOL albumEnabled = [sourceTypes containsObject:@"album"];
	BOOL cameraEnabled = [sourceTypes containsObject:@"camera"];
	
	UIAlertController *alertController = nil;
	
	if([[UIDevice currentDevice] userInterfaceIdiom] == UIUserInterfaceIdiomPad) {
		alertController = [UIAlertController alertControllerWithTitle:nil message:nil preferredStyle:UIAlertControllerStyleAlert];
	} else {
		alertController = [UIAlertController alertControllerWithTitle:nil message:nil preferredStyle:UIAlertControllerStyleActionSheet];
	}
	
    if (albumEnabled) {
        UIAlertAction *albumAction = [UIAlertAction actionWithTitle:@"相册" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {

            WHEImagePickerManager *manager = [WHEImagePickerManager shareInstance];
            manager.maxSelectedCount = [self.count integerValue];

            [manager presentPickMultiPicturesWithController:[WHECommonUtil currentNavigationController].topViewController imagePickerDidFinishPickBlock:^(BOOL isCancel, NSArray *imageArray) {
                //图片处理
                if (isCancel) {
                    if (cancel) {
                        cancel();
                    }
                }else {
                    [self editImages:imageArray withSuccess:success];
                }
            }];

        }];

        [alertController addAction:albumAction];
    }


    if (cameraEnabled){
        UIAlertAction *cameraAction = [UIAlertAction actionWithTitle:@"相机" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            NSLog(@"相机");
            WHEImagePickerView *pickerView = [[WHEImagePickerView alloc] init];
            pickerView.completeBlock = ^(BOOL isCancel,UIImage *image) {
                //图片处理
                if (isCancel) {
                    if (cancel) {
                        cancel();
                    }
                }else {
                    [self editImages:@[image] withSuccess:success];
                }
            };
            [pickerView actionWithParentController:[WHECommonUtil currentNavigationController].topViewController pickerType:WHEImagePickerViewTypeCamera];
        }];

        [alertController addAction:cameraAction];
    }

    UIAlertAction *cancelAction = [UIAlertAction actionWithTitle:@"取消" style:UIAlertActionStyleCancel handler:nil];
    [alertController addAction:cancelAction];

    [[WHECommonUtil currentNavigationController].topViewController presentViewController:alertController animated:YES completion:nil];
}

- (void)editImages:(NSArray *)imagesArray withSuccess:(void(^_Null_unspecified)(NSDictionary<NSString *, id> * _Nonnull))success
{
    WDHApp *app = [[WDHAppManager sharedManager] currentApp];
    NSString *tempDir = [WDHFileManager appTempDirPath:app.appInfo.appId];
    if (![[NSFileManager defaultManager] fileExistsAtPath:tempDir]) {
        [[NSFileManager defaultManager] createDirectoryAtPath:tempDir withIntermediateDirectories:YES attributes:nil error:nil];
    }

    dispatch_async(dispatch_get_global_queue(0, 0), ^{
        NSMutableArray *outputImageInfos = [NSMutableArray new];
        for (id imageObject in imagesArray) {

            UIImage *image = nil;
            if ([imageObject isKindOfClass:[NSDictionary class]]) {
                image = imageObject[@"UIImagePickerControllerOriginalImage"];
            }else {
                image = imageObject;
            }

            NSMutableDictionary *imageInfo = [NSMutableDictionary new];
            NSString *path = nil;
            if (image) {
                NSData *data = UIImagePNGRepresentation(image);
                NSString *fileMD5 = [WHECryptUtil md5WithBytes:(char *)[data bytes] length:[data length]];
                NSString *originalImageName = [NSString stringWithFormat:@"tmp_%@.jpg",fileMD5];
                NSString *originalImagePath = [tempDir stringByAppendingPathComponent:originalImageName];
                if ([data writeToFile:originalImagePath atomically:YES]) {
                    imageInfo[@"original"] = [NSString stringWithFormat:@"%@%@",WDH_FILE_SCHEMA, originalImageName];
                    path = imageInfo[@"original"];
                }
            }

            //图片压缩
            UIImage *compressedImage = [WHEImageProcessor scaleImageByOriginalProportion:image width:1080];
            if (compressedImage) {
                NSData *data = UIImagePNGRepresentation(compressedImage);
                NSString *fileMD5 = [WHECryptUtil md5WithBytes:(char *)[data bytes] length:[data length]];
                NSString *compressedImageName = [NSString stringWithFormat:@"tmp_%@.jpg",fileMD5];
                NSString *compressedImagePath = [tempDir stringByAppendingPathComponent:compressedImageName];
                if ([data writeToFile:compressedImagePath atomically:YES]) {
                    imageInfo[@"compressed"] = [NSString stringWithFormat:@"%@%@", WDH_FILE_SCHEMA, compressedImageName];
                    path = imageInfo[@"compressed"];
                }
            }

            [outputImageInfos addObject:path];
        }

        if (success) {
            success(@{@"tempFilePaths":outputImageInfos});
        }
    });
}

@end

