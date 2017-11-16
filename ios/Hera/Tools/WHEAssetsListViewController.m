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


#define kMarginBottom 44

#define TAG_PROGRESS_VIEW_BKView    54000
#define TAG_PROGRESS_VIEW_LABEL     54001


#define kWidth_progressView         234
#define kHeight_progressView        50
#define kLeftMargin_textLabel       15
#define kRightMargin_textLabel      27
#define kBorder_closeButton         34
#define kRightMargin_closeButton    5
#define UIColorFromRGB(rgbValue)  [UIColor colorWithRed:((float)((rgbValue & 0xFF0000) >> 16))/255.0 green:((float)((rgbValue & 0xFF00) >> 8))/255.0 blue:((float)(rgbValue & 0xFF))/255.0 alpha:1.0]
#define GLUIKIT_SCREEN_WIDTH   [[UIScreen mainScreen] bounds].size.width
#define GLUIKIT_SCREEN_HEIGHT  [[UIScreen mainScreen] bounds].size.height
#import "WHEAssetsListViewController.h"
#import "WHEAssetsPreviewViewController.h"
#import "WHEAssetsListCell.h"
#import "WHEFetchImageAsset.h"
#import "WHEFetchImageManager.h"
#import "WHEFetchImageGroup.h"
#import "GLView+GLFrame.h"
#import "WDHBundleUtil.h"

@interface WHEAssetsListViewController ()
{
    UIButton        *_finishButton;
    UIButton        *_previewButton;
}
@property (nonatomic, strong) UITableView       *tableView;
/// data
@property (nonatomic, strong) NSMutableArray    *assetsArray;
///
@property (nonatomic, strong) NSMutableArray    *selectedAssetsArray;


@property (nonatomic, strong) UIView            *loadingView;
/// 图片上传进度
@property (nonatomic, strong) NSString          *currentProgressStr;

@end

@implementation WHEAssetsListViewController

- (instancetype)init
{
    self = [super init];
    if(self) {
        _assetsArray = [[NSMutableArray alloc] init];
        _selectedAssetsArray = [[NSMutableArray alloc] init];
    }
    return self;
}
- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self name:KFetchPreviewImageSuccessNotification object:nil];
}


- (void)configNavigationBar
{
    
    UILabel *label        = [[UILabel alloc] initWithFrame:CGRectZero];
    label.frame           = CGRectMake(([UIScreen mainScreen].bounds.size.width - 160) / 2, 0, 160, 44);
    label.font            = [UIFont boldSystemFontOfSize:20.0];
    label.textColor       = [UIColor whiteColor];
    label.textAlignment   = NSTextAlignmentCenter;
    label.backgroundColor = [UIColor clearColor];
    label.text            = _currentGroup.name;
    self.navigationItem.titleView = label;
    
    [self.navigationItem setLeftBarButtonItem:self.glLeftItem];
    
    UIButton *rightButton = [UIButton buttonWithType:UIButtonTypeCustom];
    [rightButton addTarget:self action:@selector(rightButtonAction:) forControlEvents:UIControlEventTouchUpInside];
    rightButton.frame = CGRectMake(0, 0, 50, 30);
    [rightButton setTitle:@"取消" forState:UIControlStateNormal];
    [rightButton.titleLabel setFont:[UIFont systemFontOfSize:15]];
    
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithCustomView:rightButton];
}


//- (void)leftButtonAction:(id)sender
//{
//    [self.navigationController popViewControllerAnimated:YES];
//}

- (void)rightButtonAction:(id)sender
{
    if (self.cancelBlock) {
        self.cancelBlock();
    }
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    [self configNavigationBar];
    [self configViews];
    [self performSelectorInBackground:@selector(preparePhotos) withObject:nil];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


- (void)configViews
{
    self.view.backgroundColor = [UIColor whiteColor];
    
    
    if (!self.tableView) {
        self.tableView = [[UITableView alloc] initWithFrame:CGRectZero style:UITableViewStylePlain];
        //        _tableView.
        self.tableView.autoresizingMask = UIViewAutoresizingFlexibleHeight;
        self.tableView.frame = CGRectMake(0, 0, self.view.width, self.view.height - kMarginBottom);
        self.tableView.delegate = self;
        self.tableView.dataSource = self;
        self.tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
        
        [self.view addSubview:self.tableView];
    }
    
    //
    UIView *bottomView = [[UIView alloc] initWithFrame:CGRectMake(0, self.view.bounds.size.height - kMarginBottom, [UIScreen mainScreen].bounds.size.width, kMarginBottom)];
    bottomView.backgroundColor = UIColorFromRGB(0xe8eaea);
    bottomView.autoresizingMask = UIViewAutoresizingFlexibleTopMargin;
    [self.view addSubview:bottomView];
    
    //
    _finishButton = [UIButton buttonWithType:UIButtonTypeCustom];
    _finishButton.frame = CGRectMake([UIScreen mainScreen].bounds.size.width - 100, 0, 100, kMarginBottom);
    [_finishButton addTarget:self action:@selector(finishButtonAction) forControlEvents:UIControlEventTouchUpInside];
    [_finishButton setTitleColor:UIColorFromRGB(0xc60a1e) forState:UIControlStateNormal];
    [_finishButton setTitleColor:[UIColor lightGrayColor] forState:UIControlStateDisabled];
    _finishButton.titleLabel.font = [UIFont systemFontOfSize:16];
    [bottomView addSubview:_finishButton];
    
    
    
    _previewButton = [UIButton buttonWithType:UIButtonTypeCustom];
    _previewButton.frame = CGRectMake(0, 0, 90, kMarginBottom);
    [_previewButton addTarget:self action:@selector(previewButtonAction) forControlEvents:UIControlEventTouchUpInside];
    [_previewButton setTitle:@"预览" forState:UIControlStateNormal];
    [_previewButton setTitleColor:UIColorFromRGB(0xc60a1e) forState:UIControlStateNormal];
    [_previewButton setTitleColor:[UIColor lightGrayColor] forState:UIControlStateDisabled];
    _previewButton.titleLabel.font =[UIFont systemFontOfSize:16];
    [bottomView addSubview:_previewButton];
}


#pragma mark-- 完成
- (void)finishButtonAction
{
    if ([self checkTotalProgress]) {
        [self fetchImageFinished];
    } else {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(updateLoadingProgress) name:KFetchPreviewImageSuccessNotification object:nil];
        [self showLoading:YES];
    }
}


- (void)fetchImageFinished
{
    [[NSNotificationCenter defaultCenter] removeObserver:self name:KFetchPreviewImageSuccessNotification object:nil];
    if (self.finishBlock) {
        // 完成
        self.finishBlock(_selectedAssetsArray);
    }
}

- (BOOL)checkTotalProgress
{
    BOOL ret = YES;
    if ([UIDevice currentDevice].systemVersion.floatValue >= 8.0 && _selectedAssetsArray.count > 0) {
        CGFloat totalProgress = 0;
        for (int i = 0; i < _selectedAssetsArray.count; i++) {
            WHEFetchImageAsset *fetchImageAsset = [_selectedAssetsArray objectAtIndex:i];
            totalProgress += fetchImageAsset.progress;
        }
        
        CGFloat currentProgress = totalProgress/_selectedAssetsArray.count;
        if (currentProgress < 0.01) {
            currentProgress = 0.01;
        }
        
        self.currentProgressStr = [NSString stringWithFormat:@"%zd%%",(NSInteger)(currentProgress * 100)];
        
        if ([self.currentProgressStr isEqualToString:@"100%"]) {
            ret = YES;
        } else {
            ret = NO;
        }
    }
    return ret;
}

- (void)updateLoadingProgress
{
    if (self.loadingView && !self.loadingView.hidden) {
        if ([self checkTotalProgress]) {
            [self fetchImageFinished];
        } else {
            [self showLoading:YES];
        }
    }
}

- (void)loadingViewCloseButtonAction
{
    [[NSNotificationCenter defaultCenter] removeObserver:self name:KFetchPreviewImageSuccessNotification object:nil];
    [self showLoading:NO];
}


- (void)showLoading:(BOOL)loadingFlag
{
    
    if (!_loadingView) {
        UIView *loadingBKView = [[UIView alloc] initWithFrame:self.view.bounds];
        loadingBKView.backgroundColor = [UIColor clearColor];
        loadingBKView.tag = TAG_PROGRESS_VIEW_BKView;
        [self.view addSubview:loadingBKView];
        
        
        UIView *progressView = [[UIView alloc] initWithFrame:CGRectMake((loadingBKView.width - kWidth_progressView)/2,
                                                                        (loadingBKView.height - kHeight_progressView)/2,
                                                                        kWidth_progressView,
                                                                        kHeight_progressView)];
        progressView.layer.borderWidth   = .5;
        progressView.layer.borderColor   = [UIColor clearColor].CGColor;
        progressView.layer.cornerRadius  = 5.0f;
        progressView.layer.masksToBounds = YES;
        progressView.alpha = 0.75;
        progressView.backgroundColor = [UIColor blackColor];
        [loadingBKView addSubview:progressView];
        
        
        
        UILabel *textLabel = [[UILabel alloc] initWithFrame:CGRectMake(kLeftMargin_textLabel,
                                                                       0,
                                                                       progressView.width - kLeftMargin_textLabel - kRightMargin_textLabel,
                                                                       progressView.height)];
        textLabel.backgroundColor = [UIColor clearColor];
        textLabel.tag  = TAG_PROGRESS_VIEW_LABEL;
        textLabel.font = [UIFont systemFontOfSize:15];
        textLabel.textColor = [UIColor whiteColor];
        [progressView addSubview:textLabel];
        
        
        UIButton *closeButton = [UIButton buttonWithType:UIButtonTypeCustom];
        [closeButton setImage:[WDHBundleUtil imageFromBundleWithName:@"WHEPicker_toast_close"] forState:UIControlStateNormal];
        closeButton.frame = CGRectMake(progressView.width - kRightMargin_closeButton - kBorder_closeButton,
                                       (progressView.height - kBorder_closeButton)/2,
                                       kBorder_closeButton,
                                       kBorder_closeButton);
        [closeButton addTarget:self action:@selector(loadingViewCloseButtonAction) forControlEvents:UIControlEventTouchUpInside];
        [progressView addSubview:closeButton];
        
        
        self.loadingView = loadingBKView;
    }
    
    
    if (loadingFlag) {
        UIView *bkView = [self.loadingView viewWithTag:TAG_PROGRESS_VIEW_BKView];
        UILabel *titleLabel = [bkView viewWithTag:TAG_PROGRESS_VIEW_LABEL];
        if (titleLabel) {
            titleLabel.text = [NSString stringWithFormat:@"iCloud照片同步中(%@)...",self.currentProgressStr];
        }
        self.loadingView.hidden = NO;
        
    } else {
        self.loadingView.hidden = YES;
    }
}


- (void)previewButtonAction
{
    if (_selectedAssetsArray.count > 0) {
        [self previewWithAsset:[_selectedAssetsArray firstObject] dataArray:_selectedAssetsArray];
    }
}

#pragma mark -- private
- (void)preparePhotos
{
    __weak typeof(self) weak_self = self;
    if (self.currentGroup) {
        [[WHEFetchImageManager sharedInstance] fetchImageAssetArrayHasVideo:NO group:self.currentGroup completion:^(NSArray<WHEFetchImageAsset *> *imageAssetArray) {
            [weak_self.assetsArray addObjectsFromArray:imageAssetArray];
            
            
        }];
    }
    
    dispatch_sync(dispatch_get_main_queue(), ^{
        
        [weak_self.tableView reloadData];
        // scroll to bottom
        NSInteger section = [weak_self numberOfSectionsInTableView:weak_self.tableView] - 1;
        NSInteger row = [weak_self tableView:weak_self.tableView numberOfRowsInSection:section] - 1;
        if (section >= 0 && row >= 0) {
            NSIndexPath *ip = [NSIndexPath indexPathForRow:row inSection:section];
            [weak_self.tableView scrollToRowAtIndexPath:ip atScrollPosition:UITableViewScrollPositionBottom animated:NO];
        }
        
        [weak_self updateChooseState];
    });
}

- (void)updateChooseState
{
    
    NSInteger currentCount = [_selectedAssetsArray count];
    if (currentCount > 0) {
        [_finishButton setTitle:[NSString stringWithFormat:@"%zd/%zd 完成",currentCount,_maxSelectedCount] forState:UIControlStateNormal];
    } else {
        [_finishButton setTitle:@"完成" forState:UIControlStateNormal];
    }
    
    if (currentCount > 0) {
        _finishButton.enabled = YES;
        _previewButton.enabled = YES;
    } else {
        _finishButton.enabled = NO;
        _previewButton.enabled = NO;
    }
}



#pragma mark- UITableViewDataSource,UITableViewDelegate
- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return ceil([self.assetsArray count] / (float)kELCAssetCellColoumns);
}


- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    
    return kELCAssetCellHeight;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *CellIdentifier = @"WHEAssetsListCell";
    
    WHEAssetsListCell *cell = (WHEAssetsListCell*)[tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    
    if (!cell) {
        cell = [[WHEAssetsListCell alloc] initWithAssets:[self assetsForIndexPath:indexPath] reuseIdentifier:CellIdentifier];
        cell.selectionStyle = UITableViewCellSelectionStyleNone;
        // 记录下cell的行数，再点击的时候根据行数计算出cell的index
        cell.tag = indexPath.row;
        
        __weak typeof(self) weak_self = self;
        cell.clickAssetBlock = ^(WHEFetchImageAsset *asset){
            
            switch (asset.clickType) {
                case WHEFetchImageAssetClickTypeSelect: {
                    // 选择
                    if (asset.isSelected) {
                        if (![weak_self.selectedAssetsArray containsObject:asset]) {
                            [weak_self.selectedAssetsArray addObject:asset];
                        }
                    } else if ([weak_self.selectedAssetsArray containsObject:asset]) {
                        if ([weak_self.selectedAssetsArray containsObject:asset]) {
                            [weak_self.selectedAssetsArray removeObject:asset];
                        }
                    }
                    
                    [weak_self updateChooseState];
                    
                    break;
                }
                case WHEFetchImageAssetClickTypePreview: {
                    // 预览
                    [weak_self previewWithAsset:asset dataArray:weak_self.assetsArray];
                    break;
                }
                    
                default:
                    break;
            }
        };
        cell.clickCheckBlock = ^ (WHEFetchImageAsset *asset) {
            return [weak_self checkMaxCount:asset];
        };
    } else {
        [cell setAssets:[self assetsForIndexPath:indexPath]];
    }
    
    
    return cell;
}

- (NSArray *)assetsForIndexPath:(NSIndexPath *)path
{
    NSInteger index = path.row * kELCAssetCellColoumns;
    NSInteger length = MIN(kELCAssetCellColoumns, [self.assetsArray count] - index);
    return [self.assetsArray subarrayWithRange:NSMakeRange(index, length)];
}


- (void)previewWithAsset:(WHEFetchImageAsset *)asset dataArray:(NSArray *)array
{
    __weak typeof(self) weak_self = self;
    WHEAssetsPreviewViewController *assetsPreviewViewController = [[WHEAssetsPreviewViewController alloc] init];
    assetsPreviewViewController.maxSelectedCount = self.maxSelectedCount;
    assetsPreviewViewController.currentShowAsset = asset;
    assetsPreviewViewController.assetsDataArray = array;
    assetsPreviewViewController.selectAssetsArray = self.selectedAssetsArray;
    assetsPreviewViewController.clickSelectBlock = ^ {
        [weak_self updateChooseState];
        [weak_self.tableView reloadData];
    };
    assetsPreviewViewController.clickFinishBlock = ^ {
        [weak_self finishButtonAction];
    };
    assetsPreviewViewController.clickCheckBlock = ^ (WHEFetchImageAsset *asset) {
        return [weak_self checkMaxCount:asset];
    };
    [self.navigationController pushViewController:assetsPreviewViewController animated:YES];
    
}

- (BOOL)checkMaxCount:(WHEFetchImageAsset *)asset
{
    BOOL ret = YES;
    NSInteger count = _selectedAssetsArray.count;
    if (asset.isSelected == NO) {
        count++;
    }
    if (count > self.maxSelectedCount) {
        NSString *tip = [NSString stringWithFormat:@"你最多只能选%zd张", self.maxSelectedCount];
        
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:tip
                                                        message:nil
                                                       delegate:nil
                                              cancelButtonTitle:@"我知道了"
                                              otherButtonTitles:nil, nil];
        [alert show];
        
        return NO;
    }
    
    return ret;
}

@end

