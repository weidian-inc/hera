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

#import "RetrieveViewController.h"
#import <Hera/WDHodoer.h>

@interface RetrieveViewController () 

@property (nonatomic, copy) WDHApiCompletion apiCompletion;

@end

@implementation RetrieveViewController

- (void)viewDidLoad {
	[super viewDidLoad];
	
	self.view.backgroundColor = UIColor.whiteColor;
	UIButton *button = [UIButton buttonWithType:UIButtonTypeSystem];
	button.frame = CGRectMake(0, 0, 100, 30);
	[button setTitle:@"haha" forState:UIControlStateNormal];
	[button addTarget:self action:@selector(foo) forControlEvents:UIControlEventTouchUpInside];
	button.center = self.view.center;
	[self.view addSubview:button];
}

- (void)foo {
	self.apiCompletion(@{@"result": @"heheh"});
	[self.navigationController popViewControllerAnimated:YES];
}

- (void)didReceiveApi:(NSString *)api withParam:(id)params completion:(WDHApiCompletion)completion {
	
	NSLog(@"api: %@", api);
	NSLog(@"param: %@", params);
	
	self.apiCompletion = completion;
}

@end
