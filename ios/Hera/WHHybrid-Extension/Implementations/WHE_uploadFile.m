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


#import "WHE_uploadFile.h"
#import "WHEMacro.h"
#import "AFNetworking.h"
#import "NSObject+WDHJson.h"
#import "WDHAppManager.h"
#import "WDHApp.h"
#import "WDHAppInfo.h"
#import "WDHFileManager.h"

@implementation WHE_uploadFile

- (void)setupApiWithSuccess:(void(^_Null_unspecified)(NSDictionary<NSString *, id> * _Nonnull))success
                    failure:(void(^_Null_unspecified)(id _Nullable))failure
                     cancel:(void(^_Null_unspecified)(void))cancel
{
    NSString *urlString = self.url;
    NSString *filePath = self.filePath;
    NSString *name = self.name;
    
    if (!urlString || !filePath || !name) {
        if (failure) {
            failure(@{@"error":@"字段不齐全!"});
        }
        
        return;
    }
    
	// 判断临时文件或者持久化文件
	NSString *fileRealPath = nil;
	NSString *fileName = nil;
	WDHApp *app = [[WDHAppManager sharedManager] currentApp];
	if ([self.filePath hasPrefix:[WDH_FILE_SCHEMA stringByAppendingString:@"tmp_"]]) {
		fileName = [self getFileName:self.filePath];
		fileRealPath = [[WDHFileManager appTempDirPath:app.appInfo.appId] stringByAppendingPathComponent:fileName];
	} else if ([self.filePath hasPrefix:[WDH_FILE_SCHEMA stringByAppendingString:@"store_"]]) {
		fileName = [self getFileName:self.filePath];
		fileRealPath = [[WDHFileManager appPersistentDirPath:app.appInfo.appId] stringByAppendingPathComponent:fileName];
	} else {
		failure(@{@"errMsg": @"文件路径错误"});
		return;
	}
	
	NSFileManager *fileManager = [NSFileManager defaultManager];
	if (![fileManager fileExistsAtPath:fileRealPath]) {
		failure(@{@"errMsg": @"文件不存在"});
		return;
	}
	
	// 设置上传参数
	NSData *fileData = [NSData dataWithContentsOfFile:fileRealPath];
	NSString *mimeType = [self fileContentType:fileData];
	NSError *error = nil;
	
	NSMutableURLRequest *request = [[AFHTTPRequestSerializer serializer] multipartFormRequestWithMethod:@"POST" URLString:urlString parameters:self.formData constructingBodyWithBlock:^(id<AFMultipartFormData> formData) {
		[formData appendPartWithFileData:fileData name:name fileName:fileName mimeType:mimeType];
		
	} error:&error];
	
	if (error) {
		NSLog(@"WDHodoer upload file fail: %@", error);
		return;
	}
	
	// 设置header
	if (_header) {
		[_header enumerateKeysAndObjectsUsingBlock:^(NSString * _Nonnull key, NSString *  _Nonnull obj, BOOL * _Nonnull stop) {
			[request setValue:obj forHTTPHeaderField:key];
		}];
	}
	
	AFURLSessionManager *manager = [[AFURLSessionManager alloc] initWithSessionConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
	AFHTTPResponseSerializer *response = manager.responseSerializer;
	response.acceptableContentTypes = [NSSet setWithObjects:@"application/json",@"text/json",@"text/javascript",@"text/html", nil];
	
	NSURLSessionUploadTask *uploadTask = [manager uploadTaskWithStreamedRequest:request progress:nil completionHandler:^(NSURLResponse * _Nonnull response, id  _Nullable responseObj, NSError * _Nullable error) {
		NSInteger statusCode = 200;
		NSHTTPURLResponse  *httpResponse = (NSHTTPURLResponse *)response;
		if ([httpResponse isKindOfClass:[NSHTTPURLResponse class]]) {
			statusCode = httpResponse.statusCode;
		}
		
		if (responseObj) {
			// 留给h5来做json解析 我们返回json字符串
			NSLog(@"WHERequest response:%@", responseObj);
			if (success) {
				if ([responseObj isKindOfClass:NSDictionary.class]) {
					success(@{@"data":[responseObj wdh_jsonString],@"statusCode":@(statusCode)});
				} else {
					success(@{@"data":responseObj,@"statusCode":@(statusCode)});
				}
			}

		}else {
			
			if (error.code == NSURLErrorCancelled) {
				if (cancel) {
					cancel();
				}
			}else {
				if (failure) {
					failure(@{@"statusCode":@(statusCode)});
				}
			}
		}
	}];
	
	[uploadTask resume];
}

- (NSString *)getFileName:(NSString *)filePath {
	
	NSRange range = [filePath rangeOfString: WDH_FILE_SCHEMA];
	NSString *fileName = [filePath substringFromIndex:NSMaxRange(range)];
	
	return fileName;
}

- (NSString *)fileContentType:(NSData *)data
{
	uint8_t c;
	[data getBytes:&c length:1];
	
	switch (c) {
		case 0xFF:
			return @"image/jpeg";
			break;
		case 0x89:
			return @"image/png";
			break;
		case 0x47:
			return @"image/gif";
			break;
		case 0x49:
		case 0x4D:
			return @"image/tiff";
			break;
		case 0x25:
			return @"application/pdf";
			break;
		case 0xD0:
			return @"application/vnd";
			break;
		case 0x46:
			return @"text/plain";
			break;
		default:
			return @"application/octet-stream";
	}
	
	return @"";
}

@end

