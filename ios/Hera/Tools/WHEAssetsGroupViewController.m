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


#import "WHEAssetsGroupViewController.h"
#import <AssetsLibrary/AssetsLibrary.h>
#import "WHEFetchImageManager.h"
#import "WHEAssetsGroupCell.h"
#import "WHEAssetsListViewController.h"

@interface WHEAssetsGroupViewController ()<UITableViewDataSource,UITableViewDelegate>
@property (nonatomic, strong) UITableView   *tableView;
@property (nonatomic, strong) NSArray       *groupArray;
@end

@implementation WHEAssetsGroupViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    // Do any additional setup after loading the view.
    [self configNavigationBar];
    [self configViews];
    
    
//    [self showLoadingToast];
    [self prepareData];
}

- (void)configNavigationBar
{
    // title
    UILabel *titleLabel             = [[UILabel alloc] init];
    titleLabel.frame                = CGRectMake(([UIScreen mainScreen].bounds.size.width - 160) / 2, 0, 160, 44);
    titleLabel.font                 = [UIFont boldSystemFontOfSize:20.0];
    titleLabel.text                 = @"选择相册";
    titleLabel.textColor            = [UIColor blackColor];
    titleLabel.textAlignment        = NSTextAlignmentCenter;
    titleLabel.backgroundColor      = [UIColor clearColor];
    self.navigationItem.titleView   = titleLabel;
    
    // right
    UIButton *rightButton   = [UIButton buttonWithType:UIButtonTypeCustom];
    rightButton.frame       = CGRectMake(0, 0, 50, 30);
    [rightButton setTitle:@"取消" forState:UIControlStateNormal];
    [rightButton.titleLabel setFont:[UIFont systemFontOfSize:15]];
    [rightButton addTarget:self
                    action:@selector(rightButtonAction:)
          forControlEvents:UIControlEventTouchUpInside];
    [rightButton setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    UIBarButtonItem *rightButtonItem = [[UIBarButtonItem alloc] initWithCustomView:rightButton];
    [self.navigationItem setRightBarButtonItem:rightButtonItem];
}

- (void)configViews
{
    self.view.backgroundColor = [UIColor whiteColor];
    
    if (!self.tableView) {
        self.tableView = [[UITableView alloc] initWithFrame:CGRectZero style:UITableViewStylePlain];
        self.tableView.autoresizingMask = UIViewAutoresizingFlexibleHeight;
        self.tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
        self.tableView.frame = self.view.bounds;
        self.tableView.delegate = self;
        self.tableView.dataSource = self;
        [self.view addSubview:self.tableView];
    }
}

- (void)rightButtonAction:(id)sender
{
    if (self.cancelBlock) {
        self.cancelBlock();
    }
}

- (void)showTips
{
    UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:@"打开相册失败"
                                                        message:@"请在设置->隐私->照片选项中\n设置允许微店访问你的相册。"
                                                       delegate:nil
                                              cancelButtonTitle:@"ok"
                                              otherButtonTitles:nil, nil];
    [alertView show];
}

- (void)prepareData
{
    if ([self isViewLoaded]) {
        // 加载数据
        __weak typeof(self) weak_self = self;
        [WHEFetchImageManager requestAuthorization:^(WHEFetchImageAuthorizationStatus status) {
            if (status == WHEFetchImageAuthorizationStatusDenied ||
                status == WHEFetchImageAuthorizationStatusRestricted) {
                //[weak_self hideLoadingToast];
                [weak_self showTips];
            } else {
                
                dispatch_queue_t queue = dispatch_queue_create("fetchImage", NULL);
                dispatch_async(queue, ^{
                    [[WHEFetchImageManager sharedInstance] fetchImageGroupHasVideo:NO completion:^(NSArray<WHEFetchImageGroup *> *groupArray) {
                        
                        
                        dispatch_async(dispatch_get_main_queue(), ^{
                            Boolean isMain = [NSThread isMainThread];
                            if (isMain) {
                                //[weak_self hideLoadingToast];
                                weak_self.tableView.hidden = ([groupArray count] == 0);
                                weak_self.groupArray = groupArray;
                                
                                if (weak_self.groupArray.count > 0) {
                                    //
                                    [weak_self pushAssetsViewControllerWithAssetGroup:[weak_self.groupArray objectAtIndex:0] animated:NO];
                                } else {
                                    // 没有相册
                                }
                                [weak_self.tableView reloadData];
                                
                            }
                        });
                    }];
                });
            }
        }];
    }
}


- (void)pushAssetsViewControllerWithAssetGroup:(WHEFetchImageGroup *)group animated:(BOOL)animatedFlag
{
    WHEAssetsListViewController *assetsListViewController = [[WHEAssetsListViewController alloc] init];
    assetsListViewController.currentGroup = group;
    assetsListViewController.maxSelectedCount = self.maxSelectedCount;
    assetsListViewController.finishBlock = self.finishBlock;
    assetsListViewController.cancelBlock = self.cancelBlock;
    [self.navigationController pushViewController:assetsListViewController animated:animatedFlag];
}


#pragma mark- UITableViewDataSource,UITableViewDelegate
- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    return 1;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    
    return [WHEAssetsGroupCell viewHeight];
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return [_groupArray count];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *CellIdentifier = @"GLAssetsGroupCell";
    WHEAssetsGroupCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[WHEAssetsGroupCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:CellIdentifier];
        cell.accessoryType = UITableViewCellAccessoryDisclosureIndicator;
        cell.selectionStyle = UITableViewCellSelectionStyleNone;
    }
    
    // data
    if (indexPath.row < _groupArray.count) {
        [cell fillData:[_groupArray objectAtIndex:indexPath.row]];
    }
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.row < _groupArray.count) {
        [self pushAssetsViewControllerWithAssetGroup:[_groupArray objectAtIndex:indexPath.row] animated:YES];
    }
}
@end

