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


#import "WHEFetchImageGroup.h"

@implementation WHEFetchImageGroup

+ (WHEFetchImageGroup *)getFetchImageGroupWithAssetsGroup:(ALAssetsGroup *)assetsGroup hasVideo:(BOOL)hasVideoFlag
{
    WHEFetchImageGroup *fetchImageGroup = [[WHEFetchImageGroup alloc] init];
    if (!hasVideoFlag) {
        [assetsGroup setAssetsFilter:[ALAssetsFilter allPhotos]];
    }
    
    NSString *name = [assetsGroup valueForProperty:ALAssetsGroupPropertyName];
    NSInteger count = [assetsGroup numberOfAssets];
    fetchImageGroup.title = [NSString stringWithFormat:@"%@ (%zd)",name,count];
    fetchImageGroup.data = assetsGroup;
    fetchImageGroup.name = name;
    return fetchImageGroup;
}


+ (WHEFetchImageGroup *)getFetchImageGroupWithAssetCollection:(PHAssetCollection *)assetCollection hasVideo:(BOOL)hasVideoFlag
{
    // 此处v7.1.0 热修复代码
    if (!assetCollection || ![assetCollection isKindOfClass:[PHAssetCollection class]]) {
        return nil;
    }
    
    WHEFetchImageGroup *fetchImageGroup = [[WHEFetchImageGroup alloc] init];
    
    PHFetchOptions *fetchOptions = [[PHFetchOptions alloc] init];
    // 默认排序 Passing "nil" for options gets the default
    //    fetchOptions.sortDescriptors = @[[NSSortDescriptor sortDescriptorWithKey:@"modificationDate" ascending:YES]];
    if (!hasVideoFlag) {
        fetchOptions.predicate = [NSPredicate predicateWithFormat:@"mediaType = %d",PHAssetMediaTypeImage];
    }
    
    PHFetchResult *fetchResult = [PHAsset fetchAssetsInAssetCollection:assetCollection options:fetchOptions];
    if (fetchResult.count > 0) {
        NSString *name = assetCollection.localizedTitle;
        NSInteger count = [fetchResult count];
        fetchImageGroup.title = [NSString stringWithFormat:@"%@ (%zd)",name,count];
        fetchImageGroup.data = fetchResult;
        fetchImageGroup.name = name;
        return fetchImageGroup;
    } else {
        return nil;
    }
}
@end

