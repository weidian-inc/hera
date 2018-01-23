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


#import "WDHFileManager.h"
#import "ZipArchive.h"
#import "WDHAppInfo.h"
#import "NSData+WDH.h"
#import "WDHLog.h"


static NSString *APP_CRC32_Cached_Key = @"WHBundleZip";
static NSString *FRAMEWORK_CRC32_Cached_Key = @"WHBundleZip_framework";
static NSString *PROJECT_ROOT = @"HeraRoot";
static NSString *PROJECT_ROOT_App = @"app";
static NSString *PROJECT_ROOT_Framework = @"framework";

@interface NSString (WDHFileManager)

- (UInt64)getFileSize;
@end

@implementation NSString (WDHFileManager)

- (UInt64)getFileSize  {
    UInt64 size = 0;
    NSFileManager *fileManager = [NSFileManager defaultManager];
    BOOL isDir = false;
    BOOL isExists = [fileManager fileExistsAtPath:self isDirectory:&isDir];
    // 判断文件存在
    if (isExists) {
        // 是否为文件夹
        if (isDir) {
            // 迭代器 存放文件夹下的所有文件名
            NSDirectoryEnumerator *enumerator = [fileManager enumeratorAtPath:self];
            NSString *file = nil;
            while (file = [enumerator nextObject]) {
                NSString *fullPath = [self stringByAppendingPathComponent:file];
                NSDictionary *attr = [fileManager attributesOfItemAtPath:fullPath error:nil];
                size += [attr[NSFileSize] unsignedLongLongValue];
            }
        } else {    // 单文件
            NSDictionary *attr = [fileManager attributesOfItemAtPath:self error:nil];
            size += [attr[NSFileSize] unsignedLongLongValue];
        }
    }
    return size;
}

@end


@implementation WDHFileManager

#pragma mark - 文件操作
#pragma mark -

+ (void)setupAppDir:(NSString *)appId
{
	NSFileManager *fileManager = [NSFileManager defaultManager];
	
	//创建目录
	NSString *rootPath = [WDHFileManager projectRootAppsDirPath];
	NSString *appDirPath = [WDHFileManager appRootDirPath:appId];
	
	if (![fileManager fileExistsAtPath:appDirPath]) {
		[fileManager createDirectoryAtPath:appDirPath withIntermediateDirectories:YES attributes:nil error:nil];
	}
	
	if (![fileManager fileExistsAtPath:[WDHFileManager unzipTempDir]]) {
		[fileManager createDirectoryAtPath:[WDHFileManager unzipTempDir] withIntermediateDirectories:YES attributes:nil error:nil];
	}
	
	//创建必须的文件夹
	NSString *temp = @"Temp";
	NSString *tempDirPath = [rootPath stringByAppendingPathComponent:temp];
	if (![fileManager fileExistsAtPath:tempDirPath]) {
		[fileManager createDirectoryAtPath:tempDirPath withIntermediateDirectories:YES attributes:nil error:nil];
	}
}

+ (BOOL)copyAppFile:(NSString *)appId
{
	BOOL success = NO;
	
    success = [self copyFrameworkZip];
	
	if (success) {
		success = [self copyAppZip: appId];
	}
	
	return success;
}

+ (BOOL)copyAppZip:(NSString *)appId
{
    NSFileManager *fileManager = [NSFileManager defaultManager];
    
    NSString *downloadZip = [WDHFileManager tempDownloadZipPath];
    NSString *downloadZipInfoPath = [WDHFileManager tempDownloadZipInfoFilePath];
    BOOL success = YES;
    if ([fileManager fileExistsAtPath:downloadZip]) {
        
        [WDHFileManager removePath:[WDHFileManager tempZipPath]];
        
        BOOL copySuccess = [WDHFileManager copyItemAtPath:downloadZip toPath:[WDHFileManager tempZipPath]];
        if (copySuccess) {
            
            NSDictionary *tempFileInfo = [[NSDictionary alloc] initWithContentsOfFile:downloadZipInfoPath];
            if (tempFileInfo) {
                success = [self unzipAndMoveFile:[WDHFileManager tempZipPath] appInfo:tempFileInfo appId:appId];
            }
        }
		
		//移除临时缓存
		if (success) {
			[WDHFileManager removePath:[WDHFileManager tempZipPath]];
			[WDHFileManager removePath:downloadZip];
			[WDHFileManager removePath:downloadZipInfoPath];
		}
    }
	
	return success;
}

+ (BOOL)copyFrameworkZip
{
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSString *bundlePath = [[NSBundle mainBundle] pathForResource:@"HeraRes" ofType:@"bundle"];
    NSBundle *bundle = [NSBundle bundleWithPath:bundlePath];
	
	if(!bundle) {
		NSBundle *classBundle = [NSBundle bundleForClass:WDHFileManager.class];
		bundlePath = [classBundle pathForResource:@"HeraRes" ofType:@"bundle"];
		bundle = [NSBundle bundleWithPath:bundlePath];
	}
	
    if (!bundle) {
        HRLog(@"HeraRes.bundle is missing");
		return NO;
    }
	
    NSString *resourcesPath = [bundle pathForResource:@"framework" ofType:@"zip"];
    if (!resourcesPath) {
        HRLog(@"framework.zip is missing");
        return NO;
    }
	
    NSString *rootPath = [WDHFileManager frameworkRootPath];
    [WDHFileManager removePath:rootPath];
    
    [fileManager createDirectoryAtPath:rootPath withIntermediateDirectories:YES attributes:nil error:nil];
    
    //拷贝到解压目录
    [WDHFileManager copyItemAtPath:resourcesPath toPath:[WDHFileManager tempZipPath]];
    
    //解压缩
    BOOL success = [self unzipAndMoveFrameworkFile:[WDHFileManager tempZipPath]];
	
	//移除临时缓存
    if (success) {
		[WDHFileManager removePath:[WDHFileManager tempZipPath]];
	} else {
		HRLog(@"unzip and move framework failed!");
	}
	
	return success;
}

+ (BOOL)unzipAndMoveFile:(NSString *)zipPath appInfo:(NSDictionary *)appInfo appId:(NSString *)appId {
    
    BOOL unzipAndMoveSuccess = false;
    NSFileManager *fileManager = [NSFileManager defaultManager];

    //解压缩
    ZipArchive *archive = [[ZipArchive alloc] initWithFileManager:fileManager];
    if ([archive UnzipOpenFile:[WDHFileManager tempZipPath]]) {
        NSString *zipTempFolder = [[WDHFileManager unzipTempDir]stringByAppendingString:@"UnzipFiles"];
        [WDHFileManager removePath:zipTempFolder];
        
        //unzip
        if ([archive UnzipFileTo:zipTempFolder overWrite:true]) {

            NSString *osxPath = [zipTempFolder stringByAppendingPathComponent:@"__MACOSX"];
            [WDHFileManager removePath:osxPath];
//            [WDHFileManager removePath:[WDHFileManager appRootDirPath:appId]];
			
            // mv到Source目录下
            NSString *toPath = [self appSourceDirPath:appId];
            if (![fileManager fileExistsAtPath:toPath]) {
                [fileManager createDirectoryAtPath:toPath withIntermediateDirectories:YES attributes:nil error:nil];
            }
            [WDHFileManager removePath:toPath];
            [fileManager moveItemAtPath:zipTempFolder toPath:toPath error:nil];
			
			// 将app信息存储到本地
			NSDictionary *cachedList = [WDHFileManager getCachedAppList];
			NSMutableDictionary *appList = cachedList == nil ? [NSMutableDictionary dictionary] : [NSMutableDictionary dictionaryWithDictionary:cachedList];
            appList[appId] = appInfo;
            BOOL didSuccess = [WDHFileManager saveAppInfo:appList];
			
            unzipAndMoveSuccess = didSuccess;

            if (didSuccess) {
				HRLog(@"copyFile_success");
            }else {
				HRLog(@"copyFile_failure");
            }
            
        }else {
			HRLog(@"unzipFile_failure");
        }
        
    }else {
		HRLog(@"unzipFile_failure");
    }
    
    return unzipAndMoveSuccess;
}

+ (BOOL)unzipAndMoveFrameworkFile:(NSString *)zipPath {
    
    BOOL unzipAndMoveSuccess = false;
    NSFileManager *fileManager = [NSFileManager defaultManager];
    
	HRLog(@"unzipFramework");
    
    //解压缩
    ZipArchive *archive = [[ZipArchive alloc] initWithFileManager:fileManager];
    if ([archive UnzipOpenFile:[WDHFileManager tempZipPath]]) {
        NSString *zipTempFolder = [[WDHFileManager unzipTempDir]stringByAppendingString:@"UnzipFiles"];
        [WDHFileManager removePath:zipTempFolder];
        
        //unzip
        if ([archive UnzipFileTo:zipTempFolder overWrite:true]) {
			HRLog(@"unzipFramework_success");
            
            NSString *osxPath = [zipTempFolder stringByAppendingPathComponent:@"__MACOSX"];
            [WDHFileManager removePath:osxPath];
            [WDHFileManager removePath:[WDHFileManager frameworkRootPath]];
            
            BOOL didSuccess = [fileManager moveItemAtPath:zipTempFolder toPath:[WDHFileManager frameworkRootPath] error:nil];
            unzipAndMoveSuccess = didSuccess;
			HRLog(@"copyFramework");
            
            if (didSuccess) {
				HRLog(@"copyFramework_success");
            }else {
                HRLog(@"copyFramework_failure");
            }   
        }else {
			HRLog(@"unzipFramework_failure  error: 解压文件失败");
        }
    }else {
		HRLog(@"unzipFramework_failure  error: 文件不能解压");
    }
    
    return unzipAndMoveSuccess;
}


+ (void)cleanDownloadZipDir {
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSString *downloadZip = [WDHFileManager tempDownloadZipPath];
    NSString *downloadZipInfoPath = [WDHFileManager tempDownloadZipInfoFilePath];
    
    if ([fileManager fileExistsAtPath:downloadZip]) {
        
        [WDHFileManager removePath:downloadZip];
        [WDHFileManager removePath:downloadZipInfoPath];
    }
}

+ (NSDictionary *)getCachedAppList {
    NSString *path = [WDHFileManager projectRootAppsDirPath];
    NSString * appListName = @"apps.list";
    NSString * appListPath = [path stringByAppendingFormat:@"/%@",appListName];
    
    if ([[NSFileManager defaultManager] fileExistsAtPath:appListPath]) {
        return [[NSDictionary alloc] initWithContentsOfFile:appListPath];
    }
    
    return nil;
}

+ (BOOL)saveAppInfo:(NSDictionary *)info {
    NSString *path = [WDHFileManager projectRootAppsDirPath];
    NSString *appListName = @"apps.list";
    NSString *appListPath = [path stringByAppendingPathComponent:appListName];
    return [info writeToFile:appListPath atomically:YES];
}

+ (BOOL)copyItemAtPath:(NSString *)path toPath:(NSString *)toPath {
    BOOL success = [[NSFileManager defaultManager] copyItemAtPath:path toPath:toPath error:nil];
    
    return success;

}

+ (BOOL)removePath:(NSString *)path {
    BOOL success = true;
    
    NSFileManager *fileManager = [NSFileManager defaultManager];
    if ([fileManager fileExistsAtPath:path]) {
        success = [fileManager removeItemAtPath:path error:nil];
    }
    
    return success;
}

+ (UInt64)getCachedSize{
    __block UInt64 cacheSize = 0;
    NSDictionary *appList = [WDHFileManager getCachedAppList];
    [appList enumerateKeysAndObjectsUsingBlock:^(NSString *appid, id  _Nonnull obj, BOOL * _Nonnull stop) {
        NSString *rootPath = [WDHFileManager projectRootAppsDirPath];
        NSString *appDirPath = [rootPath stringByAppendingPathComponent:appid];
        cacheSize += [appDirPath getFileSize];
    }];
    
    return cacheSize;
}

#pragma mark - 公共路径
#pragma mark -

+ (NSString *)projectRootDirPath{

	NSString *rootPath = [NSTemporaryDirectory() stringByAppendingPathComponent:PROJECT_ROOT];
	
    return rootPath;
}

+ (NSString *)projectRootAppsDirPath{
    NSString * rootPath = [[WDHFileManager projectRootDirPath] stringByAppendingFormat:@"/%@",PROJECT_ROOT_App];
    
    return rootPath;
}

+ (NSString *)frameworkRootPath
{
    NSString * rootPath = [[WDHFileManager projectRootDirPath] stringByAppendingFormat:@"/%@",PROJECT_ROOT_Framework];
    return rootPath;
}

+ (NSString *)unzipTempDir {
	NSString * rootPath = [NSTemporaryDirectory() stringByAppendingFormat:@"%@_Temp",PROJECT_ROOT];
	NSString *temp = @"Temp";
	NSString * tempDirPath = [rootPath stringByAppendingPathComponent:temp];
	return tempDirPath;
}

+ (NSString *)tempZipPath {
	NSString *zipTempPath = [[self unzipTempDir] stringByAppendingPathComponent:@"TempZip.zip"];
	return zipTempPath;
}

+ (NSString *)tempDownloadZipPath {
	NSString *zipTempPath = [[self unzipTempDir] stringByAppendingPathComponent:@"DownloadZip.zip"];
	return zipTempPath;
}

+ (NSString *)tempDownloadZipInfoFilePath{
	NSString *zipTempPath = [[self unzipTempDir] stringByAppendingPathComponent:@"DownloadZip"];
	return zipTempPath;
}

#pragma mark - 小程序内部路径
#pragma mark -


/**
 获取当前小程序根路径
 
 @return 获取当前小程序根路径
 */
+ (NSString *)appRootDirPath:(NSString *)appId {
    NSString *rootPath = [WDHFileManager projectRootAppsDirPath];
    NSString *appDirPath = [rootPath stringByAppendingPathComponent:appId];
    return appDirPath;
}

/**
 小程序源码文件夹路径
 */
+ (NSString *)appSourceDirPath:(NSString *)appId {
    NSString *sourceDir = [[WDHFileManager appRootDirPath:appId] stringByAppendingPathComponent:@"Source"];
    return sourceDir;
}

/**
 小程序临时存储目录

 @return NSString *
 */
+ (NSString *)appTempDirPath:(NSString *)appId {
    NSString *tempFileCachePath = [[WDHFileManager appRootDirPath:appId] stringByAppendingPathComponent:@"Temp"];
    return tempFileCachePath;
}

/**
 小程序持久化存储目录

 @return NSString *
 */
+ (NSString *)appPersistentDirPath:(NSString *)appId {
    NSString *persistentDirPath = [[WDHFileManager appRootDirPath:appId] stringByAppendingPathComponent:@"Persistent"];
    return persistentDirPath;
}

/**
 小程序本地缓存目录
 
 @return NSString *
 */
+ (NSString *)appStorageDirPath:(NSString *)appId {
    NSString *storageDirPath = [[WDHFileManager appRootDirPath:appId] stringByAppendingPathComponent:@"Storage"];
    return storageDirPath;
}


/// 获取小程序的service入口文件
+ (NSString *)appServiceEnterencePath:(NSString *)appId {
    NSString *serviceHtml = [[WDHFileManager appSourceDirPath:appId] stringByAppendingPathComponent:@"service.html"];
    return serviceHtml;
}

@end

