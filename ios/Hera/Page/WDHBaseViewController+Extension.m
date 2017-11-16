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


#import "WDHBaseViewController+Extension.h"
#import "WDHPageModel.h"

@implementation WDHBaseViewController(Extension)

- (void) track_open_page{
    if (self.pageModel) {
		NSLog(@"open_page--->desc: %@", @{@"page":self.pageModel.pagePath,@"openType":self.pageModel.openType});
    }
}

- (void)track_open_page_success{
    if (self.pageModel) {
		NSLog(@"open_page_success--->desc: %@", @{@"page":self.pageModel.pagePath,@"openType":self.pageModel.openType});
    }
}

- (void)track_open_page_failure:(NSString *)error {
    if (self.pageModel) {
		NSLog(@"open_page_failure--->desc: %@", @{@"page":self.pageModel.pagePath,@"openType":self.pageModel.openType});
    }
}

- (void)track_close_page:(NSString *)pages {
	NSLog(@"close_page----> pgae: %@", pages);
}

- (void)track_page_ready{
    if (self.pageModel) {
		NSLog(@"page_ready----> :%@", @{@"page":self.pageModel.pagePath,@"openType":self.pageModel.openType});
    }
}

- (void)track_renderContainer{
    if (self.pageModel) {
		NSLog(@"renderContainer--->desc: %@", @{@"page":self.pageModel.pagePath,@"openType":self.pageModel.openType});
    }
}

- (void)track_renderContainer_success{
    if (self.pageModel) {
		NSLog(@"renderContainer_success--->desc: %@", @{@"page":self.pageModel.pagePath,@"openType":self.pageModel.openType});
    }
}

- (void)track_renderContainer_failure:(NSString *)error {
    if (self.pageModel) {
		NSLog(@"renderContainer_failure--->desc: %@", @{@"page":self.pageModel.pagePath,@"error":error});
    }
}

@end

