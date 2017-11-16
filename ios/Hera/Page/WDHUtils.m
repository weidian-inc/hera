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


#import "WDHUtils.h"

@implementation WDHUtils

+ (UIColor *)SMRGB:(unsigned int)rgbValue{
    return [WDHUtils SMRGBA:rgbValue alpha:1.0];
}

+ (UIColor *)SMRGBA:(unsigned int)rgbValue alpha:(float)alpha
{
    return [UIColor colorWithRed:(float)((rgbValue & 0xFF0000) >> 16) / 255.0 green:(float)((rgbValue & 0x00FF00) >> 8) / 255.0 blue:(float)(rgbValue & 0x0000FF) / 255.0 alpha:alpha];
}

//颜色转换如字符串#c60a1e -> UIColor
+ (UIColor *) WH_Color_Conversion:(NSString *)Color_Value {
    if (!Color_Value) {
        return nil;
    }
    
    // 判断是否为16进制格式
    NSRegularExpression *reg = [[NSRegularExpression alloc] initWithPattern:@"^#([0-9a-fA-F]{6})$" options:NSRegularExpressionAnchorsMatchLines error:nil];
    NSUInteger numberOfMaches = [reg numberOfMatchesInString:Color_Value options:0 range:NSMakeRange(0, Color_Value.length)];
    
    if (numberOfMaches == 1) {
        NSString *Str = [[Color_Value stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] uppercaseString];
        if ([Color_Value hasPrefix:@"#"]) {
            Str = [Color_Value substringFromIndex:1];
        }
        
        NSString * WH_StrRed = [Str substringToIndex:2];
        NSString * WH_StrGreen = [[Str substringFromIndex:2] substringToIndex:2];
        NSString * WH_StrBlue = [[Str substringFromIndex:4] substringToIndex:2];
        unsigned int r = 0,  g = 0, b = 0;
        [[[NSScanner alloc] initWithString:WH_StrRed] scanHexInt:&r];
        [[[NSScanner alloc] initWithString:WH_StrGreen] scanHexInt:&g];
        [[[NSScanner alloc] initWithString:WH_StrBlue] scanHexInt:&b];
        
        return [UIColor colorWithRed:(float)(r)/255.0 green:(float)(g)/255.0 blue:(float)(b)/255.0 alpha:1];
    }
	
	//兼容3位的情况如 #333
	reg = [[NSRegularExpression alloc] initWithPattern:@"^#([0-9a-fA-F]{3})$" options:NSRegularExpressionAnchorsMatchLines error:nil];
	numberOfMaches = [reg numberOfMatchesInString:Color_Value options:0 range:NSMakeRange(0, Color_Value.length)];
	
	if (numberOfMaches == 1) {
		NSString *Str = [[Color_Value stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] uppercaseString];
		if ([Color_Value hasPrefix:@"#"]) {
			Str = [Color_Value substringFromIndex:1];
		}
		
		NSString * WH_StrRed = [Str substringToIndex:1];
		NSString * WH_StrGreen = [Str substringWithRange:NSMakeRange(1, 1)];
		NSString * WH_StrBlue = [Str substringWithRange:NSMakeRange(2, 1)];
		unsigned int r = 0,  g = 0, b = 0;
		[[[NSScanner alloc] initWithString:[WH_StrRed stringByAppendingString:WH_StrRed]] scanHexInt:&r];
		[[[NSScanner alloc] initWithString:[WH_StrGreen stringByAppendingString:WH_StrGreen]] scanHexInt:&g];
		[[[NSScanner alloc] initWithString:[WH_StrBlue stringByAppendingString:WH_StrBlue]] scanHexInt:&b];
		
		return [UIColor colorWithRed:(float)(r)/255.0 green:(float)(g)/255.0 blue:(float)(b)/255.0 alpha:1];
	}
	
    // 兼容black和white
    if ([Color_Value compare:@"black" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
        return UIColor.blackColor;
    } else if ([Color_Value compare:@"white" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
        return UIColor.whiteColor;
    }
    
    return nil;
}

+ (CGSize)getTextSize:(NSString *)text font:(UIFont *)font {
    CGSize size = CGSizeMake(MAXFLOAT, MAXFLOAT);
    NSDictionary *dic = @{NSFontAttributeName:font};
    CGSize strSize = [text boundingRectWithSize:size options:NSStringDrawingUsesLineFragmentOrigin attributes:dic context:nil].size;
    return strSize;
}

+ (CGFloat) getTextHeight:(NSString *)text font:(UIFont *)font width:(CGFloat)width {
    CGSize size = CGSizeMake(width, MAXFLOAT);

    NSDictionary *dic = @{NSFontAttributeName:font};
    CGSize strSize = [text boundingRectWithSize:size options:NSStringDrawingUsesLineFragmentOrigin attributes:dic context:nil].size;
    return strSize.height;
}

+ (CGFloat) getTextWidth:(NSString *)text font:(UIFont *)font height:(CGFloat)height {
    CGSize size = CGSizeMake(MAXFLOAT, height);
    
    NSDictionary *dic = @{NSFontAttributeName:font};
    CGSize strSize = [text boundingRectWithSize:size options:NSStringDrawingUsesLineFragmentOrigin attributes:dic context:nil].size;
    return strSize.height;
}

+ (UIImage *)imageWithImage:(UIImage *)image scaledToSize:(CGSize)newSize {
    CGFloat scale = [[UIScreen mainScreen]scale];
    
    UIGraphicsBeginImageContextWithOptions(newSize, NO, scale);
    [image drawInRect:CGRectMake(0, 0, newSize.width, newSize.height)];
    UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    return newImage;
}

+ (UIImage *)imageFromColor:(UIColor *)color rect:(CGRect)rect {
    UIGraphicsBeginImageContext(rect.size);
    
    CGContextRef context = UIGraphicsGetCurrentContext();
    CGContextSetFillColorWithColor(context, color.CGColor);
    CGContextFillRect(context, rect);
    UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
    
    UIGraphicsEndImageContext();
    
    return image;
}

@end

