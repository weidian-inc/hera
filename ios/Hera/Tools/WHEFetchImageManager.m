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


#import "WHEFetchImageManager.h"
#import <Photos/Photos.h>
#import "ALAssetsLibrary+WHEAssetsLibrary.h"
#import "WHEFetchImageAsset.h"

NSString *const KFetchPreviewImageSuccessNotification  = @"FetchPreviewImageSuccessNotification";

@implementation WHEFetchImageManager

+ (WHEFetchImageManager *)sharedInstance
{
    static WHEFetchImageManager *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
    });
    
    return sharedInstance;
}
+ (void)requestAuthorization:(void (^)(WHEFetchImageAuthorizationStatus))handler
{
    if ([UIDevice currentDevice].systemVersion.floatValue >= 8.0) {
        // iOS 8.0 之后
        [PHPhotoLibrary requestAuthorization:^(PHAuthorizationStatus status) {
            
            WHEFetchImageAuthorizationStatus ret = WHEFetchImageAuthorizationStatusNotDetermined;
            if (status == PHAuthorizationStatusNotDetermined) {
                ret =  WHEFetchImageAuthorizationStatusNotDetermined;
            } else if (status == PHAuthorizationStatusRestricted) {
                ret = WHEFetchImageAuthorizationStatusRestricted;
            } else if (status == PHAuthorizationStatusDenied) {
                ret = WHEFetchImageAuthorizationStatusDenied;
            } else if (status == PHAuthorizationStatusAuthorized){
                ret = WHEFetchImageAuthorizationStatusAuthorized;
            }
            if (handler) {
                // 此处为异步线程返回
                if (![NSThread currentThread].isMainThread) {
                    dispatch_async(dispatch_get_main_queue(), ^{
                        handler(ret);
                    });
                    
                } else {
                    handler(ret);
                }
            }
        }];
        
    } else {
        
        NSInteger status = [ALAssetsLibrary authorizationStatus];
        WHEFetchImageAuthorizationStatus ret = WHEFetchImageAuthorizationStatusNotDetermined;
        
        if (status == ALAuthorizationStatusNotDetermined) {
            ret = WHEFetchImageAuthorizationStatusNotDetermined;
        } else if (status == ALAuthorizationStatusRestricted) {
            ret = WHEFetchImageAuthorizationStatusRestricted;
        } else if (status == ALAuthorizationStatusDenied) {
            ret = WHEFetchImageAuthorizationStatusDenied;
        } else if (status == ALAuthorizationStatusAuthorized){
            ret = WHEFetchImageAuthorizationStatusAuthorized;
        }
        
        if (handler) {
            handler(ret);
        }
    }
}

+ (WHEFetchImageAuthorizationStatus)authorizationStatus

{
    if ([UIDevice currentDevice].systemVersion.floatValue >= 8.0) {
        // iOS 8.0 之后
        NSInteger status = [PHPhotoLibrary authorizationStatus];
        if (status == PHAuthorizationStatusNotDetermined) {
            return WHEFetchImageAuthorizationStatusNotDetermined;
        } else if (status == PHAuthorizationStatusRestricted) {
            return WHEFetchImageAuthorizationStatusRestricted;
        } else if (status == PHAuthorizationStatusDenied) {
            return WHEFetchImageAuthorizationStatusDenied;
        } else if (status == PHAuthorizationStatusAuthorized){
            return WHEFetchImageAuthorizationStatusAuthorized;
        }
        
        return WHEFetchImageAuthorizationStatusAuthorized;
        
    } else {
        
        NSInteger status = [ALAssetsLibrary authorizationStatus];
        if (status == ALAuthorizationStatusNotDetermined) {
            return WHEFetchImageAuthorizationStatusNotDetermined;
        } else if (status == ALAuthorizationStatusRestricted) {
            return WHEFetchImageAuthorizationStatusRestricted;
        } else if (status == ALAuthorizationStatusDenied) {
            return WHEFetchImageAuthorizationStatusDenied;
        } else if (status == ALAuthorizationStatusAuthorized){
            return WHEFetchImageAuthorizationStatusAuthorized;
        }
        
        return WHEFetchImageAuthorizationStatusAuthorized;
    }
}

- (BOOL)isFirstGroup:(WHEFetchImageGroup *)group
{
    
    BOOL flag = NO;
    if (group) {
        if ([group.name isEqualToString:@"所有照片"] || [group.name isEqualToString:@"All Photos"] ||
            [group.name isEqualToString:@"相机胶卷"] || [group.name isEqualToString:@"Camera Roll"]) {
            // sort 1
            flag = YES;
        }
    }
    return flag;
}


- (void)fetchImageGroupHasVideo:(BOOL)hasVideoFlag completion:(void (^)(NSArray<WHEFetchImageGroup *> *))completion
{
    NSMutableArray *resultArray = [[NSMutableArray alloc] init];
    if ([UIDevice currentDevice].systemVersion.floatValue >= 8.0) {
        
        // 相机的相册
        PHFetchResult *smartAlbum = [PHAssetCollection fetchAssetCollectionsWithType:PHAssetCollectionTypeSmartAlbum
                                                                             subtype:PHAssetCollectionSubtypeAny
                                                                             options:nil];
        for (PHAssetCollection *collection in smartAlbum) {
            WHEFetchImageGroup *group = [WHEFetchImageGroup getFetchImageGroupWithAssetCollection:collection hasVideo:hasVideoFlag];
            if (group) {
                //
                if ([self isFirstGroup:group]) {
                    [resultArray insertObject:group atIndex:0];
                } else {
                    [resultArray addObject:group];
                }
            }
        }
        
        // 衍生的相册
        PHFetchResult *streamAlbum = [PHAssetCollection fetchAssetCollectionsWithType:PHAssetCollectionTypeAlbum
                                                                              subtype:PHAssetCollectionSubtypeAny
                                                                              options:nil];
        for (PHAssetCollection *collection in streamAlbum) {
            WHEFetchImageGroup *group = [WHEFetchImageGroup getFetchImageGroupWithAssetCollection:collection hasVideo:hasVideoFlag];
            if (group) {
                if ([group.name isEqualToString:@"我的照片流"] || [group.name isEqualToString:@"My Photo Stream"]) {
                    WHEFetchImageGroup *firstGroup = [resultArray firstObject];
                    if ([self isFirstGroup:firstGroup]) {
                        // sort 2
                        [resultArray insertObject:group atIndex:1];
                    } else {
                        [resultArray insertObject:group atIndex:0];
                    }
                } else {
                    [resultArray addObject:group];
                }
            }
        }
        
        if (completion) {
            completion(resultArray);
        }
        
    } else {
        
        ALAssetsFilter *filter = [ALAssetsFilter allAssets];
        [[ALAssetsLibrary defaultAssetsLibrary] gl_assetsGroupsWithTypes:ALAssetsGroupAll
                                                            assetsFilter:filter
                                                              completion:^(NSArray<ALAssetsGroup *> *groupArray) {
                                                                  
                                                                  for (ALAssetsGroup *group in groupArray) {
                                                                      WHEFetchImageGroup *fetchImageGroup = [WHEFetchImageGroup getFetchImageGroupWithAssetsGroup:group hasVideo:hasVideoFlag];
                                                                      [resultArray addObject:fetchImageGroup];
                                                                  }
                                                                  if (completion) {
                                                                      completion(resultArray);
                                                                  }
                                                                  
                                                                  
                                                              } failure:^(NSError *error) {
                                                                  
                                                                  if (completion) {
                                                                      completion(resultArray);
                                                                  }
                                                              }];
    }
}

/**
 *  获取 分组下的照片
 */
- (void)fetchImageAssetArrayHasVideo:(BOOL)hasVideoFlag
                               group:(WHEFetchImageGroup *)group
                          completion:(void (^) (NSArray <WHEFetchImageAsset *> *imageAssetArray))completion
{
    NSMutableArray *retArray = [[NSMutableArray alloc] init];
    
    if ([group.data isKindOfClass:[PHFetchResult class]]) {
        
        PHFetchResult *fetchResult = group.data;
        [fetchResult enumerateObjectsUsingBlock:^(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
            if (obj) {
                [retArray addObject:[WHEFetchImageAsset getFetchImageAsseWithPHAsset:obj]];
            }
        }];
        
        if (completion) {
            completion(retArray);
        }
    } else if ([group.data isKindOfClass:[ALAssetsGroup class]]) {
        
        ALAssetsGroup *assetsGroup = group.data;
        [assetsGroup enumerateAssetsUsingBlock:^(ALAsset *result, NSUInteger index, BOOL *stop) {
            //
            if (result) {
                [retArray addObject:[WHEFetchImageAsset getFetchImageAsseWithALAsset:result]];
            } else {
                // if finished,result set to nil
                if (completion) {
                    completion(retArray);
                }
            }
        }];
    }
}

/**
 *  获取 分组照片的PostImage
 *
 *  @param group      分组
 *  @param completion block
 */
- (void)fetchPostImageWithGroup:(WHEFetchImageGroup *)group targetSize:(CGSize)targetSize completion:(void (^)(UIImage *))completion
{
    // image
    if ([group.data isKindOfClass:[PHFetchResult class]]) {
        PHFetchResult *fetchResult = group.data;
        if (fetchResult.count > 0) {
            [[PHImageManager defaultManager] requestImageForAsset:fetchResult.lastObject
                                                       targetSize:targetSize
                                                      contentMode:PHImageContentModeAspectFill
                                                          options:nil
                                                    resultHandler:^(UIImage * _Nullable result, NSDictionary * _Nullable info) {
                                                        //
                                                        if (completion) {
                                                            completion(result);
                                                        }
                                                    }];
        } else {
            if (completion) {
                completion(nil);
            }
        }
    } else if ([group.data isKindOfClass:[ALAssetsGroup class]]) {
        
        ALAssetsGroup *assetsGroup = group.data;
        UIImage *postImage = [UIImage imageWithCGImage:assetsGroup.posterImage];
        if (completion) completion(postImage);
    }
}


- (void)fetchImageWithAsset:(WHEFetchImageAsset *)fetchImageAsset targetSize:(CGSize)targetSize completion:(void (^)(UIImage *))completion progress:(void (^)(double))currentProgress
{
    if ([fetchImageAsset.data isKindOfClass:[ALAsset class]]) {
        ALAsset *alAsset = fetchImageAsset.data;
        UIImage *image = [UIImage imageWithCGImage:alAsset.aspectRatioThumbnail];
        if (completion) {
            completion(image);
        }
    } else if ([fetchImageAsset.data isKindOfClass:[PHAsset class]]) {
        
        CGFloat scale = [UIScreen mainScreen].scale;
        CGSize fullScreenSize = CGSizeMake([UIScreen mainScreen].bounds.size.width * scale, [UIScreen mainScreen].bounds.size.height * scale);
        
        PHImageRequestOptions *options = [[PHImageRequestOptions alloc] init];
        options.deliveryMode = PHImageRequestOptionsDeliveryModeOpportunistic;
        options.networkAccessAllowed = YES;
        options.progressHandler = ^(double progress, NSError *error, BOOL *stop, NSDictionary *info) {
            
            if (progress < 0.01) {
                progress = 0.01;
            }
            fetchImageAsset.progress = progress;
            
            if (currentProgress) {
                currentProgress(progress);
            }
            
            if (CGSizeEqualToSize(targetSize, fullScreenSize)) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    [[NSNotificationCenter defaultCenter] postNotificationName:KFetchPreviewImageSuccessNotification object:nil];
                });
            }
        };
        
        
        
        [[PHImageManager defaultManager] requestImageForAsset:fetchImageAsset.data
                                                   targetSize:targetSize
                                                  contentMode:PHImageContentModeAspectFill
                                                      options:options
                                                resultHandler:^(UIImage * _Nullable result, NSDictionary * _Nullable info) {
                                                    
                                                    if (completion) {
                                                        completion(result);
                                                    }
                                                    if (![[info objectForKey:@"PHImageResultIsDegradedKey"] boolValue] && CGSizeEqualToSize(targetSize, fullScreenSize)) {
                                                        
                                                        fetchImageAsset.fullScreenImage = result;
                                                        fetchImageAsset.progress = 1;
                                                        
                                                        dispatch_async(dispatch_get_main_queue(), ^{
                                                            [[NSNotificationCenter defaultCenter] postNotificationName:KFetchPreviewImageSuccessNotification object:nil];
                                                        });
                                                    }
                                                }];
    }
}


- (void)fetchPreviewImageWithAsset:(WHEFetchImageAsset *)fetchImageAsset completion:(void (^)(UIImage *))completion progress:(void (^)(double))currentProgress
{
    if ([fetchImageAsset.data isKindOfClass:[ALAsset class]]) {
        ALAsset *alAsset = fetchImageAsset.data;
        UIImage *fullScreenImage = [UIImage imageWithCGImage:[[alAsset defaultRepresentation] fullScreenImage]];
        if (fullScreenImage) {
            if (completion) {
                completion(fullScreenImage);
            }
        }
    } else if ([fetchImageAsset.data isKindOfClass:[PHAsset class]]) {
        
        CGFloat scale = [UIScreen mainScreen].scale;
        CGSize size = CGSizeMake([UIScreen mainScreen].bounds.size.width * scale, [UIScreen mainScreen].bounds.size.height * scale);
        [self fetchImageWithAsset:fetchImageAsset targetSize:size completion:^(UIImage *image) {
            if (completion) {
                completion(image);
            }
        } progress:^(double progress) {
            if (currentProgress) {
                
                currentProgress(progress);
            }
        }];
    }
}

- (BOOL)checkImageIsInLocalAblumWithAsset:(WHEFetchImageAsset *)fetchImageAsset
{
    if ([fetchImageAsset.data isKindOfClass:[PHAsset class]]) {
        PHImageRequestOptions *option = [[PHImageRequestOptions alloc] init];
        option.networkAccessAllowed = NO;
        option.synchronous = YES;
        option.deliveryMode = PHImageRequestOptionsDeliveryModeHighQualityFormat;
        __block BOOL isInLocalAblum = YES;
        
        
        CGFloat scale = [UIScreen mainScreen].scale;
        CGSize size = CGSizeMake([UIScreen mainScreen].bounds.size.width * scale, [UIScreen mainScreen].bounds.size.height * scale);
        
        [[PHImageManager defaultManager] requestImageForAsset:fetchImageAsset.data
                                                   targetSize:size
                                                  contentMode:PHImageContentModeAspectFill
                                                      options:option
                                                resultHandler:^(UIImage * _Nullable result, NSDictionary * _Nullable info) {
                                                    
                                                    if (result) {
                                                        isInLocalAblum = YES;
                                                        fetchImageAsset.progress = 1;
                                                        fetchImageAsset.fullScreenImage = result;
                                                    } else {
                                                        isInLocalAblum = NO;
                                                    }
                                                }];
        return isInLocalAblum;
        
    } else if ([fetchImageAsset.data isKindOfClass:[ALAsset class]]) {
        return YES;
    }
    
    return YES;
}

@end

