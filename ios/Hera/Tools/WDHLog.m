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
	
	NSString *message = [[NSString alloc] initWithFormat:format arguments:args];
	NSString *hodoerMessage = [NSString stringWithFormat:@"~~~~~Hera:------->(%@)", message];
	NSLogv(hodoerMessage, args);
	
	va_end(args);
}

@end
