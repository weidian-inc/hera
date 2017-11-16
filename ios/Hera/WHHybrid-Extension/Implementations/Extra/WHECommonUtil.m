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


#import "WHECommonUtil.h"
#import "WHEUIConstants.h"
#import <AssetsLibrary/AssetsLibrary.h>
#import <AVFoundation/AVFoundation.h>
#import "WDSDeviceMacros.h"
#import <Photos/Photos.h>
#import <MessageUI/MessageUI.h>
#import "WDHBundleUtil.h"

#ifndef     WHECommonUtil_m
#define     WHECommonUtil_m
static NSString * const apivStr = @"785";
static NSString * const appIDStr = @"com.koudai.weishop";

#endif

@interface WHECommonUtil () {
    
}
@property (nonatomic, strong) NSString *myPlatform;    ///< ipad\iphone

@end

@implementation WHECommonUtil

//记录当前实例
static WHECommonUtil *utilInstance_ = nil;
+ (WHECommonUtil *)sharedInstance
{
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        utilInstance_ = [[WHECommonUtil alloc] init];
    });
    
    return utilInstance_;
}

- (id)init
{
    if (self = [super init]) {

        if( (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad) ) {
            _myPlatform = @"ipad";
        } else {
            _myPlatform = @"iphone";
        }

    }
    return self;
}


#pragma mark - common UI


+ (UIFont *)transferToiOSFontSize:(CGFloat)oriFontSize
{
    CGFloat sizeOffset = 1.5;
    //    return [UIFont fontWithName:@"STHeitiSC-Light" size:oriFontSize * 0.5 + 1.5];
    return [UIFont systemFontOfSize:oriFontSize * 0.5 + sizeOffset];
}

+ (UIBarButtonItem*)backBarButtonItemWithTarget:(id)target selector:(SEL)selector {
    return [WHECommonUtil leftBarButtonItemWithTarget:target selector:selector andTitle:@""];
}


+ (UIBarButtonItem*)leftBarButtonItemWithTarget:(id)target selector:(SEL)selector andTitle:(NSString*)title {
    UIButton* button = [[UIButton alloc] initWithFrame:CGRectMake(0, 0, 50, 44)];
    UIImage *backgroundImage = [WDHBundleUtil imageFromBundleWithName:@"WDIPh_btn_navi_back"];
    
    [button setImage:backgroundImage forState:UIControlStateNormal];
    
    [button setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    [button setTitleColor:COLOR_DISABLED_BUTTON_TEXT forState:UIControlStateDisabled];
    [button setTitle:title forState:UIControlStateNormal];
    button.titleLabel.font = WDS_FONT(15);
    button.contentHorizontalAlignment = UIControlContentHorizontalAlignmentLeft;
    [button addTarget:target action:selector forControlEvents:UIControlEventTouchUpInside];
    button.tag = WDSTAG_FOR_NAVITEM_BUTTON;
    
    CGRect tempF = CGRectMake(0, 0, 70, 44);
    UIView* tempV = [[UIView alloc] initWithFrame:tempF];
    [tempV addSubview:button];
    
    UIBarButtonItem* item = [[UIBarButtonItem alloc] initWithCustomView:tempV];
    
    return item;
}


+ (UIBarButtonItem*)rightBarButtonItemWithTarget:(id)target
                                        selector:(SEL)selector
                                           image:(id)image
                                        andTitle:(NSString*)title
{
    UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
    button.frame = CGRectMake(0, 0, 60, 44);
    BOOL needResize = YES;
    UIImage *bgimg = nil;
    if([image isKindOfClass:[UIImage class]]) {
        bgimg = (UIImage *)image;
    } else if ([image isKindOfClass:[NSString class]]){
        
        NSString *imgName = image;
        if (imgName.length == 0) {
            // default image does not require to resize.
            needResize = NO;
            bgimg = [WDHBundleUtil imageFromBundleWithName:@"WDIPh_btn_navi_right22.png"];
        }
    }
    
    if (bgimg == nil) {
        bgimg = [WDHBundleUtil imageFromBundleWithName:image];
    };
    
    [button setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    [button setTitleColor:COLOR_DISABLED_BUTTON_TEXT forState:UIControlStateDisabled];
    [button setTitle:title forState:UIControlStateNormal];
    button.titleLabel.font = WDS_FONT(15);
    [button addTarget:target action:selector forControlEvents:UIControlEventTouchUpInside];
    button.tag = WDSTAG_FOR_NAVITEM_BUTTON;
    
    
    if (needResize) {
        CGRect dstFrame = button.frame;
        dstFrame.origin.x = 0;
        dstFrame.origin.y = 0;
        [button setImage:bgimg forState:UIControlStateNormal];
        button.titleEdgeInsets = UIEdgeInsetsMake(0, 12, 0, 0);
        
        CGSize size = bgimg.size;
        title = [title stringByReplacingOccurrencesOfString:@" " withString:@""];
        if (title.length == 0 && bgimg)
        {
            [button setTitle:title forState:UIControlStateNormal];
            button.imageEdgeInsets = UIEdgeInsetsMake(0, button.bounds.size.width-size.width, 0, 0);
        }
    } else {
        button.contentHorizontalAlignment = UIControlContentHorizontalAlignmentRight;
    }
    
    UIBarButtonItem* item = [[UIBarButtonItem alloc] initWithCustomView:button];
    
    return item;
}


+ (UIWindow*)appWindow {
    return [UIApplication sharedApplication].delegate.window;
}


+ (UINavigationController*)currentNavigationController {
    UIWindow *keyWindow = [self appWindow];
    UINavigationController *navCtrl =  (UINavigationController *)keyWindow.rootViewController;
    if ([navCtrl isKindOfClass:[UINavigationController class]]) {
        return navCtrl;
    } else {
        /*
         UIAlertView *av = [[UIAlertView alloc] initWithTitle:@"nav is nil" message:@"nav is nil"  delegate:nil cancelButtonTitle:@"ok" otherButtonTitles:nil];
         
         [av show];
         */
        return nil;
    }
}


+ (UINavigationController*)navControllerWithRootViewController:(UIViewController*)controller {
    UINavigationController* navController = nil;
    Class navigationControllerCls = NSClassFromString(@"WDSNavigationController");
    if(navigationControllerCls)
    {
        navController = [[navigationControllerCls alloc] initWithRootViewController:controller];
    }
    else
    {
        navController = [[UINavigationController alloc] initWithRootViewController:controller];
    }
    navController.navigationBar.translucent = NO;
    
    // color B is just for the gray testing version
    navController.navigationBar.barTintColor = UIColorFromRGB_Red_A;// //;UIColorFromRGB(0xD62800); //
    navController.navigationBar.titleTextAttributes = @{NSFontAttributeName:[UIFont boldSystemFontOfSize:20],
                                                        NSForegroundColorAttributeName:[UIColor whiteColor]};
    
    return navController;
}


+ (void)animatPushOnView:(UIView*)view fromDirection:(NSString*)direction {
    CATransition* animation = [CATransition animation];
    [animation setDuration:0.3f];
    [animation setTimingFunction:[CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut]];
    [animation setType:@"push"];
    [animation setSubtype:direction];
    [view.layer addAnimation:animation forKey:@"push"];
}


+ (void)animatFlipOnView:(UIView*)view fromDirection:(NSString*)direction {
    CATransition* animation = [CATransition animation];
    [animation setDuration:0.3f];
    [animation setTimingFunction:[CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut]];
    [animation setType:@"flip"];
    [animation setSubtype:direction];
    [view.layer addAnimation:animation forKey:@"flip"];
}


#pragma mark - 版本配置

+ (NSString *)apiv
{
    return apivStr;
}


+ (NSString *)appID;
{
    return appIDStr;
}



+ (NSString *)platform;
{
    return [WHECommonUtil sharedInstance].myPlatform;
}

+ (NSString *)appGroup
{
    return @"group.com.koudai.weidian";
}


#pragma mark - 将坐标值转换为整型

CGRect WHE_CGRectIntMake(CGFloat x, CGFloat y, CGFloat width, CGFloat height)
{
    CGRect intFrame;
    intFrame.origin.x       = (NSInteger)x;
    intFrame.origin.y       = (NSInteger)y;
    intFrame.size.width     = (NSInteger)width;
    intFrame.size.height    = (NSInteger)height;
    return intFrame;
}


#pragma mark - 把Frame转化为整型

CGRect WHE_CGRectIntMakeWithFrame(CGRect oldFrame)
{
    CGRect intFrame;
    intFrame.origin.x       = (NSInteger)oldFrame.origin.x;
    intFrame.origin.y       = (NSInteger)oldFrame.origin.y;
    intFrame.size.width     = (NSInteger)oldFrame.size.width;
    intFrame.size.height    = (NSInteger)oldFrame.size.height;
    return intFrame;
}

#pragma mark - 功能
#pragma mark -

+ (NSString *)formatterStringFromTimeZone:(int)timezone
                          timestampString:(NSString *)timestampString {
    if (timestampString == nil) {
        return timestampString;
    }
    NSString *result = nil;
    NSTimeZone *tz = [NSTimeZone timeZoneForSecondsFromGMT:timezone * 60 * 60];
    NSDateFormatter *df = [[NSDateFormatter alloc] init];
    df.dateFormat = @"yyyy/MM/dd";
    [df setTimeZone:tz];
    NSDate *date = [NSDate dateWithTimeIntervalSince1970:[timestampString intValue]];
    result = [df stringFromDate:date];
    return result;
}






+ (BOOL)detectHasPermissionOfAccessVideo {

    if (![UIImagePickerController isSourceTypeAvailable:UIImagePickerControllerSourceTypeCamera]) {

        NSString *msg = @"该设备不支持拍照";
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:nil message:msg delegate:nil cancelButtonTitle:@"好的" otherButtonTitles:nil, nil];
        [alert show];

        return NO;
    }
    // 暂时不判断该权限
    AVAuthorizationStatus status = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo];

    //系统未询问用户
    if (status == AVAuthorizationStatusNotDetermined) {
        return YES;
    } else if(status != AVAuthorizationStatusAuthorized) { // 用户已否定该权限
        NSString *msg = @"没有照相机权限";
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:nil message:msg delegate:nil cancelButtonTitle:@"好的" otherButtonTitles:nil, nil];
        [alert show];

        return NO;
    } else {
        return YES;
    }
}

+ (BOOL)isCanUsePhotos
{
    if ([[[UIDevice currentDevice] systemVersion] floatValue] < 10.0) {
        ALAuthorizationStatus author =[ALAssetsLibrary authorizationStatus];
        if (author == ALAuthorizationStatusRestricted || author == ALAuthorizationStatusDenied)
        {
            return NO;
        }
    }
    else {
        PHAuthorizationStatus status = [PHPhotoLibrary authorizationStatus];
        if (status == PHAuthorizationStatusRestricted ||
            status == PHAuthorizationStatusDenied) {
            //无权限
            return NO;
        }
    }
    return YES;
}



+ (BOOL)openWechat
{
    NSURL *url = [NSURL URLWithString:@"weixin://"];
    BOOL success = NO;
    if ([[UIApplication sharedApplication] canOpenURL:url]) {
        success = [[UIApplication sharedApplication] openURL:url];
    }
    
    return success;
}

+ (NSString *)currentUserAgent
{
    NSAssert([NSThread isMainThread], @"Not on the main thread!!!");
    
    UIWebView* tempWebView = [[UIWebView alloc] initWithFrame:CGRectZero];
    NSString *userAgent = [tempWebView stringByEvaluatingJavaScriptFromString:@"navigator.userAgent"];
    return userAgent;
}

+ (void)saveUserAgent:(NSString *)userAgent
{
    if (userAgent) {
        [[NSUserDefaults standardUserDefaults] registerDefaults:@{@"UserAgent" : userAgent, @"User-Agent" : userAgent}];
    }
}





+ (BOOL)openSMSWithParams:(NSDictionary *)params
{
    NSString *phones = params[@"phoneNumbers"];
    NSArray *outPhones = nil;
    if ([phones isKindOfClass:[NSString class]]) {
        
        if ([phones hasPrefix:@";"]) {
            phones = [phones substringFromIndex:1];
        }
        
        if ([phones hasSuffix:@";"]) {
            phones = [phones substringToIndex:phones.length-1];
        }
        
        outPhones = [phones componentsSeparatedByString:@";"];
    }else if ([phones isKindOfClass:[NSArray class]]) {
        outPhones = (NSArray *)phones;
    }
    
    NSString *content = params[@"content"];
    
    //是否支持短信功能
    if([MFMessageComposeViewController canSendText])
    {
        MFMessageComposeViewController * controller = [[MFMessageComposeViewController alloc] init];
        controller.recipients = outPhones;
        controller.navigationBar.tintColor = [UIColor redColor];
        controller.body = content;
        controller.messageComposeDelegate = (id <MFMessageComposeViewControllerDelegate>)[WHECommonUtil sharedInstance];
        [[self currentNavigationController].topViewController presentViewController:controller animated:YES completion:nil];
        
        return YES;
    }
    
    return NO;
}

- (void)messageComposeViewController:(MFMessageComposeViewController *)controller didFinishWithResult:(MessageComposeResult)result
{
    [[WHECommonUtil currentNavigationController].topViewController dismissViewControllerAnimated:YES completion:nil];
}


+ (NSString *)phoneDiskFreeSize
{
    //获取磁盘大小、剩余空间
    NSDictionary *systemAttributes = [[NSFileManager defaultManager] fileSystemAttributesAtPath:NSHomeDirectory()];
    NSString *diskFreeSize = [systemAttributes objectForKey:@"NSFileSystemFreeSize"];
    return diskFreeSize;
}

#pragma mark - ************************************* 跳转到系统设置里 *************************************

#pragma mark 类型
/*
 About                       = prefs:root=General&path=About
 Accessibility               = prefs:root=General&path=ACCESSIBILITY
 Airplane Mode On            = prefs:root=AIRPLANE_MODE
 Auto-Lock                   = prefs:root=General&path=AUTOLOCK
 Brightness                  = prefs:root=Brightness
 Bluetooth                   = prefs:root=General&path=Bluetooth
 Date & Time                 = prefs:root=General&path=DATE_AND_TIME
 FaceTime                    = prefs:root=FACETIME
 General                     = prefs:root=General
 Keyboard                    = prefs:root=General&path=Keyboard
 iCloud                      = prefs:root=CASTLE
 iCloud Storage & Backup     = prefs:root=CASTLE&path=STORAGE_AND_BACKUP
 International               = prefs:root=General&path=INTERNATIONAL
 Location Services           = prefs:root=LOCATION_SERVICES
 Music                       = prefs:root=MUSIC
 Music Equalizer             = prefs:root=MUSIC&path=EQ
 Music Volume Limit          = prefs:root=MUSIC&path=VolumeLimit
 Network                     = prefs:root=General&path=Network
 Nike + iPod                 = prefs:root=NIKE_PLUS_IPOD
 Notes                       = prefs:root=NOTES
 Notification                = prefs:root=NOTIFICATIONS_ID
 Phone                       = prefs:root=Phone
 Photos                      = prefs:root=Photos
 Profile                     = prefs:root=General&path=ManagedConfigurationList
 Reset                       = prefs:root=General&path=Reset
 Safari                      = prefs:root=Safari
 Siri                        = prefs:root=General&path=Assistant
 Sounds                      = prefs:root=Sounds
 Software Update             = prefs:root=General&path=SOFTWARE_UPDATE_LINK
 Store                       = prefs:root=STORE
 Twitter                     = prefs:root=TWITTER
 Usage                       = prefs:root=General&path=USAGE
 VPN                         = prefs:root=General&path=Network/VPN
 Wallpaper                   = prefs:root=Wallpaper
 Wi-Fi                       = prefs:root=WIFI
 Setting                     = prefs:root=INTERNET_TETHERING
 */

//跳转到系统设置
void WHE_WDAppOpenSettings(WHEWDAppOpenSettingsType appOpenSettingsType) {

    switch (appOpenSettingsType) {
            // ********** 系统-设置 **********
        case WHEWDAppOpenSettingsType_Setting:
        {
            if (IS_SYSTEM_IOS10) {
                //ios10及以上固件版本
                [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"App-prefs:root=INTERNET_TETHERING"] options:@{} completionHandler:nil];
            }
            else {
                //ios7
                [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"prefs:root=INTERNET_TETHERING"]];
            }
        }
            break;
            
            // ********** 系统-WiFi **********
        case WHEWDAppOpenSettingsType_WiFi:
        {
            if (IS_SYSTEM_IOS10) {
                //ios10及以上固件版本
                [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"App-prefs:root=WIFI"] options:@{} completionHandler:nil];
            }
            else {
                //ios7
                [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"prefs:root=WIFI"]];
            }
        }
            break;
            
            // ********** 系统-app设置或通知 **********
        case WHEWDAppOpenSettingsType_Notification:
        {
            if (IS_SYSTEM_IOS10) {
                //ios10及以上固件版本
                [[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString] options:@{} completionHandler:nil];
            }
            else if (IS_SYSTEM_IOS8) {
                //ios8-9 固件版本
                [[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString]];
            }
            else {
                //ios7
                [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"prefs:root=NOTIFICATIONS_ID"]];
            }
        }
            break;
            
        default:
            break;
    }

    //        if ([[UIApplication sharedApplication] canOpenURL:url]) {
    //        }
}


@end



#pragma mark - ********************** 压缩、裁剪 图片; 颜色转为图片; UIView转为图片 **********************

#pragma mark 压缩图片
UIImage *whe_compactImgToMaxWidth(UIImage *oldImage, CGFloat maxWidth, CGFloat scaleFloat, BOOL opaque)
{
    CGSize compactSize;
    if(oldImage.size.width < maxWidth) {
        compactSize = oldImage.size;
    } else {
        compactSize.width = maxWidth;
        compactSize.height = maxWidth / oldImage.size.width * oldImage.size.height;
    }
    
    UIGraphicsBeginImageContextWithOptions(compactSize, opaque, scaleFloat);
    CGRect newRect = CGRectMake(0, 0, compactSize.width, compactSize.height);
    [oldImage drawInRect:newRect];
    UIImage *newImg = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    return newImg;
}

#pragma mark 裁剪图片
UIImage *whe_croppedImageFromCroppedRect(UIImage *oldImage, CGRect croppedRect)
{
    croppedRect = WHE_CGRectIntMakeWithFrame(croppedRect);
    CGImageRef subImageRef = CGImageCreateWithImageInRect(oldImage.CGImage, croppedRect);
    UIGraphicsBeginImageContext(croppedRect.size);
    CGContextRef context = UIGraphicsGetCurrentContext();
    CGContextDrawImage(context, CGRectMake(0, 0, CGImageGetWidth(subImageRef), CGImageGetHeight(subImageRef)), subImageRef);
    UIImage* smallImage = [UIImage imageWithCGImage:subImageRef];
    UIGraphicsEndImageContext();
    CGImageRelease(subImageRef);
    return smallImage;
}

#pragma mark UIView转为图片
UIImage *whe_conversionImageFromView(UIView *cView, CGRect imgRect, CGFloat scaleFloat, BOOL opaque) {
    
    UIGraphicsBeginImageContextWithOptions(imgRect.size, opaque, scaleFloat);
    [cView.layer renderInContext:UIGraphicsGetCurrentContext()];
    UIImage *newImg = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    return newImg;
}



#pragma mark - ************************************************ 响应对象的SEL方法 ************************************************
BOOL wheRespondsToSelMethodWithIdSel(id wTarget, SEL toSEL, id firstObject, id twoObject)
{
    BOOL isRespods = NO;
    if( [wTarget respondsToSelector:toSEL] ) {
        isRespods = YES;
        IMP imp = [wTarget methodForSelector:toSEL];
        void (*func)(id, SEL, id, id) = (void *)imp;
        func(wTarget, toSEL, firstObject, twoObject);
    }
    return isRespods;
}




#pragma mark - ************************************************ 编译时间 ************************************************
static NSString *compileDateStr = nil;
NSString *whe_compileBuildDateString()
{
    if(compileDateStr && [compileDateStr length] > 0) {
        return compileDateStr;
    }else {
        NSString* pstr = [NSString stringWithCString:__DATE__ encoding:NSASCIIStringEncoding];
        NSString* strTime = [NSString stringWithCString:__TIME__ encoding:NSASCIIStringEncoding];
        pstr = [NSString stringWithFormat:@"%@ %@", pstr, strTime];
        
        NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
        [dateFormatter setDateStyle:NSDateFormatterMediumStyle];
        [dateFormatter setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"en_US"]];
        
        [dateFormatter setDateFormat:@"MM dd yyyy HH:mm:ss"];
        NSDate *date = [dateFormatter dateFromString:pstr];
        
        [dateFormatter setDateFormat:@"yyyyMMddHHmmss"];
        
        compileDateStr = [dateFormatter stringFromDate:date];
        if( nil == compileDateStr ) {
            compileDateStr = pstr;
        }
        if( nil == compileDateStr ) {
            compileDateStr = @"";
        }
        return compileDateStr;
    }
}

