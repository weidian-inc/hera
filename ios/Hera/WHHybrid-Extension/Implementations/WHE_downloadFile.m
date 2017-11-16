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


#import "WHE_downloadFile.h"
#import "WHECryptUtil.h"
#import "WHEMacro.h"
#import "WDHApp.h"
#import "WDHAppManager.h"
#import "WDHAppInfo.h"
#import "WDHFileManager.h"

@implementation WHE_downloadFile

- (void)setupApiWithSuccess:(void (^)(NSDictionary<NSString *,id> * _Nonnull))success failure:(void (^)(id _Nullable))failure cancel:(void (^)(void))cancel
{
    NSString *urlString = self.url;
    
    NSDictionary *header = self.header;
    
    NSURL *url = [NSURL URLWithString:urlString];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
    
    //Set Header
    [header enumerateKeysAndObjectsUsingBlock:^(NSString * _Nonnull key, NSString *  _Nonnull obj, BOOL * _Nonnull stop) {
        [request setValue:obj forHTTPHeaderField:key];
    }];
    
    NSURLSession *session = [NSURLSession sharedSession];
    // 由于要先对request先行处理,我们通过request初始化task
    NSURLSessionTask *task = [session dataTaskWithRequest:request
                                        completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
											
											NSInteger statusCode = 400;
											NSHTTPURLResponse  *httpResponse = (NSHTTPURLResponse *)response;
											if ([httpResponse isKindOfClass:[NSHTTPURLResponse class]]) {
												statusCode = httpResponse.statusCode;
											}
											
                                            if (data) {
												WDHApp *app = [[WDHAppManager sharedManager] currentApp];
                                                NSString *tempDir = [WDHFileManager appTempDirPath:app.appInfo.appId];
                                                if (![[NSFileManager defaultManager] fileExistsAtPath:tempDir]) {
                                                    [[NSFileManager defaultManager] createDirectoryAtPath:tempDir withIntermediateDirectories:YES attributes:nil error:nil];
                                                }
                                                
                                                NSString *fileMD5 = [WHECryptUtil md5WithBytes:(char *)[data bytes] length:[data length]];
                                                NSString *originalImageName = [NSString stringWithFormat:@"tmp_%@.jpg",fileMD5];
                                                NSString *originalImagePath = [tempDir stringByAppendingPathComponent:originalImageName];
                                                if ([data writeToFile:originalImagePath atomically:YES]) {
                                                    if (success) {
														success(@{@"tempFilePath":[NSString stringWithFormat:@"%@%@",WDH_FILE_SCHEMA, originalImageName], @"statusCode": @(statusCode)});
                                                    }
                                                }else {
                                                    if (failure) {
                                                        failure(@{@"error":@"文件保存失败", @"statusCode": @(statusCode)});
                                                    }
                                                }
                                            }else
                                            {
                                                if (error.code == NSURLErrorCancelled) {
                                                    if (cancel) {
                                                        cancel();
                                                    }
                                                }else {
                                                    if (failure) {
                                                        failure(@{@"error":error.localizedDescription,@"statusCode": @(statusCode)});
                                                    }
                                                }
                                            }
                                        }];
    [task resume];
}

@end

