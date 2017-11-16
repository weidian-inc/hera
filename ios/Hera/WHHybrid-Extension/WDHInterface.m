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


#import "WDHInterface.h"
#import "WDHApp.h"
#import "WDHFileManager.h"

@implementation WDHInterface

+ (instancetype)sharedInterface {
	
	static WDHInterface *shared = nil;
	static dispatch_once_t onceToken;
	dispatch_once(&onceToken, ^{
		shared = [[WDHInterface alloc] init];
	});
	
	return shared;
}

#pragma mark - Private

- (BOOL)copyAppResource:(NSString *)path withAppId:(NSString *)appId {
	
	NSFileManager *fileManager = [NSFileManager defaultManager];
	if (!path || ![fileManager fileExistsAtPath:path]) {
		return NO;
	}
	
	NSURL *fileURL = [NSURL fileURLWithPath:path];
	NSURL *toURL = [NSURL fileURLWithPath:[WDHFileManager tempDownloadZipPath]];
    
    NSString *toPath = [WDHFileManager tempDownloadZipPath];
    if([fileManager fileExistsAtPath:toPath]) {
        [fileManager removeItemAtPath:toPath error:nil];
    }
    
	if ([fileManager copyItemAtURL:fileURL toURL:toURL error:nil]) {
		NSDictionary *dic = @{appId: @{@"appId": appId}};
		NSString *appInfoPath = [WDHFileManager tempDownloadZipInfoFilePath];
		return [dic writeToFile:appInfoPath atomically:YES];
	}
	
	return NO;
}

#pragma mark - Interface

- (void)startAppWithAppInfo:(WDHAppInfo *)appInfo entrance:(UINavigationController *)entrance completion:(void (^)(BOOL, NSString *))completion {
	
	if (!appInfo.appId || !appInfo.userId) {
		if (completion) {
			completion(NO, @"appId or userId is nil");
		}
		return;
	}
	
	//配置文件目录
	[WDHFileManager setupAppDir:appInfo.appId];

	// 拷贝外部资源文件
	BOOL copyResourceSuccess = NO;
	NSFileManager *fileManager = [NSFileManager defaultManager];
	if (!appInfo.appPath || ![fileManager fileExistsAtPath:appInfo.appPath]) {
		NSString *resourcePath = [NSBundle.mainBundle pathForResource:appInfo.appId ofType:@"zip"];
		copyResourceSuccess = [self copyAppResource:resourcePath withAppId:appInfo.appId];
	} else {
		copyResourceSuccess = [self copyAppResource:appInfo.appPath withAppId:appInfo.appId];
	}

	if (!copyResourceSuccess) {
		if (completion) {
			completion(NO, @"copyResourceSuccess failed!");
		}
		return;
	}

	// 配置内部资源文件
	if ([WDHFileManager copyAppFile:appInfo.appId]) {
		NSString *serviceHtml = [WDHFileManager appServiceEnterencePath:appInfo.appId];
		if([[NSFileManager defaultManager] fileExistsAtPath:serviceHtml]) {

			WDHApp *app = [[WDHApp alloc] initWithAppInfo:appInfo];
			[app startAppWithEntrance:entrance];

			if (completion) {
				completion(YES, @"start app success!");
			}
		} else {
			if (completion) {
				completion(NO, @"service.html not found!");
			}
		}
	} else {
		if (completion) {
			completion(NO, @"copy app file failed!");
		}
	}
}

- (NSString *)sdkVersion {
	return @"1.0.0";
}

@end

