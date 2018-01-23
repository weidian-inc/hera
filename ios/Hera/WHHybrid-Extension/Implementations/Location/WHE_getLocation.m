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


#import "WHE_getLocation.h"
#import <CoreLocation/CoreLocation.h>
#import "WDHLog.h"

typedef  void(^WDHApiSuccessBlock)(NSDictionary<NSString *,id> *);
typedef  void(^WDHApiFailureBlock)(id);

@interface WHE_getLocation () <CLLocationManagerDelegate>

@property (nonatomic, strong) CLLocationManager *locationManager;

@property (nonatomic, copy) WDHApiSuccessBlock successBlock;

@property (nonatomic, copy) WDHApiFailureBlock failureBlock;

@property (nonatomic, strong) WHEBaseApi *strongSelf;

@end

@implementation WHE_getLocation

- (void)setupApiWithSuccess:(void (^)(NSDictionary<NSString *,id> * _Nonnull))success failure:(void (^)(id _Nullable))failure cancel:(void (^)(void))cancel {
	
	_locationManager = [[CLLocationManager alloc] init];
	_locationManager.delegate = self;
	_locationManager.desiredAccuracy = kCLLocationAccuracyBest;
	[_locationManager requestWhenInUseAuthorization];
	[_locationManager startUpdatingLocation];
	
	self.successBlock = success;
	self.failureBlock = failure;

	_strongSelf = self;
	
	__weak typeof (self) weak_self = self;
	dispatch_time_t time = dispatch_time(DISPATCH_TIME_NOW, NSEC_PER_SEC * 10);
	dispatch_after(time, dispatch_get_global_queue(0, 0), ^{
		weak_self.strongSelf = nil;
	});
}

- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray<CLLocation *> *)locations {
	
	CLLocation *location = [locations lastObject];
	CLLocationCoordinate2D coordinate = location.coordinate;
	
	if(self.successBlock) {
		self.successBlock(@{@"altitude": @(location.altitude), @"latitude": @(coordinate.latitude), @"longitude": @(coordinate.longitude), @"speed": @(location.speed), @"accuracy": @(manager.desiredAccuracy), @"verticalAccuracy": @(location.verticalAccuracy), @"horizontalAccuracy": @(location.horizontalAccuracy)});
	}
	
	[_locationManager stopUpdatingLocation];
}

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
	if(self.failureBlock) {
		self.failureBlock(nil);
	}
}

@end
