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


#import "WHE_getSystemInfo.h"
#import <Hera/WDHodoer.h>
#import <UIKit/UIKit.h>
#import <sys/utsname.h>
#import "WDHInterface.h"

@implementation WHE_getSystemInfo

- (void)setupApiWithSuccess:(void(^_Null_unspecified)(NSDictionary<NSString *, id> * _Nonnull))success
                    failure:(void(^_Null_unspecified)(id _Nullable))failure
                     cancel:(void(^_Null_unspecified)(void))cancel
{
    NSString *SDKVersion = [[WDHInterface sharedInterface] sdkVersion];
    NSString *model = [self iphoneType];
    
    UIWindow *window = [UIApplication sharedApplication].delegate.window;
    NSString *pixelRatio = [NSString stringWithFormat:@"%.1f",window.screen.scale];
    NSString *screenWidth = [NSString stringWithFormat:@"%.1f",window.screen.bounds.size.width];
    NSString *screenHeight = [NSString stringWithFormat:@"%.1f",window.screen.bounds.size.height];
    NSString *windowWidth = [NSString stringWithFormat:@"%.1f",window.bounds.size.width];
    NSString *windowHeight = [NSString stringWithFormat:@"%.1f",window.bounds.size.height];
    
    NSBundle* mainBundle = [NSBundle mainBundle];
    NSDictionary* infoDict = [mainBundle infoDictionary];
    NSString *language = infoDict[@"CFBundleDevelopmentRegion"];
    NSString *version = infoDict[@"CFBundleShortVersionString"];
    NSString *system = [NSString stringWithFormat:@"%@ %@",[UIDevice currentDevice].systemName,[UIDevice currentDevice].systemVersion];
    NSString *platform = @"Demo App";
    if (success) {
        
        NSDictionary *result = @{@"SDKVersion":SDKVersion,@"model":model,
                                 @"pixelRatio":pixelRatio,@"screenWidth":screenWidth,
                                 @"screenHeight":screenHeight,@"windowWidth":windowWidth,
                                 @"windowHeight":windowHeight,@"language":language,
                                 @"version":version,@"system":system,@"platform":platform};
        success(result);
    }
}

- (NSString *)iphoneType {
    
    struct utsname systemInfo;
    
    uname(&systemInfo);
    
    NSString *platform = [NSString stringWithCString:systemInfo.machine encoding:NSASCIIStringEncoding];
    
    
    NSDictionary *iphoneTypeMap = @{@"iPhone1,2":@"iPhone 3G",@"iPhone2,1":@"iPhone 3GS",
                                    @"iPhone3,1":@"iPhone 4",@"iPhone1,1":@"iPhone 2G",
                                    @"iPhone3,2":@"iPhone 4",@"iPhone3,3":@"iPhone 4",
                                    @"iPhone4,1":@"iPhone 4S",@"iPhone5,1":@"iPhone 5",
                                    @"iPhone5,2":@"iPhone 5",@"iPhone5,3":@"iPhone 5c",
                                    @"iPhone5,4":@"iPhone 5c",@"iPhone6,1":@"iPhone 5s",
                                    @"iPhone6,2":@"iPhone 5s",@"iPhone7,1":@"iPhone 6 Plus",
                                    @"iPhone7,2":@"iPhone 6",@"iPhone8,1":@"iPhone 6s",
                                    @"iPhone8,2":@"iPhone 6s Plus",@"iPhone8,4":@"iPhone SE",
                                    @"iPhone9,1":@"iPhone 7",@"iPhone9,2":@"iPhone 7 Plus",
                                    @"iPod1,1":@"iPod Touch 1G",@"iPod2,1":@"iPod Touch 2G",
                                    @"iPod3,1":@"iPod Touch 3G",@"iPod4,1":@"iPod Touch 4G",
                                    @"iPod5,1":@"iPod Touch 5G",@"iPad1,1":@"iPad 1G",
                                    @"iPad2,1":@"iPad 2",@"iPad2,2":@"iPad 2",
                                    @"iPad2,3":@"iPad 2",@"iPad2,4":@"iPad 2",
                                    @"iPad2,5":@"iPad Mini 1G",@"iPad2,6":@"iPad Mini 1G",
                                    @"iPad2,7":@"iPad Mini 1G",@"iPad3,1":@"iPad 3",
                                    @"iPad3,2":@"iPad 3",@"iPad3,3":@"iPad 3",
                                    @"iPad3,4":@"iPad 4",@"iPad3,5":@"iPad 4",
                                    @"iPad3,6":@"iPad 4",@"iPad4,1":@"iPad Air",
                                    @"iPad4,2":@"iPad Air",@"iPad4,3":@"iPad Air",
                                    @"iPad4,4":@"iPad Mini 2G",@"iPad4,5":@"iPad Mini 2G",@"iPad4,6":@"iPad Mini 2G",@"i386":@"iPhone Simulator",@"x86_64":@"iPhone Simulator"};

    
    NSString *deviceType = iphoneTypeMap[platform];
    if (!deviceType) {
        //默认字符串
        deviceType = @"iOS Device";
    }
    
    return deviceType;
}

@end

