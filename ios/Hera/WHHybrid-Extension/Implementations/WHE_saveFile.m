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


#import "WHE_saveFile.h"
#import "WHEMacro.h"
#import "WDHAppManager.h"
#import "WDHApp.h"
#import "WDHFileManager.h"
#import "WDHAppInfo.h"
#import "WHECryptUtil.h"

@implementation WHE_saveFile

- (void)setupApiWithSuccess:(void (^)(NSDictionary<NSString *,id> * _Nonnull))success failure:(void (^)(id _Nullable))failure cancel:(void (^)(void))cancel {

    if (!self.tempFilePath) {
        failure(@{@"errMsg": @"参数tempFilePath为空"});
        return;
    }
    
    NSString *tempfileName = nil;
    if ([self.tempFilePath hasPrefix: WDH_FILE_SCHEMA]) {
        NSRange range = [self.tempFilePath rangeOfString: WDH_FILE_SCHEMA];
        tempfileName = [self.tempFilePath substringFromIndex:NSMaxRange(range)];
    } else {
        tempfileName = self.tempFilePath;
    }
	
	WDHApp *app = [[WDHAppManager sharedManager] currentApp];
    NSString *cacheDir = [WDHFileManager appTempDirPath:app.appInfo.userId];
    NSString *fileRealPath = [cacheDir stringByAppendingPathComponent:tempfileName];
    
    NSFileManager *fileManager = [NSFileManager defaultManager];
    if (![fileManager fileExistsAtPath:fileRealPath]) {
        failure(@{@"errMsg": @"文件不存在"});
        return;
    }
    
    NSData *fileData = [[NSData alloc] initWithContentsOfFile:fileRealPath];
    
    // 获取长期存储文件夹目录
    NSString *persistentDir = [WDHFileManager appPersistentDirPath:app.appInfo.appId];
    if (![fileManager fileExistsAtPath:persistentDir]) {
        [fileManager createDirectoryAtPath:persistentDir withIntermediateDirectories:YES attributes:nil error:nil];
    }
    
    // 获取当前存储文件大小 限制存储空间
    NSDirectoryEnumerator *enumerator = [fileManager enumeratorAtPath:persistentDir];
    UInt64 fileSize = 0;
    while ([enumerator nextObject]) {
        fileSize += enumerator.fileAttributes.fileSize;
    }
    
    if (fileData.length + fileSize > FILE_LIMIT_SIZE) {
        NSString *errMsg = [NSString stringWithFormat:@"本地存储空间超出%dMB大小的限制", FILE_LIMIT_SIZE / 1024 / 1024];
        failure(@{@"errMsg": errMsg});
        return;
    }
    
    // 获取文件扩展名
    NSString *fileExtension = nil;
    NSRange range = [tempfileName rangeOfString:@"." options:NSBackwardsSearch];
    if (range.location != NSNotFound) {
        fileExtension = [tempfileName substringFromIndex:NSMaxRange(range)];
    } else {
        fileExtension = @"";
    }

    // 写入持久化文件
    NSString *fileMD5 = [WHECryptUtil md5WithBytes:(char *)fileData.bytes length:fileData.length];
    NSString *fileName = [NSString stringWithFormat:@"store_%@.%@", fileMD5, fileExtension];
    NSString *persistentPath = [persistentDir stringByAppendingPathComponent:fileName];
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        if ([fileManager createFileAtPath:persistentPath contents:fileData attributes:nil]) {
            success(@{@"savedFilePath": [NSString stringWithFormat:@"%@%@", WDH_FILE_SCHEMA, fileName]});
        } else {
            failure(@{@"errMsg": @"保存文件失败"});
        }
    });
}

@end

