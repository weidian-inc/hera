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


#import <Foundation/Foundation.h>

@interface WDHFileManager : NSObject

/**
 删除文件

 @param path 路径
 @return 是否成功
 */
+ (BOOL)removePath:(NSString *)path;

/**
 复制文件

 @param path 路径
 @param toPath 目标路径
 @return 是否成功
 */
+ (BOOL)copyItemAtPath:(NSString *)path toPath:(NSString *)toPath;

/**
 清除下载的zip文件夹
 */
+ (void)cleanDownloadZipDir;

/**
 framework的根目录

 @return framework的根目录路径
 */
+ (NSString *)frameworkRootPath;

/**
 临时下载的Zip包路径

 @return 临时下载的Zip包路径
 */
+ (NSString *)tempDownloadZipPath;

/**
 临时下载的Zip路径

 @return 路径
 */
+ (NSString *)tempDownloadZipInfoFilePath;

/**
 工程根目录路径

 @return 工程根目录路径
 */
+ (NSString *)projectRootAppsDirPath;

/**
 获取缓存app的列表

 @return 缓存app的列表
 */
+ (NSDictionary *)getCachedAppList;

/**
 获取缓存大小

 @return 缓存大小
 */
+ (UInt64)getCachedSize;

/**
 配置小程序文件目录
 */
+ (void)setupAppDir:(NSString *)appId;

/**
 拷贝小程序的资源文件
 */
+ (BOOL)copyAppFile:(NSString *)appId;

/**
 获取小程序入口文件
 */
+ (NSString *)appServiceEnterencePath:(NSString *)appId;

/**
 获取当前小程序根目录
 */
+ (NSString *)appRootDirPath:(NSString *)appId;

/**
 获取当前小程序根源码目录
 */
+ (NSString *)appSourceDirPath:(NSString *)appId;

/**
 获取当前小程序临时存储目录
 */
+ (NSString *)appTempDirPath:(NSString *)appId;

/**
 获取当前小程序持久化存储目录
 */
+ (NSString *)appPersistentDirPath:(NSString *)appId;

/**
 获取当前小程序本地存储数据目录
 */
+ (NSString *)appStorageDirPath:(NSString *)appId;

@end

