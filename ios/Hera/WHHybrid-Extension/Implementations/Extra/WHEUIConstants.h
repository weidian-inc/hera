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


#ifndef WDSUIConstant_h
#define WDSUIConstant_h


/**
 *
 *  ******************************************* 字体 *******************************************
 *
 */
#pragma mark - 字体函数

#define WDS_FONT(size)                          ([UIFont systemFontOfSize:(size)])
#define WDS_BOLD_FONT(size)                     ([UIFont boldSystemFontOfSize:(size)])
#define FONTNAMESYS(fontName, sz)               [UIFont fontWithName:fontName size:(sz)]
#define WDS_IconFont(sz)                        [UIFont fontWithName:@"weidian_iconfont" size:(sz)]


#pragma mark - layout

#define WDSMarginVertical                       15
#define WDSMarginHorinzontal                    10
#define WDSPaddingVerticalBig                   18
#define WDSPaddingVerticalSmall                 13

//页面自动消失弹层时间
#define DEFAULT_TIP_VIEW_FADING_DURATION        2.0

#pragma mark - button

#define WDSLONG_BUTTON_WIDTH                    (IS_DEVICE_IPHONE_6_Plus) ? 400 : 355

/**
 *
 *  ******************************************* 颜色汇总 *******************************************
 *
 */
#pragma mark - 颜色汇总
#pragma mark 颜色函数

#define UIColorFromRGB(rgbValue)                [UIColor colorWithRed:((float)((rgbValue & 0xFF0000) >> 16))/255.0 green:((float)((rgbValue & 0xFF00) >> 8))/255.0 blue:((float)(rgbValue & 0xFF))/255.0 alpha:1.0]
#define UIColorFromRGBA(rgbValue, alphaValue)   [UIColor colorWithRed:((float)((rgbValue & 0xFF0000) >> 16))/255.0 green:((float)((rgbValue & 0xFF00) >> 8))/255.0 blue:((float)(rgbValue & 0xFF))/255.0 alpha:alphaValue]

#define UIColorRGB(r, g, b)                     [UIColor colorWithRed:(r)/255.0f green:(g)/255.0f blue:(b)/255.0f alpha:1]
#define UIColorRGB_A(r, g, b, a)                [UIColor colorWithRed:(r)/255.0f green:(g)/255.0f blue:(b)/255.0f alpha:(a)]


#pragma mark 具体颜色值
// **************** 老颜色（慢慢更新替换）

#define VIEW_BG_COLOR_3_8                       UIColorFromRGB(0xe8eaea)
#define DEFAULT_BORDER_COLOR                    UIColorFromRGBA(0xd9d9d9, 0.8f)
#define COLOR_DISABLED_BUTTON_TEXT              UIColorRGB(243.0, 71.0, 73.0)
#define DEFAULT_TAB_TITLE_COLOR                 UIColorRGB(100.0, 73.0, 61.0)
#define DEFAULT_TAB_CLK_BG_COLOR                UIColorRGB(96.0, 49.0, 33.0)



// **************** 灰色级

/// 222222 灰黑色A：(如：大标题)
#define     UIColorFromRGB_Gray_A               UIColorFromRGB(0x222222)

/// 404040 灰黑色B：(如：标题)
#define     UIColorFromRGB_Gray_B               UIColorFromRGB(0x404040)

/// 9A9A9A 灰色C：(如：提示文案)
#define     UIColorFromRGB_Gray_C               UIColorFromRGB(0x9A9A9A)

/// D6D6D6 灰色D：(如：提示文案)
#define     UIColorFromRGB_Gray_D               UIColorFromRGB(0xD6D6D6)

/// E5E5E5 灰色E：(如：细线)
#define     UIColorFromRGB_Gray_E               UIColorFromRGB(0xE5E5E5)

/// F7F7F7 灰色F：(如：背景色)
#define     UIColorFromRGB_Gray_F               UIColorFromRGB(0xF7F7F7)

/// D9D9D9 灰色G：(如：偏白色的字体)
#define     UIColorFromRGB_Gray_G               UIColorFromRGB(0xd9d9d9)

/// CCCCCC 灰色H：(如：细线)
#define     UIColorFromRGB_Gray_H               UIColorFromRGB(0xCCCCCC)

/// EEEEEE 灰色I：(如：背景色)
#define     UIColorFromRGB_Gray_I               UIColorFromRGB(0xEEEEEE)

/// 999999 灰色J：(如：小标题)
#define     UIColorFromRGB_Gray_J               UIColorFromRGB(0x999999)

/// d9d9d9 灰色K：(如：分割线)
#define     UIColorFromRGB_Gray_K               UIColorFromRGB(0xd9d9d9)

/// 737373 灰色L：(如：历史订单消息内容)
#define     UIColorFromRGB_Gray_L               UIColorFromRGB(0x737373)

/// CACACA 灰色M  文字、线、框 （例如：社区所有社区一级目录导航分割线）
#define     UIColorFromRGB_Gray_M              UIColorFromRGB(0xCACACA)

/// DDDDDD 灰色N  线、框 （例如：通用弹层的按钮点击态颜色）
#define     UIColorFromRGB_Gray_N              UIColorFromRGB(0xDDDDDD)


// **************** 红色级

/// C60A1E 红色A：(如：价格红色)
#define     UIColorFromRGB_Red_A                UIColorFromRGB(0xC60A1E)

/// FE453A 红色B：(如：背景色)
#define     UIColorFromRGB_Red_B                UIColorFromRGB(0xFE453A)

/// FFB8B4 浅红色C：(如：我的收入列表：已完成交易)
#define     UIColorFromRGB_Red_C                UIColorFromRGB(0xFFB8B4)

/// EB2F2F 红色D：(如：红点颜色)
#define     UIColorFromRGB_Red_D                UIColorFromRGB(0xEB2F2F)

/// B51323 红色E：(如：红点颜色)
#define     UIColorFromRGB_Red_E                UIColorFromRGB(0xB51323)

/// DD5246 红色F：(如：核心用户文案颜色)
#define     UIColorFromRGB_Red_F                UIColorFromRGB(0xDD5246)



// **************** 白色
/// FFFFFF 白色：（背景色)
#define     UIColorFromRGB_White                UIColorFromRGB(0xFFFFFF)



// **************** 绿色级



// **************** 蓝色级

/// 3b7dc1 如：超链接
#define  UIColorFromRGB_Blue_A                UIColorFromRGB(0x3b7dc1)

/// 4384d8 如：按钮
#define  UIColorFromRGB_Blue_B                UIColorFromRGB(0x4384d8)




// **************** 黄色级

/// 0xE69F11 如：我的收入－可提现的 “提现规则说明”文字颜色
#define  UIColorFromRGB_Yellow_A                UIColorFromRGB(0xE69F11)

/// 0xFFF3CD 如：我的收入－可提现的 “提现规则说明”背景颜色
#define  UIColorFromRGB_Yellow_B                UIColorFromRGB(0xFFF3CD)






/**
 *
 *  ******************************************* 图片资源 *******************************************
 *
 */
#pragma mark - 图片资源

#define GL_IMAGE(name)                          [WDHBundleUtil imageFromBundleWithName:(name)]


#endif /* WDSUIConstant_h */


