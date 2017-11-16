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


#import "WHE_showActionSheet.h"
#import <UIKit/UIKit.h>
#import "WDHUtils.h"
#import <Hera/WDHodoer.h>

@implementation WHE_showActionSheet

- (void)setupApiWithSuccess:(void (^)(NSDictionary<NSString *,id> * _Nonnull))success failure:(void (^)(id _Nullable))failure cancel:(void (^)(void))cancel {

    if (!self.itemList || self.itemList.count <= 0 || self.itemList.count > 6) {
        failure(@{@"errMsg": @"参数itemList不合法"});
        return;
    }
    
    // 如果参数不合法 设为默认值"#000000"
    if (!self.itemColor || self.itemColor.length != 7) {
        self.itemColor = @"#000000";
    }

    UIAlertController *alertCtrl = [[UIAlertController alloc] init];
    [self.itemList enumerateObjectsUsingBlock:^(NSString * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        UIAlertAction *action = [UIAlertAction actionWithTitle:obj style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            success(@{@"tapIndex": @(idx)});
        }];
        
        [action setValue:[WDHUtils WH_Color_Conversion:self.itemColor] forKey:@"titleTextColor"];
        [alertCtrl addAction:action];
    }];
    
    // 添加取消action
    UIAlertAction *cancelAction = [UIAlertAction actionWithTitle:@"取消" style:UIAlertActionStyleCancel handler:^(UIAlertAction * _Nonnull action){
        failure(@{@"errMsg": @"showActionSheet:fail cancel"});
    }];
    [alertCtrl addAction:cancelAction];
    
    UIWindow *wid = [UIApplication sharedApplication].keyWindow;
    [wid.rootViewController presentViewController:alertCtrl animated:YES completion:nil];
}

@end

