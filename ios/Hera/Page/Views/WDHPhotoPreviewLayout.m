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

#import "WDHPhotoPreviewLayout.h"

@interface WDHPhotoPreviewLayout ()

@property (nonatomic,strong) NSMutableArray <UICollectionViewLayoutAttributes*>*attributesArray;

@end

@implementation WDHPhotoPreviewLayout

- (NSMutableArray <UICollectionViewLayoutAttributes*>*)attributesArray
{
    if (!_attributesArray) {
        _attributesArray = [NSMutableArray array];
    }
    return _attributesArray;
}

- (void)prepareLayout {
    [super prepareLayout];
    
    self.scrollDirection = UICollectionViewScrollDirectionHorizontal;
    self.itemSize = CGSizeMake(self.collectionView.frame.size.width + self.itemPadding,
                               self.collectionView.frame.size.height);
    
    NSInteger itemTotalCount = [self.collectionView numberOfItemsInSection:0];
    
    [_attributesArray removeAllObjects];
    
    for (int i = 0; i < itemTotalCount; i++)
    {
        NSIndexPath *indexpath = [NSIndexPath indexPathForItem:i inSection:0];
        UICollectionViewLayoutAttributes *attributes = [self layoutAttributesForItemAtIndexPath:indexpath];
        [self.attributesArray addObject:attributes];
    }
}

- (NSArray<UICollectionViewLayoutAttributes *> *)layoutAttributesForElementsInRect:(CGRect)rect
{
    return self.attributesArray;
}

- (UICollectionViewLayoutAttributes *)layoutAttributesForItemAtIndexPath:(NSIndexPath *)indexPath
{
    CGFloat itemWidth = self.collectionView.frame.size.width - self.itemPadding;
    CGFloat itemHeight = self.collectionView.frame.size.height;
    
    NSInteger pageNumber = indexPath.item;
    NSInteger x = pageNumber * self.itemPadding + pageNumber * itemWidth + self.itemPadding * 0.5;
    NSInteger y = 0;
    
    UICollectionViewLayoutAttributes *attributes = [[super layoutAttributesForItemAtIndexPath:indexPath] copy];
    attributes.frame = CGRectMake(x, y, itemWidth, itemHeight);
    
    return attributes;
}

- (CGSize)collectionViewContentSize
{
    CGFloat itemWidth = self.collectionView.frame.size.width - self.itemPadding;
    NSInteger itemTotalCount = [self.collectionView numberOfItemsInSection:0];
    return CGSizeMake(itemTotalCount * itemWidth + self.itemPadding * itemTotalCount, self.collectionView.bounds.size.height);
}

@end
