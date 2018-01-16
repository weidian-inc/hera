//
//  WDHLog.m
//  Hera
//
//  Created by WangYiqiao on 2017/11/28.
//  Copyright © 2017年 weidian. All rights reserved.
//

#import "WDHLog.h"
#import "WDHSystemConfig.h"

@implementation WDHLog

void HRLog(NSString *format, ...) {
	
	if (![WDHSystemConfig sharedConfig].enableLog) {
		return;
	}
	
	va_list args;
	va_start(args, format);
	NSString *log = [@"----Hera:------>: " stringByAppendingString:format];
	NSLogv(log, args);
	va_end(args);
}

@end
