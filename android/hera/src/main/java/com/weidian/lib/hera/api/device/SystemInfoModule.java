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
import android.content.res.TypedArray;
import android.os.Build;
import android.util.DisplayMetrics;

import com.weidian.lib.hera.api.BaseApi;
import com.weidian.lib.hera.interfaces.ICallback;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.DensityUtil;

import org.json.JSONException;
import org.json.JSONObject;


/**
 * 获取系统信息api
 */
public class SystemInfoModule extends BaseApi {
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

        int statusBarHeight = 0;
        Resources resources = getContext().getResources();
        int resId = resources.getIdentifier("status_bar_height", "dimen", "android");
        if (resId > 0) {
            statusBarHeight = resources.getDimensionPixelSize(resId);
        }
        DisplayMetrics dm = getContext().getResources().getDisplayMetrics();
        this.model = Build.MODEL;
        this.pixelRatio = dm.density;
        this.screenWidth = dm.widthPixels;
        this.screenHeight = dm.heightPixels;
        this.windowWidth = dm.widthPixels;
        this.windowHeight = dm.heightPixels - statusBarHeight - getActionBarSize(getContext());
        this.language = "zh-CN";
        this.version = "1.0";
        this.system = Build.VERSION.RELEASE;
        this.platform = "android";
        this.SDKVersion = "0.1";
    }

    @Override
    public String[] apis() {
        return new String[]{"getSystemInfo"};
    }

    @Override
    public void invoke(String event, JSONObject param, ICallback callback) {
        try {
            JSONObject result = new JSONObject();
            result.put("model", model);
            result.put("pixelRatio", pixelRatio);
            result.put("screenWidth", screenWidth);
            result.put("screenHeight", screenHeight);
            result.put("windowWidth", windowWidth);
            result.put("windowHeight", windowHeight);
            result.put("language", language);
            result.put("version", version);
            result.put("system", system);
            result.put("platform", platform);
            result.put("SDKVersion", SDKVersion);
            callback.onSuccess(result);
        } catch (JSONException e) {
            HeraTrace.e(TAG, "systemInfo assemble result exception!");
            callback.onFail();
        }
    }

    private int getActionBarSize(Context context) {
        int[] attrs = {android.R.attr.actionBarSize};
        TypedArray values = context.getTheme().obtainStyledAttributes(attrs);
        try {
            return values.getDimensionPixelSize(0, DensityUtil.dip2px(context, 56));
        } finally {
            values.recycle();
        }
    }

}
