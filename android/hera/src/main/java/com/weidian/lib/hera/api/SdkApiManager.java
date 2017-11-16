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


package com.weidian.lib.hera.api;

import android.app.Activity;
import android.content.Intent;
import android.text.TextUtils;

import com.weidian.lib.hera.api.debug.DebugModule;
import com.weidian.lib.hera.api.device.ClipboardModule;
import com.weidian.lib.hera.api.device.NetInfoModule;
import com.weidian.lib.hera.api.device.PhoneCallModule;
import com.weidian.lib.hera.api.device.ScanCodeModule;
import com.weidian.lib.hera.api.device.SystemInfoModule;
import com.weidian.lib.hera.api.file.FileModule;
import com.weidian.lib.hera.api.media.ImageInfoModule;
import com.weidian.lib.hera.api.media.ImageModule;
import com.weidian.lib.hera.api.network.DownloadModule;
import com.weidian.lib.hera.api.network.RequestModule;
import com.weidian.lib.hera.api.network.UploadModule;
import com.weidian.lib.hera.api.storage.StorageModule;
import com.weidian.lib.hera.api.ui.DialogModule;
import com.weidian.lib.hera.api.ui.PageModule;
import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.interfaces.IApiCallback;
import com.weidian.lib.hera.interfaces.OnActivityResultListener;
import com.weidian.lib.hera.interfaces.OnEventListener;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * 内部Api管理类
 */
public class SdkApiManager {

    private Map<String, AbsModule> mSdkApis = new HashMap<>();

    public SdkApiManager(Activity activity, OnEventListener listener, AppConfig appConfig) {
        //注册api
        //调试
        add(new DebugModule(activity));

        //设备
        add(new ClipboardModule(activity));
        add(new PhoneCallModule(activity));
        add(new NetInfoModule(activity));
        add(new SystemInfoModule(activity));
        add(new ScanCodeModule(activity));

        //媒体
        add(new ImageModule(activity, appConfig));
        add(new ImageInfoModule(activity));

        //网络
        add(new RequestModule(activity));
        add(new DownloadModule(activity, appConfig));
        add(new UploadModule(activity, appConfig));

        //数据缓存
        add(new StorageModule(activity, appConfig));

        //界面
        add(new DialogModule(activity));
        add(new PageModule(activity, listener));

        //文件
        add(new FileModule(activity, appConfig));
    }

    /**
     * 处理api调用
     *
     * @param event    事件名称，即api名称
     * @param params   调用参数
     * @param callback 回调接口
     * @return true：调用被处理了；false：调用未被处理（未找到对应的事件处理器）
     */
    public boolean invoke(String event, String params, IApiCallback callback) {
        AbsModule module = mSdkApis.get(event);
        if (module != null) {
            module.invoke(event, params, callback);
            return true;
        }

        return false;
    }

    /**
     * Activity结果回调
     *
     * @param requestCode 请求码
     * @param resultCode  结果码
     * @param data        结果数据
     * @return true：被处理了，false：未被处理
     */
    public boolean onActivityResult(int requestCode, int resultCode, Intent data) {
        Collection<AbsModule> modules = mSdkApis.values();
        for (AbsModule module : modules) {
            if (module == null || !(module instanceof OnActivityResultListener)) {
                continue;
            }
            OnActivityResultListener listener = (OnActivityResultListener) module;
            if (listener.isResultReceiver(requestCode)) {
                listener.onActivityResult(requestCode, resultCode, data);
                return true;
            }
        }
        return false;
    }

    /**
     * 清理操作，退出时应调用，防止内存泄露
     */
    public void destroy() {
        for (Map.Entry<String, AbsModule> entry : mSdkApis.entrySet()) {
            entry.getValue().onDestroy();
        }
        mSdkApis.clear();
    }

    private void add(AbsModule module) {
        if (module == null) {
            return;
        }

        HeraApi annotation = module.getClass().getAnnotation(HeraApi.class);
        if (annotation == null) {
            return;
        }

        String[] names = annotation.names();
        if (names.length == 0) {
            return;
        }

        module.onCreate();

        for (String name : names) {
            if (TextUtils.isEmpty(name)) {
                continue;
            }
            mSdkApis.put(name, module);
        }
    }

}

