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


#import "GLView+GLFrame.h"

@implementation UIView (GLFrame)

- (CGFloat)x
{
    return CGRectGetMinX(self.frame);
}

- (void)setX:(CGFloat)x
{
    if (self.x != x)
    {
        CGRect rect = self.frame;
        rect.origin.x = x;
        self.frame = rect;
    }
}

- (CGFloat)y
{
    return CGRectGetMinY(self.frame);
}

- (void)setY:(CGFloat)y
{
    if (self.y != y)
    {
        CGRect rect = self.frame;
        rect.origin.y = y;
        self.frame = rect;
    }
}

- (CGFloat)width
{
    return CGRectGetWidth(self.frame);
}

- (void)setWidth:(CGFloat)width
{
    if (self.width != width)
    {
        CGRect rect = self.frame;
        rect.size.width = width;
        self.frame = rect;
    }
}

- (CGFloat)height
{
    return CGRectGetHeight(self.frame);
}

- (void)setHeight:(CGFloat)height
{
    if (self.height != height)
    {
        CGRect rect = self.frame;
        rect.size.height = height;
        self.frame = rect;
    }
}

- (CGFloat)maxX
{
    return CGRectGetMaxX(self.frame);
}

- (CGFloat)maxY
{
    return CGRectGetMaxY(self.frame);
}

- (CGSize)size
{
    return self.bounds.size;
}

- (void)setSize:(CGSize)size
{
    if (!CGSizeEqualToSize(size, self.size))
    {
        CGRect rect = self.frame;
        rect.size = size;
        self.frame = rect;
    }
}

- (CGPoint)orgin
{
    return self.frame.origin;
}

- (void)setOrgin:(CGPoint)orgin
{
    if (!CGPointEqualToPoint(orgin, self.orgin))
    {
        CGRect rect = self.frame;
        rect.origin = orgin;
        self.frame = rect;
    }
}

+ (CGFloat)viewHeight
{
    return 0;
}

+ (CGFloat)viewWidth
{
    return 0;
}


@end

