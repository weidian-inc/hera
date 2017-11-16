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


#import "WDHTabBar.h"
#import "WDHPageModel.h"
#import "WDHUtils.h"

//基于系统的tabbaritem
@interface WDHTabBarItem : UITabBarItem

@property (nonatomic, strong) WDHTabbarItemStyle *itemStyle;

@end

@implementation WDHTabBarItem

@end

//基于view的tabbaritem
@interface WDHTabBarViewItem : NSObject

@property (nonatomic, strong) WDHTabbarItemStyle *itemStyle;

/// title
@property (nonatomic, copy) NSString *title;

/// 正常颜色
@property (nonatomic, strong) UIColor *normalColor;

/// 选择后的颜色
@property (nonatomic, strong) UIColor *selectedColor;

@end

@implementation WDHTabBarViewItem

@end

@interface WDHTabBar ()<UITabBarDelegate>
{
    NSArray *_items;
}

/// delegate
@property (nonatomic, weak) id delegate;

/// items
@property (nonatomic, getter=items,strong) NSArray *items;

/// 适配器真实对象
@property (nonatomic, strong) UIView *wdh_view;

//tabbar的位置，可选值 bottom、top，默认bottom
@property (nonatomic, assign) WDHTabBarPositionStyle positionStyle;

@property (nonatomic, copy) void (^DidTapItemBlock)(NSString *pagePath,NSUInteger pageIndex);

@property (nonatomic, copy) void (^DidInitDefaultItemBlock)(NSString *pagePath,NSUInteger pageIndex);

@end

#define SCREEN_WIDTH                            [[UIScreen mainScreen] bounds].size.width
#define SCREEN_HEIGHT                           [[UIScreen mainScreen] bounds].size.height

@implementation WDHTabBar

- (UIView *)generateWDHTabbarWithPoistion:(NSString *)position
{
    if ([position isEqualToString:@"top"]) {
        _positionStyle = WDHTabBarStyleTop;
    }else {
        _positionStyle = WDHTabBarStyleBottom;
    }
    
//    _positionStyle = WDHTabBarStyleTop;
    
    if (_positionStyle == WDHTabBarStyleBottom) {
        UITabBar *tabbar = [[UITabBar alloc] init];
        self.wdh_view = tabbar;
        return tabbar;
    }else {
        UIView *view = [[UIView alloc] initWithFrame:(CGRect){0,0,SCREEN_WIDTH,44}];
        self.wdh_view = view;
        return view;
    }
}

- (void)setBackgroundColor:(NSString *)backgroundColor {
    _backgroundColor = backgroundColor;

    UIColor *bgColor = [WDHUtils WH_Color_Conversion:backgroundColor];
    if (bgColor) {
        if (_positionStyle == WDHTabBarStyleBottom) {
            [(UITabBar *)self.wdh_view setBackgroundImage:[WDHUtils imageFromColor:bgColor rect:CGRectMake(0, 0, 1, 1)]];
        }else {
            //自定义
            [(UIView *)self.wdh_view setBackgroundColor:bgColor];
        }
    }
}

- (void)configTabbarItemList:(NSArray *)list
{
	if (!list) {
		return;
	}
	
    NSMutableArray *items = [NSMutableArray new];
    for (int i = 0; i < list.count; i++)
    {
        WDHTabbarItemStyle *dic = list[i];
        if (_positionStyle == WDHTabBarStyleBottom) {
            WDHTabBarItem *item = [self addTabbarItem:dic];
            [items addObject:item];
        }else {
            WDHTabBarViewItem *item = [self addTabbarViewItem:dic];
            [items addObject:item];
        }
    }
    
    [self setDelegate:self];
    self.items = items;
}

- (void)setDelegate:(id)delegate
{
    if (_delegate != delegate) {
        _delegate = delegate;
        
        if (_positionStyle == WDHTabBarStyleBottom) {
            [(UITabBar *)self.wdh_view setDelegate:delegate];
        }else {
            //自定义
        }
    }
}

- (WDHTabBarItem *)addTabbarItem:(WDHTabbarItemStyle *)itemStyle
{
    NSString *title = itemStyle.title;
    NSString *iconPath = itemStyle.iconPath;
    NSString *selectedIconPath = itemStyle.selectedIconPath;
    
    WDHTabBarItem *barItem = [[WDHTabBarItem alloc] init];
    barItem.itemStyle = itemStyle;
    barItem.title = title;
	
	UIColor *normalColor = [WDHUtils WH_Color_Conversion:_color];
	if (normalColor) {
		[barItem setTitleTextAttributes:@{NSForegroundColorAttributeName: normalColor} forState:UIControlStateNormal];
	}
	
	UIColor *selectedColor = [WDHUtils WH_Color_Conversion:_selectedColor];
	if (selectedColor) {
		[barItem setTitleTextAttributes:@{NSForegroundColorAttributeName: selectedColor} forState:UIControlStateSelected];
	}
    
    if (iconPath) {
        barItem.image = [[WDHUtils imageWithImage:[UIImage imageWithContentsOfFile:iconPath] scaledToSize:CGSizeMake(30, 30)] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal];
    }
    
    if (selectedIconPath) {
        barItem.selectedImage = [[WDHUtils imageWithImage:[UIImage imageWithContentsOfFile:selectedIconPath] scaledToSize:CGSizeMake(30, 30)] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal];
    }

    
    return barItem;
}

- (WDHTabBarViewItem *)addTabbarViewItem:(WDHTabbarItemStyle *)itemStyle
{
    NSString *title = itemStyle.title;
    WDHTabBarViewItem *barItem = [[WDHTabBarViewItem alloc] init];
    barItem.itemStyle = itemStyle;
    barItem.title = title;
    barItem.normalColor = [WDHUtils WH_Color_Conversion:_color];
    barItem.selectedColor = [WDHUtils WH_Color_Conversion:_selectedColor];
    return barItem;
}

- (void)didTapItem:(void(^)(NSString *pagePath,NSUInteger pageIndex))itemBlock
{
    self.DidTapItemBlock = itemBlock;
}

- (void)didInitDefaultItem:(void(^)(NSString *pagePath,NSUInteger pageIndex))itemBlock
{
    self.DidInitDefaultItemBlock = itemBlock;
}

- (void)showDefaultTabarItem
{
    for (int i = 0; i < self.items.count; i++)
    {
        WDHTabBarItem *barItem = (WDHTabBarItem *)self.items[i];
        if (barItem.itemStyle.isDefaultPath) {
            [self wdh_setSelectedItem:barItem];
            if (self.DidInitDefaultItemBlock) {
                self.DidInitDefaultItemBlock(barItem.itemStyle.pagePath,i);
            }
            break;
        }
    }
}

- (void)wdh_setSelectedItem:(id)tabbarItem
{
    if (_positionStyle == WDHTabBarStyleBottom) {
        [(UITabBar *)self.wdh_view setSelectedItem:tabbarItem];
    }else {
        //自定义
        NSUInteger index = [self.items indexOfObject:tabbarItem];
        
        for (int i = 0; i < self.items.count; i++)
        {
            UIButton *btn = [self.wdh_view viewWithTag:i+100];
            if (i==index) {
                btn.selected = YES;
            }else {
                btn.selected = NO;
            }
        }
    }
}

- (void)selectItemAtIndex:(NSUInteger)itemIndex
{
    WDHTabBarItem *barItem = (WDHTabBarItem *)self.items[itemIndex];
    [self wdh_setSelectedItem:barItem];
    if (self.DidTapItemBlock) {
        self.DidTapItemBlock(barItem.itemStyle.pagePath,itemIndex);
    }
}

#pragma mark - 适配器
#pragma mark -

- (void)setItems:(NSArray *)items
{
    _items = items;
    if (_positionStyle == WDHTabBarStyleBottom) {
        [(UITabBar *)self.wdh_view setItems:items];
    }else {
        CGFloat itemW = self.wdh_view.bounds.size.width/items.count;
        CGFloat itemH = 49;
        [self.wdh_view.subviews makeObjectsPerformSelector:@selector(removeFromSuperview)];
        
        for (int i = 0; i < items.count; i++)
        {
            @autoreleasepool {
                WDHTabBarViewItem *item = items[i];
                CGFloat offX = i*itemW;
                UIButton *btn = [UIButton buttonWithType:UIButtonTypeCustom];
                btn.frame = (CGRect){offX,0,itemW,itemH};
                [btn.titleLabel setFont:[UIFont systemFontOfSize:16]];
                [btn setTitleColor:item.normalColor forState:UIControlStateNormal];
                [btn setTitleColor:item.selectedColor forState:UIControlStateSelected];
                [btn setTitle:item.title forState:UIControlStateNormal];
                [btn addTarget:self action:@selector(didTapTabbarView:) forControlEvents:UIControlEventTouchUpInside];
                btn.tag = 100+i;
                [self.wdh_view addSubview:btn];
                btn.center = CGPointMake(offX+(CGFloat)itemW/2, (CGFloat)itemH/2);
            }
        }
    }
}

- (NSArray *)items
{
    if (_positionStyle == WDHTabBarStyleBottom) {
        return [(UITabBar *)self.wdh_view items];
    }
    
    return _items;
}

#pragma mark - Callback
#pragma mark -

- (void)didTapTabbarView:(UIButton *)sender
{
    [self selectItemAtIndex:sender.tag-100];
}

- (void)tabBar:(UITabBar *)tabBar didSelectItem:(WDHTabBarItem *)item
{
    if (self.DidTapItemBlock) {
        self.DidTapItemBlock(item.itemStyle.pagePath,[self.items indexOfObject:item]);
    }
}

@end

