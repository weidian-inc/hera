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


#import <AssetsLibrary/AssetsLibrary.h>
#import "WHE_saveImageToPhotosAlbum.h"
#import "WHEMacro.h"
#import "WDHAppManager.h"
#import "WDHApp.h"
#import "WDHAppInfo.h"
#import "WDHFileManager.h"
#import <UIKit/UIKit.h>

@implementation WHE_saveImageToPhotosAlbum

- (void)setupApiWithSuccess:(void (^)(NSDictionary<NSString *,id> * _Nonnull))success failure:(void (^)(id _Nullable))failure cancel:(void (^)(void))cancel {

    NSString *filePath = self.filePath;
    if (!filePath) {
        failure(@{@"errMsg": @"参数filePath不合法"});
        return;
    }
	
	WDHApp *app = [[WDHAppManager sharedManager] currentApp];
    NSString *fileRootPath = [WDHFileManager appTempDirPath:app.appInfo.appId];
    NSString *fileName = nil;
    
    if ([filePath hasPrefix: WDH_FILE_SCHEMA]) {
        NSRange range = [filePath rangeOfString: WDH_FILE_SCHEMA];
        fileName = [filePath substringFromIndex:NSMaxRange(range)];
    }
    
    NSString *localFilePath = [fileRootPath stringByAppendingPathComponent:fileName];
    UIImage *image = [UIImage imageWithContentsOfFile:localFilePath];
    
    if (!image) {
        failure(@{@"errMsg": @"图片不存在"});
        return;
    }

    __block ALAssetsLibrary *lib = [[ALAssetsLibrary alloc] init];
    [lib writeImageToSavedPhotosAlbum:image.CGImage metadata:nil completionBlock:^(NSURL *assetURL, NSError *error) {
        if (error) {
            failure(@{@"errMsg": error.localizedDescription});
        } else {
            success(@{@"msg": @"保存图片到相册成功"});
        }
        
        lib = nil;
    }];
}

@end

