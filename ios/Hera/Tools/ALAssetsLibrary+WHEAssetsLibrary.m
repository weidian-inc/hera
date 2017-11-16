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


#import "ALAssetsLibrary+WHEAssetsLibrary.h"

@implementation ALAssetsLibrary (WHEAssetsLibrary)


+ (ALAssetsLibrary *)defaultAssetsLibrary
{
    static dispatch_once_t pred = 0;
    static ALAssetsLibrary *library = nil;
    dispatch_once(&pred, ^{
        library = [[ALAssetsLibrary alloc] init];
    });
    return library;
}



- (void)gl_assetsGroupsWithTypes:(ALAssetsGroupType)types
                    assetsFilter:(ALAssetsFilter *)filter
                      completion:(void (^)(NSArray<ALAssetsGroup *> *))completion
                         failure:(void (^)(NSError *))failure

{
    NSMutableDictionary *dictionary = [NSMutableDictionary dictionary];
    [self
     enumerateGroupsWithTypes:types
     usingBlock:^(ALAssetsGroup *group, BOOL *stop) {
         if (group) {
             [group setAssetsFilter:filter];
             // 展示 分组为0的
             if ([group numberOfAssets] > 0) {
                 NSNumber *type = [group valueForProperty:ALAssetsGroupPropertyType];
                 NSMutableArray *groups = [dictionary objectForKey:type];
                 if (groups == nil) {
                     groups = [NSMutableArray arrayWithCapacity:1];
                     [dictionary setObject:groups forKey:type];
                 }
                 [groups addObject:group];
             }
         }
         else {
             
             // declare types
             static dispatch_once_t token;
             static NSArray *types = nil;
             dispatch_once(&token, ^{
                 types = @[
                           @(ALAssetsGroupSavedPhotos),
                           @(ALAssetsGroupPhotoStream),
                           @(ALAssetsGroupLibrary),
                           @(ALAssetsGroupAlbum),
                           @(ALAssetsGroupEvent),
                           @(ALAssetsGroupFaces)
                           ];
             });
            
             // sort known groups into final container
             NSMutableArray *array = [NSMutableArray array];
             for (NSNumber *typeNumber in types) {
                 NSMutableArray *groups = [dictionary objectForKey:typeNumber];
                 ALAssetsGroupType type = [typeNumber unsignedIntegerValue];
                 if (type != ALAssetsGroupEvent) {
                     // 同类型 排序
                     [groups sortUsingComparator:^NSComparisonResult(id obj1, id obj2) {
                         NSString *name1 = [obj1 valueForProperty:ALAssetsGroupPropertyName];
                         NSString *name2 = [obj2 valueForProperty:ALAssetsGroupPropertyName];
                         return [name1 localizedCompare:name2];
                     }];
                 }
                 [array addObjectsFromArray:groups];
                 [dictionary removeObjectForKey:typeNumber];
             }
             
             // call completion
             if (completion) {
                 dispatch_async(dispatch_get_main_queue(), ^{ completion([array copy]); });
             }
             
         }
     }
     failureBlock:^(NSError *error) {
         if (failure) {
             dispatch_async(dispatch_get_main_queue(), ^{ failure(error); });
         }
     }];
}




/**
 *  Get assets belonging to a certain group with the newest asset appearing first.
 *
 *  @param URL        The URL that identifies the desired group.
 *  @param filter     Filter the types of assets returned.
 *  @param completion Called on the main thread with an array of assets and a reference to the selected group.
 *  @param failure    Called on the main thread with an error.
 */
- (void)gl_assetsInGroupGroupWithURL:(NSURL *)URL
                        assetsFilter:(ALAssetsFilter *)filter
                          completion:(void (^) (ALAssetsGroup *group, NSArray *assets))completion
                             failure:(void (^) (NSError *error))failure {
    [self
     groupForURL:URL
     resultBlock:^(ALAssetsGroup *group) {
         NSMutableArray *assets = nil;
         if (group) {
             [group setAssetsFilter:filter];
             assets = [NSMutableArray arrayWithCapacity:[group numberOfAssets]];
             [group enumerateAssetsUsingBlock:^(ALAsset *result, NSUInteger index, BOOL *stop) {
                 if (result) { [assets addObject:result]; }
             }];
         }
         if (completion) {
             dispatch_async(dispatch_get_main_queue(), ^{ completion(group, assets); });
         }
     }
     failureBlock:^(NSError *error) {
         if (failure) {
             dispatch_async(dispatch_get_main_queue(), ^{ failure(error); });
         }
     }];
}


@end

