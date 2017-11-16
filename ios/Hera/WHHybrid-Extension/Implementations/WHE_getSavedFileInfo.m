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


#import "WHE_getSavedFileInfo.h"
#import "WHEMacro.h"
#import "WDHApp.h"
#import "WDHAppManager.h"
#import "WDHFileManager.h"
#import "WDHAppInfo.h"

@implementation WHE_getSavedFileInfo

- (void)setupApiWithSuccess:(void (^)(NSDictionary<NSString *,id> * _Nonnull))success failure:(void (^)(id _Nullable))failure cancel:(void (^)(void))cancel {
    
    if (!self.filePath) {
        failure(@{@"errMsg": @"参数filePath为空"});
        return;
    }

    NSString *fileName = nil;
    if ([self.filePath hasPrefix:WDH_FILE_SCHEMA]) {
        NSRange range = [self.filePath rangeOfString:WDH_FILE_SCHEMA];
        fileName = [self.filePath substringFromIndex:NSMaxRange(range)];
    } else {
        fileName = self.filePath;
    }
    
    // 获取真实路径
	WDHApp *app = [[WDHAppManager sharedManager] currentApp];
    NSString *persistDir = [WDHFileManager appPersistentDirPath:app.appInfo.appId];
    NSString *fileRealPath = [persistDir stringByAppendingPathComponent:fileName];
    NSFileManager *fileManager = [NSFileManager defaultManager];
    if (![fileManager fileExistsAtPath:fileRealPath]) {
        failure(@{@"errMsg": @"文件不存在"});
        return;
    }
    
    NSDictionary *fileAttributes = [fileManager attributesOfItemAtPath:fileRealPath error:nil];
    UInt64 fileSize = fileAttributes.fileSize;
    NSDate *createDt = fileAttributes.fileCreationDate;
    
    success(@{@"errMsg": @"获取文件信息成功", @"size": @(fileSize), @"createTime": @(createDt.timeIntervalSince1970)});
}

@end

