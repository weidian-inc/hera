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


#import "WHE_addPhoneContact.h"
#import "WHEMacro.h"
#import "WDHApp.h"
#import "WDHAppManager.h"
#import "WDHFileManager.h"
#import "WDHAppInfo.h"
#import <UIKit/UIKit.h>

@import AddressBook;

@implementation WHE_addPhoneContact

- (void)setupApiWithSuccess:(void (^)(NSDictionary<NSString *,id> * _Nonnull))success failure:(void (^)(id _Nullable))failure cancel:(void (^)(void))cancel {

    if (!self.firstName) {
        failure(@{@"errMsg": @"参数firstName为空"});
        return;
    }
    
    ABAuthorizationStatus authStatus = ABAddressBookGetAuthorizationStatus();
    
    if (authStatus == kABAuthorizationStatusDenied || authStatus == kABAuthorizationStatusRestricted) {
        failure(@{@"errMsg": @"用户拒绝授权"});
    }else if (authStatus == kABAuthorizationStatusAuthorized) {
        [self addContact];
    }else {
        ABAddressBookRequestAccessWithCompletion(ABAddressBookCreateWithOptions(NULL, nil), ^(bool granted, CFErrorRef error) {
            if (!granted){
                failure(@{@"errMsg": @"用户拒绝授权"});
                return;
            }
            
            dispatch_async(dispatch_get_main_queue(), ^{
                if ([self addContact]) {
                    success(@{@"errMsg": @"保存联系人成功"});
                } else {
                    failure(@{@"errMsg": @"保存联系人失败"});
                }
            });
        });
    }
}

- (BOOL)addContact {
    ABAddressBookRef addressBookRef = ABAddressBookCreateWithOptions(NULL, NULL);
    ABRecordRef person = ABPersonCreate();
    
    //设置头像
    NSData *imageData = [self imageDataFromFile:self.photoFilePath];
    if (imageData) {
        ABPersonSetImageData(person, (__bridge CFDataRef)imageData, NULL);
    }
    
    // 基本属性
    ABRecordSetValue(person, kABPersonNicknameProperty, (__bridge_retained CFStringRef)self.nickName, NULL);
    ABRecordSetValue(person, kABPersonLastNameProperty, (__bridge_retained CFStringRef)self.lastName, NULL);
    ABRecordSetValue(person, kABPersonMiddleNameProperty, (__bridge_retained CFStringRef)self.middleName, NULL);
    ABRecordSetValue(person, kABPersonFirstNameProperty, (__bridge_retained CFStringRef)self.firstName, NULL);
    ABRecordSetValue(person, kABPersonNoteProperty, (__bridge_retained CFStringRef)self.remark, NULL);
    ABRecordSetValue(person, kABPersonOrganizationProperty, (__bridge_retained CFStringRef)self.organization, NULL);
    ABRecordSetValue(person, kABPersonJobTitleProperty, (__bridge_retained CFStringRef)self.title, NULL);
    
    // email
    ABMultiValueRef multiEmail = ABMultiValueCreateMutable(kABMultiStringPropertyType);
    ABMultiValueAddValueAndLabel(multiEmail, (__bridge_retained CFStringRef)self.email, kABHomeLabel, NULL);
    ABRecordSetValue(person, kABPersonEmailProperty, multiEmail, NULL);
    CFRelease(multiEmail);
    
    // URL
    ABMultiValueRef multiUrl = ABMultiValueCreateMutable(kABMultiStringPropertyType);
    ABMultiValueAddValueAndLabel(multiUrl, (__bridge_retained CFStringRef)self.url, kABPersonHomePageLabel, NULL);
    ABRecordSetValue(person, kABPersonURLProperty, multiUrl, NULL);
    CFRelease(multiUrl);
    
    // 电话号码相关
    ABMultiValueRef phones = ABMultiValueCreateMutable(kABMultiStringPropertyType);
    ABMultiValueAddValueAndLabel(phones, (__bridge_retained CFStringRef)self.mobilePhoneNumber, kABPersonPhoneMobileLabel, NULL);
    ABMultiValueAddValueAndLabel(phones, (__bridge_retained CFStringRef)self.workFaxNumber, kABPersonPhoneWorkFAXLabel, NULL);
    ABMultiValueAddValueAndLabel(phones, (__bridge_retained CFStringRef)self.workPhoneNumber, kABWorkLabel, NULL);
    ABMultiValueAddValueAndLabel(phones, (__bridge_retained CFStringRef)self.homePhoneNumber, kABHomeLabel, NULL);
    ABMultiValueAddValueAndLabel(phones, (__bridge_retained CFStringRef)self.homeFaxNumber, kABPersonPhoneHomeFAXLabel, NULL);
    ABRecordSetValue(person, kABPersonPhoneProperty, phones, NULL);
    CFRelease(phones);
    
    // 地址
    ABMultiValueRef addresses = ABMultiValueCreateMutable(kABDictionaryPropertyType);
    
    // 家庭地址相关
    CFStringRef homeKeys[5] = {
        kABPersonAddressStreetKey,
        kABPersonAddressCityKey,
        kABPersonAddressStateKey,
        kABPersonAddressZIPKey,
        kABPersonAddressCountryKey
    };
    CFStringRef homeValues[5] = {
        (__bridge_retained CFStringRef)(self.homeAddressStreet == nil ? @"": self.homeAddressStreet),
        (__bridge_retained CFStringRef)(self.homeAddressCity == nil ? @"": self.homeAddressCity),
        (__bridge_retained CFStringRef)(self.homeAddressState == nil ? @"": self.homeAddressState),
        (__bridge_retained CFStringRef)(self.homeAddressPostalCode == nil ? @"": self.homeAddressPostalCode),
        (__bridge_retained CFStringRef)(self.homeAddressCountry == nil ? @"": self.homeAddressCountry)
    };
    CFDictionaryRef homeDic = CFDictionaryCreate(
                                                 kCFAllocatorDefault,
                                                 (void *)homeKeys,
                                                 (void *)homeValues,
                                                 5,
                                                 &kCFCopyStringDictionaryKeyCallBacks,
                                                 &kCFTypeDictionaryValueCallBacks
                                                 );
    ABMultiValueAddValueAndLabel(addresses, homeDic, kABHomeLabel, NULL);
    CFRelease(homeDic);
    
    // 联系地址相关
    CFStringRef contactKeys[5] = {
        kABPersonAddressStreetKey,
        kABPersonAddressCityKey,
        kABPersonAddressStateKey,
        kABPersonAddressZIPKey,
        kABPersonAddressCountryKey
    };
    CFStringRef contactValues[5] = {
        (__bridge_retained CFStringRef)(self.addressStreet == nil ? @"": self.addressStreet),
        (__bridge_retained CFStringRef)(self.addressCity == nil ? @"": self.addressCity),
        (__bridge_retained CFStringRef)(self.addressState == nil ? @"": self.addressState),
        (__bridge_retained CFStringRef)(self.addressPostalCode == nil ? @"": self.addressPostalCode),
        (__bridge_retained CFStringRef)(self.addressCountry == nil ? @"": self.addressCountry)
    };
    CFDictionaryRef contactDic = CFDictionaryCreate(
                                                    kCFAllocatorDefault,
                                                    (void *)contactKeys,
                                                    (void *)contactValues,
                                                    5,
                                                    &kCFCopyStringDictionaryKeyCallBacks,
                                                    &kCFTypeDictionaryValueCallBacks
                                                    );
    ABMultiValueAddValueAndLabel(addresses, contactDic, kABOtherLabel, NULL);
    CFRelease(contactDic);
    
    // 工作地址相关
    CFStringRef workKeys[5] = {
        kABPersonAddressStreetKey,
        kABPersonAddressCityKey,
        kABPersonAddressStateKey,
        kABPersonAddressZIPKey,
        kABPersonAddressCountryKey
    };
    CFStringRef workValues[5] = {
        (__bridge_retained CFStringRef)(self.workAddressStreet == nil ? @"": self.workAddressStreet),
        (__bridge_retained CFStringRef)(self.workAddressCity == nil ? @"": self.workAddressCity),
        (__bridge_retained CFStringRef)(self.workAddressState == nil ? @"": self.workAddressState),
        (__bridge_retained CFStringRef)(self.workAddressPostalCode == nil ? @"": self.workAddressPostalCode),
        (__bridge_retained CFStringRef)(self.workAddressCountry == nil ? @"": self.workAddressCountry)
    };
    CFDictionaryRef workDic = CFDictionaryCreate(
                                                 kCFAllocatorDefault,
                                                 (void *)workKeys,
                                                 (void *)workValues,
                                                 5,
                                                 &kCFCopyStringDictionaryKeyCallBacks,
                                                 &kCFTypeDictionaryValueCallBacks
                                                 );
    ABMultiValueAddValueAndLabel(addresses, workDic, kABWorkLabel, NULL);
    CFRelease(workDic);
    
    ABRecordSetValue(person, kABPersonAddressProperty, addresses, NULL);
    CFRelease(addresses);
    
    // 添加到联系簿
    ABAddressBookAddRecord(addressBookRef, person, NULL);
    CFRelease(person);
    
    bool isSave = ABAddressBookSave(addressBookRef, NULL);
    CFRelease(addressBookRef);
    
    return isSave;
}

- (NSData *)imageDataFromFile:(NSString *)filePath {
    if (!filePath) {
        return nil;
    }
	
    NSString *fileRealPath = nil;
	WDHApp *app = [[WDHAppManager sharedManager] currentApp];
    if ([filePath hasPrefix:[WDH_FILE_SCHEMA stringByAppendingString:@"tmp_"]]) {
        NSRange range = [filePath rangeOfString:WDH_FILE_SCHEMA];
        NSString *fileName = [filePath substringFromIndex:NSMaxRange(range)];
        fileRealPath = [[WDHFileManager appTempDirPath:app.appInfo.appId] stringByAppendingPathComponent:fileName];
    } else if ([filePath hasPrefix:[WDH_FILE_SCHEMA stringByAppendingString:@"store_"]]) {
        NSRange range = [filePath rangeOfString:WDH_FILE_SCHEMA];
        NSString *fileName = [filePath substringFromIndex:NSMaxRange(range)];
        fileRealPath = [[WDHFileManager appPersistentDirPath:app.appInfo.appId] stringByAppendingPathComponent:fileName];
    } else {
        fileRealPath = filePath;
    }
    
    NSData *data = UIImagePNGRepresentation([UIImage imageWithContentsOfFile:fileRealPath]);
    
    return data;
}

@end

