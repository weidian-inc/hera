//
//  WDHTimerJS.h
//  Hera
//
//  Created by 杨涛 on 2018/8/24.
//  Copyright © 2018年 weidian. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WDHTimerJS : NSObject
+ (instancetype)sharedInstance;

- (void)startWithParams:(NSDictionary*)params  repeat: (BOOL)repeat callback: (void(^)(NSString* params))callback;
- (void)clearAllTimeout;
- (void)clearTimeout:(NSString*)timerId;
@end
