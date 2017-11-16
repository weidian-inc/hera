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


#import "WHEBaseApi.h"

@interface WHE_addPhoneContact : WHEBaseApi

/**
 头像本地文件路径
 */
@property (nonatomic, copy) NSString *photoFilePath;

/**
 昵称
 */
@property (nonatomic, copy) NSString *nickName;

/**
 姓氏
 */
@property (nonatomic, copy) NSString *lastName;

/**
 中间名
 */
@property (nonatomic, copy) NSString *middleName;

/**
 名字
 */
@property (nonatomic, copy) NSString *firstName;

/**
 备注
 */
@property (nonatomic, copy) NSString *remark;

/**
 手机号
 */
@property (nonatomic, copy) NSString *mobilePhoneNumber;

/**
 微信号
 */
@property (nonatomic, copy) NSString *weChatNumber;

/**
 联系地址国家
 */
@property (nonatomic, copy) NSString *addressCountry;

/**
 联系地址省份
 */
@property (nonatomic, copy) NSString *addressState;

/**
 联系地址城市
 */
@property (nonatomic, copy) NSString *addressCity;

/// 联系地址街道
@property (nonatomic, copy) NSString *addressStreet;

/**
 联系地址邮政编码
 */
@property (nonatomic, copy) NSString *addressPostalCode;

/**
 公司
 */
@property (nonatomic, copy) NSString *organization;

/**
 职位
 */
@property (nonatomic, copy) NSString *title;

/**
 工作传真
 */
@property (nonatomic, copy) NSString *workFaxNumber;

/// 工作电话
/**
 
 */
@property (nonatomic, copy) NSString *workPhoneNumber;

/**
 电子邮件
 */
@property (nonatomic, copy) NSString *email;

/**
 网站
 */
@property (nonatomic, copy) NSString *url;

/**
 工作地址国家
 */
@property (nonatomic, copy) NSString *workAddressCountry;

/**
 工作地址省份
 */
@property (nonatomic, copy) NSString *workAddressState;

/// 工作地址城市
/**
 
 */
@property (nonatomic, copy) NSString *workAddressCity;

/**
 工作地址街道
 */
@property (nonatomic, copy) NSString *workAddressStreet;

/**
 工作地址邮政编码
 */
@property (nonatomic, copy) NSString *workAddressPostalCode;

/**
 住宅传真
 */
@property (nonatomic, copy) NSString *homeFaxNumber;

/**
 住宅电话
 */
@property (nonatomic, copy) NSString *homePhoneNumber;

/**
 住宅地址国家
 */
@property (nonatomic, copy) NSString *homeAddressCountry;

/**
 住宅地址省份
 */
@property (nonatomic, copy) NSString *homeAddressState;

/**
 住宅地址城市
 */
@property (nonatomic, copy) NSString *homeAddressCity;

/**
 住宅地址街道
 */
@property (nonatomic, copy) NSString *homeAddressStreet;

/**
住宅地址邮政编码
 */
@property (nonatomic, copy) NSString *homeAddressPostalCode;

@end

