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


#import "WHE_playVoice.h"
#import "WHEMacro.h"
#import "WHEAVManager.h"
#import "WDHAppManager.h"
#import "WDHApp.h"
#import "WDHFileManager.h"
#import "WDHAppInfo.h"

@implementation WHE_playVoice

- (void)setupApiWithSuccess:(void (^)(NSDictionary<NSString *,id> * _Nonnull))success failure:(void (^)(id _Nullable))failure cancel:(void (^)(void))cancel {

    if (!self.filePath) {
        failure(@{@"errMsg": @"参数filePath 不能为空"});
        return;
    }
    
    NSURL *fileUrl = nil;
	WDHApp *app = [[WDHAppManager sharedManager] currentApp];
    if ([self.filePath hasPrefix:[WDH_FILE_SCHEMA stringByAppendingString:@"tmp_"]]) {
        NSString *fileName = [self getFileName:self.filePath];
        NSString *fileRealPath = [[WDHFileManager appTempDirPath:app.appInfo.appId] stringByAppendingPathComponent:fileName];
        fileUrl = [NSURL fileURLWithPath:fileRealPath];
    } else if ([self.filePath hasPrefix:[WDH_FILE_SCHEMA stringByAppendingString:@"store_"]]) {
        NSString *fileName = [self getFileName:self.filePath];
        NSString *fileRealPath = [[WDHFileManager appPersistentDirPath:app.appInfo.appId] stringByAppendingPathComponent:fileName];
        fileUrl = [NSURL fileURLWithPath:fileRealPath];
    } else {
        fileUrl = [NSURL URLWithString:self.filePath];
    }
    
    [[WHEAVManager sharedManager] startPlayVoice:fileUrl fail:^(NSString *errMsg) {
        failure(@{@"errMsg": errMsg});
    }];
}

- (NSString *)getFileName:(NSString *)filePath {
    NSRange range = [filePath rangeOfString: WDH_FILE_SCHEMA];
    NSString *fileName = [filePath substringFromIndex:NSMaxRange(range)];
    return fileName;
}

@end

