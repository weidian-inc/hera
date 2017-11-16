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


#import <UIKit/UIKit.h>

@interface WDHUtils : NSObject

+ (UIColor *)SMRGB:(unsigned int)rgbValue;
+ (UIColor *)SMRGBA:(unsigned int)rgbValue alpha:(float)alpha;

//颜色转换如字符串#c60a1e -> UIColor
+ (UIColor *) WH_Color_Conversion:(NSString *)Color_Value;

/**
 获取文本大小

 @param text 文本信息
 @param font 字体类型
 */
+ (CGSize)getTextSize:(NSString *)text font:(UIFont *)font;

/**
 获取文本高度

 @param text 文本信息
 @param font 字体类型
 @param width 字体宽度
 */
+ (CGFloat) getTextHeight:(NSString *)text font:(UIFont *)font width:(CGFloat)width;

/**
 获取文本高度

 @param text 文本信息
 @param font 字体类型
 @param height 字体高度
 */
+ (CGFloat) getTextWidth:(NSString *)text font:(UIFont *)font height:(CGFloat)height;

/**
 压缩图片
 */
+ (UIImage *)imageWithImage:(UIImage *)image scaledToSize:(CGSize)newSize;

/**
 生产纯色图片
 
 @param rect 图片大小
 */
+ (UIImage *)imageFromColor:(UIColor *)color rect:(CGRect)rect;

@end

