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


#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#define WDSTAG_FOR_NAVITEM_BUTTON      -1

@interface WHECommonUtil : NSObject

#pragma mark - common UI

/**
 生成返回按钮

 @param target target
 @param selector selector
 @return backBarButton
 */
+ (UIBarButtonItem *)backBarButtonItemWithTarget:(id)target selector:(SEL)selector;


/**
 生成左边的按钮

 @param target target
 @param selector selector
 @param title 文字
 @return 按钮
 */
+ (UIBarButtonItem *)leftBarButtonItemWithTarget:(id)target selector:(SEL)selector andTitle:(NSString *)title;


/**
 生成右边按钮

 @param target target
 @param selector selector
 @param image 图
 @param title 文字
 @return 按钮
 */
+ (UIBarButtonItem *)rightBarButtonItemWithTarget:(id)target selector:(SEL)selector image:(id)image andTitle:(NSString *)title;


/**
 获取当前app的window

 @return window
 */
+ (UIWindow *)appWindow;


/**
 获取当前app的NavigationController

 @return NavigationController
 */
+ (UINavigationController *)currentNavigationController;


/**
 生成NavigationController

 @param controller 根控制器
 @return NavigationController
 */
+ (UINavigationController *)navControllerWithRootViewController:(UIViewController *)controller;

#pragma mark - animation

/**
 推动动画

 @param view 视图
 @param direction 方向
 */
+ (void)animatPushOnView:(UIView *)view fromDirection:(NSString *)direction;


/**
 翻转动画

 @param view 视图
 @param direction 方向
 */
+ (void)animatFlipOnView:(UIView *)view fromDirection:(NSString *)direction;




/**
 * 返回apiv
 *
 * return apiv，字符串
 *
 */
+ (NSString *)apiv;



/**
 *  @brief  返回appid
 *
 *  @return appid
 */
+ (NSString *)appID;


/**
 设备类型

 @return ///< ipad\iphone
 */
+ (NSString *)platform;


/**
 获取当前UA
 
 @return UA
 */
+ (NSString *)currentUserAgent;


/**
 获取微店的group标识

 @return group标识
 */
+ (NSString *)appGroup;

/**
 设置新的UA
 
 @param userAgent ua
 */
+ (void)saveUserAgent:(NSString *)userAgent;


/**
 设置微店启动时的ua
 */
+ (void)updateAppUA;

/**
 更新网络状态的UA
 */
+ (void)updateNetStatusUA;

/**
 *  @brief  版本引导升级开关key
 *
 *  @return key
 */
+ (NSString *)tutorialSwitchKey;

/**
 *  @brief  把Frame转化为整型
 *  @param  oldFrame 为Frame值
 *  @return 整型的Frame
 */
CGRect WHE_CGRectIntMakeWithFrame(CGRect oldFrame);

/**
 *  @brief 将坐标值转换为整型
 *
 *  @param x x
 *  @param y y
 *  @param width 宽
 *  @param height 高
 *
 *  @return 整型Rect结构
 */
CGRect WHE_CGRectIntMake(CGFloat x, CGFloat y, CGFloat width, CGFloat height);

/**
 *  转换时间戳字符串，到指定时区的yyyy-MM-dd 格式
 *
 *  @param timezone        时区 例如北京为正八区，传8
 *  @param timestampString 时间戳字符串
 *
 *  @return formath后的时间字符串
 */
+ (NSString *)formatterStringFromTimeZone:(int)timezone timestampString:(NSString *)timestampString;

/**
 *  @author Acorld, 15-02-08
 *
 *  @brief  是否有打开相机权限
 *
 *  @return YES/NO
 */
+ (BOOL)detectHasPermissionOfAccessVideo;


/**
 判断是否可以访问相册

 @return 是/否
 */
+ (BOOL)isCanUsePhotos;


/**
 *  @author Acorld, 16-09-14
 *
 *  @brief 打开微信
 *
 *  @return 是否成功打开
 */
+ (BOOL)openWechat;

/**
 *  @author Acorld, 16-09-14
 *
 *  @brief 调起短信
 *
 *  @param params 给短信app传递的参数，如接受方手机号数组（phoneNumbers）、输入内容（content）
 *
 *  @return 是否成功调起
 */
+ (BOOL)openSMSWithParams:(NSDictionary *)params;


/**
 *  @author Acorld, 16-08-07
 *
 *  @brief 读取磁盘剩余空间
 *
 *  @return size
 */
+ (NSString *)phoneDiskFreeSize;

// ************************************* 跳转到系统设置里 *************************************
/**
 *  @author Snail
 *
 *  @brief  跳转到系统设置里的类型：如通知、相册、相机等
 */
typedef enum : NSInteger
{
    /**
     *  设置
     */
    WHEWDAppOpenSettingsType_Setting = 1,
    
    /**
     *  WiFi
     */
    WHEWDAppOpenSettingsType_WiFi,
    
    /**
     *  通知
     */
    WHEWDAppOpenSettingsType_Notification,
    
} WHEWDAppOpenSettingsType;


/**
 *  @author Snail, 16-1-14
 *
 *  @brief  跳转到系统设置里
 *  @param  appOpenSettingsType 系统设置里的类型：如通知、相册、相机等
 *
 */
void WDAppOpenSettings(WHEWDAppOpenSettingsType appOpenSettingsType);

@end



// ************************************************ 压缩图片、裁剪图片、UIView转为图片 ************************************************

/**
 *  @author Snail, 16-1-14
 *
 *  @brief  压缩图片
 *
 *  @param  oldImage 需要裁剪的图片
 *  @param  maxWidth 压缩图片的宽度
 *  @param  scaleFloat 屏幕密度（可适配@2X）
 *  @param  opaque 非透明(透明：NO。不透明：YES,默认黑色)
 *
 *  @return UIImage 压缩后的图片
 *
 */
UIImage *whe_compactImgToMaxWidth(UIImage *oldImage, CGFloat maxWidth, CGFloat scaleFloat, BOOL opaque);



/**
 *  @author Snail, 16-1-14
 *
 *  @brief  裁剪图片
 *
 *  @param  oldImage 需要裁剪的图片
 *  @param  croppedRect 裁剪的区域大小
 *
 *  @return UIImage 裁剪后的图片
 *
 */
UIImage *whe_croppedImageFromCroppedRect(UIImage *oldImage, CGRect croppedRect);



/**
 *  @author Snail, 16-1-14
 *
 *  @brief  UIView转为图片
 *
 *  @param  cView 需要转化的UI
 *  @param  imgRect 转化后图片区域大小
 *  @param  scaleFloat 屏幕密度（可适配@2X）
 *  @param  opaque 非透明(透明：NO。不透明：YES,默认黑色)
 *
 *  @return UIImage 与UI相同的图片
 *
 */
UIImage *whe_conversionImageFromView(UIView *cView, CGRect imgRect, CGFloat scaleFloat, BOOL opaque);



// ************************************************




// ************************************************ 响应对象的SEL方法 ************************************************
/**
 *
 *  @brief  响应对象的SEL方法
 *
 *  @param  wTarget 需要响应的对象
 *  @param  toSEL 响应对象的函数
 *  @param  firstObject 第一个参数
 *  @param  twoObject 第二个参数
 *
 *  @return isRespods 响应结果是否成功。yes为成功
 *
 */
BOOL wheRespondsToSelMethodWithIdSel(id wTarget, SEL toSEL, id firstObject, id twoObject);



// ************************************************




// ************************************************ 编译时间 ************************************************
/**
 *
 *  @brief  编译时间
 *
 *  @return NSString 如：20170405165012
 *
 */
NSString *whe_compileBuildDateString();




// ************************************************









