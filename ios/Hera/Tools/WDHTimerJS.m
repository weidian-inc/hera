//
//  WDHTimerJS.m
//  Hera
//
//  Created by 杨涛 on 2018/8/24.
//  Copyright © 2018年 weidian. All rights reserved.
//

#import "WDHTimerJS.h"

typedef void(^TimeoutCallback)(NSString* params);

@interface WDHTimerJS()
{
    
}
@property(nonatomic,strong)NSMutableArray* timers ;

@end
@implementation WDHTimerJS

+ (instancetype)sharedInstance {
    static WDHTimerJS *_instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _instance = [[self alloc] init];
    });
    return _instance;
}
- (instancetype)init
{
    if (self = [super init]) {
        _timers = [NSMutableArray arrayWithCapacity:0];
    }
    return self;
}

- (void)callJsCallback:(NSTimer*)timer
{
    if ([timer.userInfo isKindOfClass: [NSDictionary class]] ) {
        TimeoutCallback callback = timer.userInfo[@"callback"];
        callback([NSString stringWithFormat:@"{callbackId:%@}", timer.userInfo[@"callbackId"]]);
    }
}
#pragma mark - public method
- (void)startWithParams:(NSDictionary*)params  repeat: (BOOL)repeat callback: (TimeoutCallback)callback;
{
    if (params[@"timer"] && [params[@"timer"] isKindOfClass:[NSNumber class]]) {
        if ([params[@"timer"] integerValue] >= 500) {
            NSString *uuid = params[@"callbackId"];
            dispatch_async(dispatch_get_main_queue(), ^{
                NSTimer* timer =  [NSTimer scheduledTimerWithTimeInterval: 1.0
                                                                   target:self
                                                                 selector:@selector(callJsCallback:)
                                                                 userInfo:@{@"callbackId": params[@"callbackId"],@"callback":callback}
                                                                  repeats:repeat];
                [self.timers addObject:@{uuid: timer}];
            });
        }
    }
}

- (void)clearAllTimeout
{
    for(NSDictionary* t in self.timers) {
        [t enumerateKeysAndObjectsUsingBlock:^(id key, id obj, BOOL *stop) {
            if([obj isKindOfClass:[NSTimer class]]) {
                [((NSTimer*)obj) invalidate];
                *stop = YES;
            }
        }];
    }
    [self.timers removeAllObjects];
}
- (void)clearTimeout:(NSString*)timerId
{
    __block BOOL bFlag = NO;
    
    for(NSDictionary* t in self.timers) {
        [t enumerateKeysAndObjectsUsingBlock:^(id key, id obj, BOOL *stop) {
            if([obj isKindOfClass:[NSTimer class]] && [key isEqualToString:timerId]) {
                [((NSTimer*)obj) invalidate];
                *stop = YES;
                bFlag = YES;
                [self.timers removeObject:obj];
            }
        }];
        if (bFlag){
            break;
        }
    }
}
@end
