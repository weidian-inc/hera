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


#import "WHE_showModal.h"
#import <UIKit/UIKit.h>
#import <objc/runtime.h>
#import <Hera/WDHodoer.h>
#import "WDHUtils.h"

#pragma mark - WHAlertAction

@interface WHAlertAction : UIAlertAction
@property (nonatomic,strong) UIColor *textColor;
@end

@implementation WHAlertAction
//按钮标题的字体颜色
-(void)setTextColor:(UIColor *)textColor
{
    if(textColor == nil) {
        return;
    }
    
    unsigned int count = 0;
    Ivar *ivars = class_copyIvarList([UIAlertAction class], &count);
    for(int i =0;i < count;i ++){
        
        Ivar ivar = ivars[i];
        NSString *ivarName = [NSString stringWithCString:ivar_getName(ivar) encoding:NSUTF8StringEncoding];
        
        if ([ivarName isEqualToString:@"_titleTextColor"]) {
            [self setValue:textColor forKey:@"titleTextColor"];

        }
    }
}

@end


typedef void (^successCallback)(NSDictionary *);
@interface WHE_showModal() <UIAlertViewDelegate>

@property (nonatomic,copy) successCallback successBlock;

@end

#pragma mark - WHE_showModal

@implementation WHE_showModal

- (void)setupApiWithSuccess:(void(^_Null_unspecified)(NSDictionary<NSString *, id> * _Nonnull))success
                    failure:(void(^_Null_unspecified)(id _Nullable))failure
                     cancel:(void(^_Null_unspecified)(void))cancel
{

    NSString *cancelText = self.param[@"cancelText"];
    NSString *confirmText = self.param[@"confirmText"];
    NSString *content = self.param[@"content"];
    NSString *title = self.param[@"title"];
    
    if(![title isKindOfClass:[NSString class]] || title.length == 0) {
        title = nil;
    }
    if(![content isKindOfClass:[NSString class]] || content.length == 0) {
        content = nil;
    }
    BOOL showCancel = [self.param[@"showCancel"] integerValue] == 1;
    if(!showCancel) {
        cancelText = nil;
    }
    NSString *cancelColorString = self.param[@"cancelColor"];
    NSString *confirmColorString = self.param[@"confirmColor"];
    UIColor *cancelColor = nil;
    UIColor *confirmColor = nil;
    
    if([cancelColorString isKindOfClass:[NSString class]] && cancelColorString.length > 0) {
        cancelColor = [WDHUtils WH_Color_Conversion:cancelColorString];
    }
    
    if([confirmColorString isKindOfClass:[NSString class]] && confirmColorString.length > 0) {
        confirmColor = [WDHUtils WH_Color_Conversion:confirmColorString];
    }
    // 由于版本要在8.0以上，可以忽略掉下面的else分支
    if ([UIDevice currentDevice].systemVersion.floatValue >= 8.0) {
        UIAlertController *alert = [UIAlertController alertControllerWithTitle:title message:content preferredStyle:UIAlertControllerStyleAlert];
        if(showCancel) {
            WHAlertAction *cancelAction = [WHAlertAction  actionWithTitle:cancelText style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
                if (success) {
                    success(@{@"cancel":@(YES)});
                }
            }];
            [alert addAction:cancelAction];
            [cancelAction setTextColor:cancelColor];
        }
        WHAlertAction *confirmAction = [WHAlertAction  actionWithTitle:confirmText style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            if (success) {
                success(@{@"confirm":@(YES)});
            }
        }];
        
        [alert addAction:confirmAction];
        [confirmAction setTextColor:confirmColor];
        
        UIWindow *wid = [UIApplication sharedApplication].keyWindow;
        [wid.rootViewController presentViewController:alert animated:YES completion:nil];
        
    } else {
        self.successBlock = success;
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:title message:content delegate:self cancelButtonTitle:cancelText otherButtonTitles:confirmText, nil];
        [alert show];
    }
}

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    if(self.successBlock == nil) return;
    
    if (buttonIndex == 0) {
        self.successBlock(@{@"cancel":@(YES)});
    } else {
        self.successBlock(@{@"confirm":@(YES)});
    }
}
@end

