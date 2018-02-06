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


package com.weidian.lib.hera.api.ui;

import android.content.Context;

import com.weidian.lib.hera.api.BaseApi;
import com.weidian.lib.hera.interfaces.ICallback;
import com.weidian.lib.hera.interfaces.OnEventListener;

import org.json.JSONObject;

/**
 * 页面跳转，导航栏设置，Toast或Loading对话框
 */
public class PageModule extends BaseApi {

    private OnEventListener mListener;

    public PageModule(Context context, OnEventListener listener) {
        super(context);
        mListener = listener;
    }

    @Override
    public String[] apis() {
        return new String[]{"showToast", "hideToast", "showLoading", "hideLoading",
                "switchTab", "navigateTo", "redirectTo", "reLaunch", "navigateBack",
                "setNavigationBarTitle", "setNavigationBarColor", "showNavigationBarLoading",
                "hideNavigationBarLoading", "startPullDownRefresh", "stopPullDownRefresh"};
    }

    @Override
    public void invoke(String event, JSONObject param, ICallback callback) {
        boolean res = false;
        if (mListener != null) {
            res = mListener.onPageEvent(event, param.toString());
        }

        if (res) {
            callback.onSuccess(null);
        } else {
            callback.onFail();
        }
    }
}
