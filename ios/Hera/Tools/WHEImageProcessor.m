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


#import "WHEImageProcessor.h"

@implementation WHEImageProcessor

#pragma mark - scale
#pragma mark -

/******************************************
 *
 * 按照图片的原始比例，根据指定的图片宽度缩放图片
 *
 * @param image 图片
 * @param width 指定的图片宽度
 *
 * @return 压缩后的图片
 *
 *****************************************/
+ (UIImage *)scaleImageByOriginalProportion:(UIImage *)image width:(CGFloat)width
{
    if (image.size.width < width) {
        return image;
    }
    else {
        CGSize newSize;
        newSize.width  = width;
        newSize.height = (image.size.height * width) / image.size.width;
        newSize.height = floorf(newSize.height);
        
        UIGraphicsBeginImageContext(newSize);
        [image drawInRect:CGRectMake(0, 0, newSize.width, newSize.height)];
        UIImage *scaledImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        
#ifdef DEBUG
        NSLog(@"原图片width = %f height = %f scale = %f", image.size.width, image.size.height, image.size.width / image.size.height);
        NSLog(@"新图片width = %f height = %f scale = %f", newSize.width, newSize.height, newSize.width/newSize.height);
#endif
        
        return scaledImage;
    }
}


@end

