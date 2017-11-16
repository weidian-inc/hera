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


#import "WDHybridExtensionConverter.h"
#import "WHEBaseApi.h"
#import <Hera/WDHodoer.h>
#import "WDHApiRequest.h"
#import <objc/runtime.h>

@implementation WDHybridExtensionConverter

+ (WHEBaseApi *)apiWithRequest:(WDHApiRequest *)request
{
    NSString *command = request.command;
    NSDictionary *param = request.param;
    
    NSLog(@"api.command:%@",command);
    NSLog(@"api.param:%@",param);
    
    //自动生成类名
    NSString *apiMethod = [NSString stringWithFormat:@"WHE_%@",command];
    Class ApiClass = NSClassFromString(apiMethod);
    
    if (!ApiClass) {
        NSLog(@"WDHybridExtensionConverter Error");
        return nil;
    }
    
    WHEBaseApi *api = [[ApiClass alloc] init];
    [api setValue:command forKey:@"command"];
    [api setValue:param forKey:@"param"];
    
    NSDictionary *propertyMap = @{};
    NSArray *mapToKeys = propertyMap.allValues;
    for (NSString *datakey in param.allKeys) {
        @autoreleasepool {
            __block NSString *propertyKey = datakey;
            if (propertyMap && [mapToKeys containsObject:datakey]) {
                [propertyMap enumerateKeysAndObjectsUsingBlock:^(NSString * _Nonnull key, NSString * _Nonnull obj, BOOL * _Nonnull stop) {
                    if (key.length && [obj isEqualToString:datakey]) {
                        propertyKey = key;
                        *stop = YES;
                    }
                }];
            }
            
            objc_property_t property = class_getProperty([api class], [propertyKey UTF8String]);
            if (!property) {
                NSLog(@"找不到对应的属性，需要留意...");
                continue;
            }
            
            id value = [param objectForKey:datakey];
            id safetyValue = [self parseFromKeyValue:value];
            if (safetyValue) {
                [api setValue:safetyValue forKey:propertyKey];
            }
        }
    }
    
    return api;
    
}

#pragma mark - moved from WDDataSecurityManager

// 作空值过滤处理-任意对象
+ (id)parseFromKeyValue:(id)value {
    //值无效
    if ([value isKindOfClass:[NSNull class]]) {
        return nil;
    }
    
    if ([value isKindOfClass:[NSNumber class]]) { //统一处理为字符串
        value = [NSString stringWithFormat:@"%@",value];
    } else if ([value isKindOfClass:[NSArray class]]) { //数组
        value = [self parseFromArray:value];
    } else if ([value isKindOfClass:[NSDictionary class]]) { //字典
        value = [self parseFromDictionary:value];
    }
    
    return value;
}


// 作空值过滤处理-字典对象
+ (NSDictionary *)parseFromDictionary:(NSDictionary *)container {
    if ([container isKindOfClass:[NSDictionary class]]) {
        NSMutableDictionary *result = [NSMutableDictionary new];
        for (id key in container.allKeys) {
            @autoreleasepool {
                id value = container[key];
                
                id safetyValue = [self parseFromKeyValue:value];
                if (!safetyValue)
                {
                    safetyValue = @"";
                }
                [result setObject:safetyValue forKey:key];
            }
        }
        return result;
    }
    return container;
}


// 作空值过滤处理-数组对象
+ (NSArray *)parseFromArray:(NSArray *)container {
    if ([container isKindOfClass:[NSArray class]]) {
        NSMutableArray *result = [NSMutableArray new];
        for (int i = 0; i < container.count; i++) {
            @autoreleasepool {
                id value = container[i];
                
                id safetyValue = [self parseFromKeyValue:value];
                if (!safetyValue) {
                    safetyValue = @"";
                }
                
                [result addObject:safetyValue];
            }
        }
        
        return result;
    }
    
    return container;
}


@end

