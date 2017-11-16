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
#import "WHEFetchImageGroup.h"
#import "WHEFetchImageAsset.h"

/// 将要显示的时候 会发送此 通知 object 为 GLSelectView 实例
extern NSString *const KFetchPreviewImageSuccessNotification;

typedef NS_ENUM(NSInteger, WHEFetchImageAuthorizationStatus) {
    WHEFetchImageAuthorizationStatusNotDetermined = 0, // User has not yet made a choice with regards to this application
    WHEFetchImageAuthorizationStatusRestricted,        // This application is not authorized to access photo data.
    // The user cannot change this application’s status, possibly due to active restrictions
    //   such as parental controls being in place.
    WHEFetchImageAuthorizationStatusDenied,            // User has explicitly denied this application access to photos data.
    WHEFetchImageAuthorizationStatusAuthorized         // User has authorized this application to access photos data.
} ;


@interface WHEFetchImageManager : NSObject

/**
 *  选图 实例
 *
 *  @return 实例
 */
+ (WHEFetchImageManager *)sharedInstance;

/**
 *  获取照片的访问权限
 *
 *  @return GLFetchImageAuthorizationStatus
 */
+ (WHEFetchImageAuthorizationStatus)authorizationStatus;



+ (void)requestAuthorization:(void(^)(WHEFetchImageAuthorizationStatus status))handler;

/**
 *  获取照片的分组
 *
 *  @param hasVideoFlag 是否包含视频
 *  @param completion   完成block
 */
- (void)fetchImageGroupHasVideo:(BOOL)hasVideoFlag
                     completion:(void (^) (NSArray<WHEFetchImageGroup *> *groupArray))completion;

/**
 *  获取 分组下的照片
 *
 *  @param hasVideoFlag 是否包含视频 暂时无用
 *  @param group 分组
 *  @param completion 回调
 */
- (void)fetchImageAssetArrayHasVideo:(BOOL)hasVideoFlag
                               group:(WHEFetchImageGroup *)group
                          completion:(void (^) (NSArray <WHEFetchImageAsset *> *imageAssetArray))completion;

/**
 *  选出 分组 PostImage
 *
 *  @param group      分组
 *  @param completion 回到
 */
- (void)fetchPostImageWithGroup:(WHEFetchImageGroup *)group
                     targetSize:(CGSize)targetSize
                     completion:(void (^)(UIImage *postImage))completion;
/**
 *  选出 图片
 *
 */
- (void)fetchImageWithAsset:(WHEFetchImageAsset *)fetchImageAsset
                 targetSize:(CGSize)targetSize
                 completion:(void (^)(UIImage *image))completion progress:(void (^)(double progress))currentProgress;

/**
 *  选出 预览的图
 *
 */
- (void)fetchPreviewImageWithAsset:(WHEFetchImageAsset *)fetchImageAsset
                        completion:(void (^)(UIImage *previewImage))completion progress:(void (^)(double progress))currentProgress;



/**
 *  检查图片 是否在本地
 *
 */
- (BOOL)checkImageIsInLocalAblumWithAsset:(WHEFetchImageAsset *)fetchImageAsset;


@end

