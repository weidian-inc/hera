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


#import "WHEScanView.h"
#import "WDHBundleUtil.h"

@interface WHEScanView()

@property (nonatomic, strong) UIImageView *lineImageView;

@end

@implementation WHEScanView

- (instancetype)init {
    
    if (self = [super init]) {
        [self setupViews];
    }
    
    return self;
}

- (instancetype)initWithFrame:(CGRect)frame {
	if (self = [super initWithFrame:frame]) {
		[self setupViews];
	}
	
	return self;
}


- (void)drawRect:(CGRect)rect {
    
    UIBezierPath *path = [[UIBezierPath alloc] init];
    CGFloat lineLength = 10;
    
    //左上角
    CGPoint point = CGPointMake(0, lineLength);
    [path moveToPoint:point];
    point.y = 0;
    [path addLineToPoint:point];
    point.x = lineLength;
    [path addLineToPoint:point];
    
    //右上角
    point.x = rect.size.width - lineLength;
    [path moveToPoint:point];
    point.x = rect.size.width;
    [path addLineToPoint:point];
    point.y += lineLength;
    [path addLineToPoint:point];
    
    //右下角
    point.y = rect.size.height - lineLength;
    [path moveToPoint: point];
    point.y = rect.size.height;
    [path addLineToPoint:point];
    point.x = rect.size.width - lineLength;
    [path addLineToPoint:point];
    
    //左下角
    point.x = lineLength;
    [path moveToPoint:point];
    point.x = 0;
    [path addLineToPoint:point];
    point.y = rect.size.height - lineLength;
    [path addLineToPoint:point];
    
    //还原到起点
    point.y = lineLength;
    [path moveToPoint:point];
    [path closePath];
    
    CAShapeLayer *shapeLayer = [CAShapeLayer layer];
    shapeLayer.frame = rect;
    shapeLayer.path = path.CGPath;
    shapeLayer.lineWidth = 2.0;
    shapeLayer.fillColor = UIColor.clearColor.CGColor;
    shapeLayer.strokeColor = UIColor.greenColor.CGColor;
    [self.layer insertSublayer:shapeLayer atIndex:0];
}


#pragma mark - Setup

- (void)setupViews {
	
	_lineImageView = [[UIImageView alloc] initWithFrame:CGRectMake(0, 2, self.bounds.size.width, 5.0)];
	_lineImageView.image = [WDHBundleUtil imageFromBundleWithName:@"scanningLine"];
	[self addSubview:_lineImageView];
	
    self.layer.borderColor = UIColor.whiteColor.CGColor;
    self.layer.borderWidth = 1.0 / [UIScreen.mainScreen scale];

}

#pragma mark - Animation

- (void)startAnimation {
    [self stopAnimation];
    
    CABasicAnimation *animation = [CABasicAnimation animationWithKeyPath:@"transform.translation.y"];
    animation.fromValue = @0;
    animation.toValue = @(self.bounds.size.height - self.lineImageView.bounds.size.height);
    animation.duration = 2.5;
    animation.repeatCount = NSIntegerMax;
	[self.lineImageView.layer addAnimation:animation forKey:@"tansitionY"];
}


- (void)stopAnimation {
	[self.lineImageView.layer removeAnimationForKey:@"tansitionY"];
}


@end

