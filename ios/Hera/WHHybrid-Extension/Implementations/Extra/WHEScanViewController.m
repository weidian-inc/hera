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


#import "WHEScanViewController.h"
#import "WHEScanView.h"
#import <AVFoundation/AVFoundation.h>
#import "WHEMaskView.h"

#define kActivityViewTag 1001

@interface WHEScanViewController () <AVCaptureMetadataOutputObjectsDelegate,        AVCaptureMetadataOutputObjectsDelegate,
    UIImagePickerControllerDelegate,
    UINavigationControllerDelegate>

@property (nonatomic, strong) WHEScanView *scanView;

@property (nonatomic, strong) AVCaptureVideoPreviewLayer *videoPreviewLayer;

@property (nonatomic, strong) AVCaptureSession *captureSession;

@end

@implementation WHEScanViewController

- (instancetype)init {

    if (self = [super init]) {
        _isOnlyFromCamera = NO;
    }
    
    return self;
}


#pragma mark - Life Cycle

- (void)viewDidLoad {
    [super viewDidLoad];
    
    [self setupNavigation];
    
    [self setupSession];
    
    [self setupViews];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    
    [self.navigationController setNavigationBarHidden:NO animated:YES];
    
    // 开启video和动画
    [self.captureSession startRunning];
    [self.scanView startAnimation];
    
    // 调整导航栏和状态栏颜色
    self.navigationController.navigationBar.tintColor = UIColor.whiteColor;
    self.navigationController.navigationBar.barStyle = UIBarStyleBlackTranslucent;
    [UIApplication.sharedApplication setStatusBarStyle:UIStatusBarStyleLightContent];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];

    // 关闭video和动画
    [self.captureSession stopRunning];
    [self.scanView stopAnimation];
    
    // 还原导航栏和状态栏颜色
//    self.navigationController.navigationBar.barStyle = self.oldBarStyle;
//    self.navigationController.navigationBar.tintColor = self.oldNaviTintColor;
//    [UIApplication.sharedApplication setStatusBarStyle:self.oldStatusStyle];
}

#pragma mark - Setup

- (void)setupNavigation {
    
//    self.oldNaviTintColor = self.navigationController.navigationBar.tintColor;
//    self.oldBarStyle = self.navigationController.navigationBar.barStyle;
//    self.oldStatusStyle = [UIApplication.sharedApplication statusBarStyle];
    
    self.title = @"二维码/条码";
    
    if (!self.isOnlyFromCamera) {
        UIBarButtonItem *rightBarItem = [[UIBarButtonItem alloc] initWithTitle:@"相册" style:UIBarButtonItemStylePlain target:self action:@selector(tappedOnRightBarItem)];
        self.navigationItem.rightBarButtonItem = rightBarItem;
    }
}

- (void)setupSession {
    // 获取设备
    AVCaptureDevice *device = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
    
    // 创建输入流
    AVCaptureDeviceInput *input = [AVCaptureDeviceInput deviceInputWithDevice:device error:nil];
    if (!input) {
        _captureSession = nil;
        return;
    }

    // 创建输出流
    AVCaptureMetadataOutput *output = [[AVCaptureMetadataOutput alloc] init];
    [output setMetadataObjectsDelegate:self queue: dispatch_get_main_queue()];
    
    // 设置扫描区域 按照比例0~1 且x, y互换，width,height互换
    CGFloat width = 250.0 / UIScreen.mainScreen.bounds.size.height;
    CGFloat height = 250.0 / UIScreen.mainScreen.bounds.size.width;
    output.rectOfInterest = CGRectMake((1 - width) / 2.0, (1 - height) / 2.0, width, height);
    
    _captureSession = [[AVCaptureSession alloc] init];
    [_captureSession canSetSessionPreset:AVCaptureSessionPresetHigh];
    [_captureSession addInput:input];
    [_captureSession addOutput:output];
    
    // 设置编码 二维码和条形码
    // 此处有坑 设置metadataObjectTypes 必须放在addOuput之后
    output.metadataObjectTypes = @[AVMetadataObjectTypeQRCode,
                                   AVMetadataObjectTypeEAN13Code,
                                   AVMetadataObjectTypeEAN8Code,
                                   AVMetadataObjectTypeCode128Code];
}

- (void)setupViews {
    
    CGFloat width = UIScreen.mainScreen.bounds.size.width;
    CGFloat height = UIScreen.mainScreen.bounds.size.height;
    
    // 添加扫描视图
    _scanView = [[WHEScanView alloc] initWithFrame:CGRectMake((width - 250) / 2, (height - 250) / 2, 250, 250)];
    _scanView.backgroundColor = UIColor.clearColor;
    [self.view addSubview:_scanView];
    
    // 添加video层
    _videoPreviewLayer = [AVCaptureVideoPreviewLayer layer];
    if (_captureSession) {
        _videoPreviewLayer.session = self.captureSession;
    }
    
    _videoPreviewLayer.videoGravity = AVLayerVideoGravityResizeAspectFill;
    _videoPreviewLayer.frame = CGRectMake(0, 0, width, height);
    [self.view.layer insertSublayer:_videoPreviewLayer atIndex:0];
    
    // 添加背景层 中空的框
    CAShapeLayer *shapeLayer = [CAShapeLayer layer];
    shapeLayer.frame = CGRectMake(0, 0, width, height);
    shapeLayer.lineWidth = 1.0 / UIScreen.mainScreen.scale;
    shapeLayer.fillColor = [UIColor.blackColor colorWithAlphaComponent:0.5].CGColor;
    shapeLayer.fillRule = kCAFillRuleEvenOdd;
    
    UIBezierPath *outerPath = [UIBezierPath bezierPathWithRect:shapeLayer.bounds];
    UIBezierPath *innerPath = [UIBezierPath bezierPathWithRect:CGRectInset(shapeLayer.bounds, (width - 250) / 2.0, (height - 250) / 2.0)];
    
    UIBezierPath *shapeLayerPath = [UIBezierPath bezierPath];
    [shapeLayerPath appendPath:outerPath];
    [shapeLayerPath appendPath:innerPath];
    
    shapeLayer.path = shapeLayerPath.CGPath;
    [self.view.layer addSublayer:shapeLayer];
}

#pragma mark - Private Helper

- (void) showActivityIndicator {
    
    UIActivityIndicatorView *activityView = [self.view viewWithTag:kActivityViewTag];
    
    if (!activityView) {
        activityView = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhite];
        activityView.tag = kActivityViewTag;
        activityView.frame = CGRectMake(0, 0, 20, 20);
        activityView.center = self.view.center;
        [self.view addSubview:activityView];
    }
    
    [activityView startAnimating];
}

- (void) hideActivityIndicator {
    UIActivityIndicatorView *activityView = [self.view viewWithTag:kActivityViewTag];
    if (activityView) {
        [activityView startAnimating];
        [activityView removeFromSuperview];
    }
}


#pragma mark - User Interaction

- (void)tappedOnRightBarItem {
    if(![UIImagePickerController isSourceTypeAvailable:UIImagePickerControllerSourceTypePhotoLibrary]) {
        NSLog(@"获取图片库失败");
        return;
    }
    
    UIImagePickerController *imagePicker = [[UIImagePickerController alloc] init];
    imagePicker.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
    imagePicker.delegate = self;
    
    imagePicker.navigationBar.barStyle = UIBarStyleBlackTranslucent;
    imagePicker.navigationBar.tintColor = UIColor.whiteColor;
    
    [self presentViewController:imagePicker animated:YES completion:nil];
}

#pragma mark - UIImagePickerControllerDelegate

- (void)imagePickerController:(UIImagePickerController *)picker didFinishPickingMediaWithInfo:(NSDictionary<NSString *,id> *)info {
    [self showActivityIndicator];
    __weak typeof(self) weakSelf = self;
    [picker dismissViewControllerAnimated:YES completion:^{
        UIImage *image = info[UIImagePickerControllerOriginalImage];
        
        if (image && [image isKindOfClass:UIImage.class]) {
            
            // 识别图片中的二维码 从相册中识别暂不支持条码
            CIDetector *detector = [CIDetector detectorOfType:CIDetectorTypeQRCode context:nil options:@{CIDetectorAccuracy: CIDetectorAccuracyHigh}];
            CIImage *ciImage = [CIImage imageWithCGImage:image.CGImage];
            NSArray *fetures = [detector featuresInImage:ciImage];
            CIQRCodeFeature *feture = fetures.firstObject;
            
            [weakSelf hideActivityIndicator];
            if (feture && [feture isKindOfClass:CIQRCodeFeature.class]) {
                if (weakSelf.completionBlock) {
                    AudioServicesPlaySystemSound(1118);
                    weakSelf.completionBlock(feture.messageString, @"org.iso.QRCode");
                }
            } else {
                [WHEMaskView showMaskInView:weakSelf.view withTitle:@"未发现二维码" message:@"轻触继请续"];
            }
        } else {
            [WHEMaskView showMaskInView:weakSelf.view withTitle:@"处理图像失败" message:@"轻触请继续"];
        }
    }];
}

#pragma mark - AVCaptureMetadataOutputObjectsDelegate

- (void)captureOutput:(AVCaptureOutput *)captureOutput didOutputMetadataObjects:(NSArray *)metadataObjects fromConnection:(AVCaptureConnection *)connection {
    AVMetadataMachineReadableCodeObject *metadataObj = metadataObjects.firstObject;
    if (!metadataObjects) {
        return;
    }
    
    // 停止video和动画
    [self.captureSession stopRunning];
    [self.scanView stopAnimation];
    
    //播放声效和震动
    AudioServicesPlaySystemSound(1118);
    AudioServicesPlaySystemSound(kSystemSoundID_Vibrate);
    
    if (self.completionBlock) {
        self.completionBlock(metadataObj.stringValue, metadataObj.type);
    }
}

@end

