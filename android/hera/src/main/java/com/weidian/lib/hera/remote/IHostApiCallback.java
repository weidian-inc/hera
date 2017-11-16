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


package com.weidian.lib.hera.remote;

import org.json.JSONObject;

/**
 * 宿主进程api处理结果的回调接口
 */
public interface IHostApiCallback {

    /**
     * 成功状态码
     */
    int SUCCEED = 0;

    /**
     * 失败状态码
     */
    int FAILED = 1;

    /**
     * 未定义状态码
     */
    int UNDEFINE = 2;

    /**
     * 中间状态，表示返回的结果需要SDK进一步处理，如openPageForResult调用
     */
    int PENDING = 3;

    /**
     * 结果的回调方法
     *
     * @param status 状态码，有效值：{@link #SUCCEED}，{@link #FAILED}，{@link #UNDEFINE}，{@link #PENDING}，其他值按{@link #UNDEFINE}处理
     * @param result json结果
     */
    void onResult(int status, JSONObject result);
}
