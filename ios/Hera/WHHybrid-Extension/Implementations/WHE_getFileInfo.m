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


#import "WHE_getFileInfo.h"
#import "WHECryptUtil.h"
#import <CommonCrypto/CommonDigest.h>
#import "WHEMacro.h"
#import "WDHApp.h"
#import "WDHAppManager.h"
#import "WDHFileManager.h"
#import "WDHAppInfo.h"

@implementation WHE_getFileInfo

- (void)setupApiWithSuccess:(void (^)(NSDictionary<NSString *,id> * _Nonnull))success failure:(void (^)(id _Nullable))failure cancel:(void (^)(void))cancel {

    if (!self.filePath) {
        failure(@{@"errMsg": @"参数filePath为空"});
        return;
    }
    
    NSFileManager *fileManager = [NSFileManager defaultManager];
    
    NSString *fileName = nil;
    if ([self.filePath hasPrefix: WDH_FILE_SCHEMA]) {
        NSRange range = [self.filePath rangeOfString: WDH_FILE_SCHEMA];
        fileName = [self.filePath substringFromIndex:NSMaxRange(range)];
    } else {
        fileName = self.filePath;
    }
    
    //在Temp目录下查找
	WDHApp *app = [[WDHAppManager sharedManager] currentApp];
    NSString *realPath = [[WDHFileManager appTempDirPath:app.appInfo.appId] stringByAppendingPathComponent:fileName];
    if (![fileManager fileExistsAtPath:realPath]) {
        failure(@{@"errMsg": @"文件不存在"});
        return;
    }

    NSData *fileData = [NSData dataWithContentsOfFile:realPath];
    NSString *fileDigest;
    
    // 如果输入为无效值 则默认使用md5
    if ([[self.digestAlgorithm lowercaseString] isEqualToString:@"sha1"]) {
        fileDigest = [self sha1Digest:fileData];
    } else {
        fileDigest = [WHECryptUtil md5WithBytes:(char *)fileData.bytes length:fileData.length];
    }
    
    success(@{@"size": @(fileData.length), @"digest": fileDigest, @"errMsg": @"获取文件信息成功"});
}

- (NSString *)sha1Digest:(NSData *)data {
    
    NSData *hashData = [self hashData:data];
    
    NSUInteger bytesCount = hashData.length;
    if (bytesCount) {
        static char const *kHexChars = "0123456789ABCDEF";
        const unsigned char *dataBuffer = hashData.bytes;
        char *chars = malloc(sizeof(char) * (bytesCount * 2 + 1));
        char *s = chars;
        for (unsigned i = 0; i < bytesCount; ++i) {
            *s++ = kHexChars[((*dataBuffer & 0xF0) >> 4)];
            *s++ = kHexChars[(*dataBuffer & 0x0F)];
            dataBuffer++;
        }
        *s = '\0';
        NSString *hexString = [NSString stringWithUTF8String:chars];
        free(chars);
        return hexString;
    }
    
    return @"";
}

- (NSData *)hashData:(NSData *)data {
    unsigned char digest[CC_SHA1_DIGEST_LENGTH];
    if (CC_SHA1(data.bytes, (CC_LONG)data.length, digest)) {
        return [NSData dataWithBytes:digest length:CC_SHA1_DIGEST_LENGTH];
    }
    return nil;
}


@end

