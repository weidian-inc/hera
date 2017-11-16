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


#import "WHE_getImageInfo.h"
#import "WDHApp.h"
#import "WDHAppManager.h"
#import "WDHAppInfo.h"
#import "WDHFileManager.h"
#import <UIKit/UIKit.h>

@implementation WHE_getImageInfo

- (void)setupApiWithSuccess:(void(^_Null_unspecified)(NSDictionary<NSString *, id> * _Nonnull))success
                    failure:(void(^_Null_unspecified)(id _Nullable))failure
                     cancel:(void(^_Null_unspecified)(void))cancel
{
    NSString *filePath = self.src;
    if (!filePath) {
        if (failure) {
            failure(@{@"error":@"字段不齐全!"});
        }
        
        return;
    }
    
    NSURL *fileURL = [NSURL URLWithString:filePath];
	WDHApp *app = [[WDHAppManager sharedManager] currentApp];
    NSString *fileRootPath = [WDHFileManager appTempDirPath:app.appInfo.appId];
    NSString *fileName = fileURL.lastPathComponent;
    NSString *localFilePath = [fileRootPath stringByAppendingPathComponent:fileName];
    
    UIImage *image = [[UIImage alloc] initWithContentsOfFile:localFilePath];
    
    if (!image) {
        if (failure) {
            failure(@{@"error":@"本地图片不存在！"});
        }
        return;
    }
    
    CGSize size = image.size;
    
    if (success) {
        success(@{@"width":[NSString stringWithFormat:@"%@",@(size.width)],@"height":[NSString stringWithFormat:@"%@",@(size.height)],@"path":localFilePath});
    }
}

@end

