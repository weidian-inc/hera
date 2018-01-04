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


package com.weidian.lib.hera.web;

import android.annotation.TargetApi;
import android.content.Context;
import android.os.Build;
import android.text.TextUtils;
import com.tencent.smtt.export.external.interfaces.WebResourceRequest;
import com.tencent.smtt.export.external.interfaces.WebResourceResponse;
import com.tencent.smtt.sdk.WebView;
import com.tencent.smtt.sdk.WebViewClient;

import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.StorageUtil;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;

public class HeraWebViewClient extends WebViewClient {

    private AppConfig mAppConfig;

    public HeraWebViewClient(AppConfig appConfig) {
        mAppConfig = appConfig;
    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        String url = request.getUrl().toString();
        HeraTrace.d("InterceptRequest", String.format("url=%s", url));
        WebResourceResponse resource = interceptResource(view.getContext(), url);
        return resource != null ? resource : super.shouldInterceptRequest(view, request);
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
        HeraTrace.d("InterceptRequest", String.format("url=%s", url));
        WebResourceResponse resource = interceptResource(view.getContext(), url);
        return resource != null ? resource : super.shouldInterceptRequest(view, url);
    }

    private WebResourceResponse interceptResource(Context context, String url) {
        if (TextUtils.isEmpty(url) || !url.startsWith(StorageUtil.SCHEME_WDFILE)) {
            return null;
        }

        String resName = url.substring(StorageUtil.SCHEME_WDFILE.length());
        if (TextUtils.isEmpty(resName)) {
            return null;
        }

        String resDir = null;
        if (resName.startsWith(StorageUtil.PREFIX_TMP)) {
            resDir = mAppConfig.getMiniAppTempPath(context);
        } else if (resName.startsWith(StorageUtil.PREFIX_STORE)) {
            resDir = mAppConfig.getMiniAppStorePath(context);
        }

        if (TextUtils.isEmpty(resDir)) {
            return null;
        }

        return getResource(resDir, resName);
    }

    private WebResourceResponse getResource(String resDir, String resName) {
        File file = new File(resDir, resName);
        if (!file.exists() && !file.isFile()) {
            return null;
        }
        try {
            return new WebResourceResponse("image/*", "UTF-8", new FileInputStream(file));
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        return null;
    }
}
