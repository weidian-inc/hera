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


package com.weidian.lib.hera.api.device;

import android.content.Context;
import android.content.res.Resources;
import android.os.Build;
import android.util.DisplayMetrics;

import com.weidian.lib.hera.api.AbsModule;
import com.weidian.lib.hera.api.HeraApi;
import com.weidian.lib.hera.interfaces.IApiCallback;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.DensityUtil;

import org.json.JSONException;
import org.json.JSONObject;


/**
 * 获取系统信息api
 */
@HeraApi(names = {"getSystemInfo"})
public class SystemInfoModule extends AbsModule {
    private String model;
    private float pixelRatio;
    private int screenWidth;
    private int screenHeight;
    private int windowWidth;
    private int windowHeight;
    private String language;
    private String version;
    private String system;
    private String platform;
    private String SDKVersion;

    public SystemInfoModule(Context context) {
        super(context);
    }

    @Override
    public void onCreate() {
        super.onCreate();

        int statusBarHight = 0;
        Resources resources = getContext().getResources();
        int resId = resources.getIdentifier("status_bar_height", "dimen", "android");
        if (resId > 0) {
            statusBarHight = resources.getDimensionPixelSize(resId);
        }
        DisplayMetrics dm = getContext().getResources().getDisplayMetrics();
        this.model = Build.MODEL;
        this.pixelRatio = dm.density;
        this.screenWidth = dm.widthPixels;
        this.screenHeight = dm.heightPixels;
        this.windowWidth = dm.widthPixels;
        this.windowHeight = dm.heightPixels - statusBarHight - DensityUtil.dip2px(getContext(), 50);
        this.language = "zh-CN";
        this.version = "1.0";
        this.system = Build.VERSION.RELEASE;
        this.platform = "android";
        this.SDKVersion = "1.0";
    }

    @Override
    public void invoke(String event, String params, IApiCallback callback) {
        if (event.equals("getSystemInfo")) {
            getSystemInfo(event, params, callback);
        }
    }

    private void getSystemInfo(String event, String params, IApiCallback callback) {
        JSONObject json = new JSONObject();
        try {
            json.put("model", model);
            json.put("pixelRatio", pixelRatio);
            json.put("screenWidth", screenWidth);
            json.put("screenHeight", screenHeight);
            json.put("windowWidth", windowWidth);
            json.put("windowHeight", windowHeight);
            json.put("language", language);
            json.put("version", version);
            json.put("system", system);
            json.put("platform", platform);
            json.put("SDKVersion", SDKVersion);
            json.put("inHera", true);
        } catch (JSONException e) {
            HeraTrace.e(TAG, "systemInfo to json exception!");
        }

        callback.onResult(packageResultData(event, RESULT_OK, json));

    }

}
