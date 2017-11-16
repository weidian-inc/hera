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


#define kLeftMargin_ImageView       15

#import "WHEAssetsGroupCell.h"

#import "WHEFetchImageManager.h"



@interface WHEAssetsGroupCell ()

/// 标题
@property (nonatomic, strong) UILabel       *tileLabel;
/// 缩略图
@property (nonatomic, strong) UIImageView   *iconImageView;

@end

@implementation WHEAssetsGroupCell

- (instancetype)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier
{
    self =[super initWithStyle:style reuseIdentifier:reuseIdentifier];
    if(self) {
        [self glSetup];
    }
    return self;
}
+ (CGFloat)viewHeight
{
    return 60;
}

- (CGSize)targetSize
{
    CGFloat border = [WHEAssetsGroupCell viewHeight] * ([UIScreen mainScreen].scale);
    return CGSizeMake(border, border);
}


- (void)glSetup
{
    if (!_tileLabel) {
        _tileLabel = [[UILabel alloc] init];
        _tileLabel.font = [UIFont systemFontOfSize:15];
        _tileLabel.textColor = [UIColor blackColor];
        [self addSubview:_tileLabel];
    }
    
    if (!_iconImageView) {
        _iconImageView = [[UIImageView alloc] init];
        [self addSubview:_iconImageView];
    }
}

- (void)fillData:(WHEFetchImageGroup *)group
{
    if (group) {
        // title
        _tileLabel.text = group.title;
        // image
        typeof(self) __weak weak_self  =self;
        [[WHEFetchImageManager sharedInstance] fetchPostImageWithGroup:group targetSize:[self targetSize] completion:^(UIImage *postImage) {
            if (postImage) {
                weak_self.iconImageView.image = postImage;
            }
        }];
    }
}


- (void)layoutSubviews
{
    [super layoutSubviews];
    
    _iconImageView.frame = CGRectMake(kLeftMargin_ImageView, 0, self.bounds.size.height, self.bounds.size.height);
//    self.leftMarginLine = _iconImageView.maxX;
    CGFloat x = CGRectGetMaxX(_iconImageView.frame) + kLeftMargin_ImageView;
    _tileLabel.frame = CGRectMake(x, 0, self.bounds.size.width - x - kLeftMargin_ImageView * 2, self.bounds.size.height);
}


@end

