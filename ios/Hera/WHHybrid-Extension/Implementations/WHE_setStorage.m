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


#import "WHE_setStorage.h"
#import "WHEMacro.h"
#import "WHEStorageUtil.h"
#import "WDHAppManager.h"
#import "WDHAppInfo.h"
#import "WDHApp.h"
#import "WDHFileManager.h"

@implementation WHE_setStorage

- (void)setupApiWithSuccess:(void (^)(NSDictionary<NSString *,id> * _Nonnull))success failure:(void (^)(id _Nullable))failure cancel:(void (^)(void))cancel {
    
    // 避免Number类型被转换为String类型
    id data = self.param[@"data"];
    
    if (!self.key || !data) {
        failure(@{@"errMsg": @"参数不能为空"});
        return;
    }
    
    // 获取storage目录
    NSFileManager *fileManager = [NSFileManager defaultManager];
	WDHApp *app = [[WDHAppManager sharedManager] currentApp];
	NSString *storageDirPath = [WDHFileManager appStorageDirPath:app.appInfo.appId];
    if (![fileManager fileExistsAtPath:storageDirPath]) {
        [fileManager createDirectoryAtPath:storageDirPath withIntermediateDirectories:YES attributes:nil error:nil];
    }
    
    // localStorage 以用户维度隔离
	NSString *userId = app.appInfo.userId;
    NSString *filePath = [NSString stringWithFormat:@"%@/storage_%@", storageDirPath, userId];
    
    // 检查是否超出本地存储空间限制
    if ([fileManager fileExistsAtPath:filePath]) {
        NSDictionary *fileAttribues = [fileManager attributesOfItemAtPath:filePath error:nil];
        UInt64 fileSize = fileAttribues.fileSize;
        UInt64 currentSize = [WHEStorageUtil dataWithDictionary:@{self.key: data}].length;
        if (fileSize + currentSize > STORAGE_LIMIT_SIZE) {
            failure(@{@"errMsg": @"本地存储空间超出限制"});
            return;
        }
    }
    
    // 获取当前的storage
    NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithDictionary:[WHEStorageUtil dictionaryWithFilePath:filePath]];
    dic[self.key] = data;
    
    if ([WHEStorageUtil saveDictionary:dic toPath:filePath]) {
        success(@{@"errMsg": @"存储数据成功"});
    } else {
        failure(@{@"errMsg": @"存储数据失败"});
    }
    
}


@end

