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


package com.weidian.lib.hera.api.storage;

import android.content.Context;
import android.content.SharedPreferences;
import android.text.TextUtils;
import android.util.Log;

import com.weidian.lib.hera.api.BaseApi;
import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.interfaces.ICallback;
import com.weidian.lib.hera.trace.HeraTrace;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.Set;

public class StorageModule extends BaseApi {

    private static final long BYTE_LIMIT = 10 * 1024 * 1024;
    private String mAppId;
    private String mUserId;
    private String mPreferenceName;
    private long mCurSize;
    private File mSpFile;

    public StorageModule(Context context, AppConfig appConfig) {
        super(context);
        mAppId = appConfig.getAppId();
        mUserId = appConfig.getUserId();
    }

    @Override
    public void onCreate() {
        super.onCreate();

        if ((!TextUtils.isEmpty(mAppId)) && (!TextUtils.isEmpty(mUserId))) {
            this.mPreferenceName = String.format("%s%s", mAppId, mUserId);
        }

        mCurSize = loadPreferenceSize(mPreferenceName);
    }

    @Override
    public String[] apis() {
        return new String[]{"setStorage", "setStorageSync", "getStorage", "getStorageSync",
                "getStorageInfo", "getStorageInfoSync", "removeStorage", "removeStorageSync",
                "clearStorage", "clearStorageSync"};
    }

    @Override
    public void invoke(String event, JSONObject param, ICallback callback) {
        switch (event) {
            case "setStorage":
            case "setStorageSync":
                setStorage(param, callback);
                break;
            case "getStorage":
            case "getStorageSync":
                getStorage(param, callback);
                break;
            case "getStorageInfo":
            case "getStorageInfoSync":
                getStorageInfo(callback);
                break;
            case "removeStorage":
            case "removeStorageSync":
                removeStorage(param, callback);
                break;
            case "clearStorage":
            case "clearStorageSync":
                clearStorage(callback);
                break;
        }
    }

    /**
     * 将数据存储在本地缓存中指定的key中，会覆盖掉原来该 key 对应的内容
     *
     * @param param
     * @param callback
     */
    private void setStorage(JSONObject param, ICallback callback) {
        String key = param.optString("key");
        Object data = param.opt("data");
        if (getContext() == null || TextUtils.isEmpty(mPreferenceName)
                || mCurSize >= BYTE_LIMIT || TextUtils.isEmpty(key) || data == null) {
            callback.onFail();
            return;
        }

        SharedPreferences preference = getContext().getSharedPreferences(mPreferenceName,
                Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = preference.edit();
        editor.putString(key, String.valueOf(data));
        editor.apply();

        callback.onSuccess(null);

        mCurSize = loadPreferenceSize(mPreferenceName);
    }

    /**
     * 从本地缓存中获取指定 key 对应的内容。
     *
     * @param param
     * @param callback
     */
    private void getStorage(JSONObject param, ICallback callback) {
        String key = param.optString("key");
        if (getContext() == null || TextUtils.isEmpty(mPreferenceName) || TextUtils.isEmpty(key)) {
            callback.onFail();
            return;
        }
        try {
            SharedPreferences settings = getContext()
                    .getSharedPreferences(mPreferenceName, Context.MODE_PRIVATE);
            String data = settings.getString(key, "");
            JSONObject result = new JSONObject();
            result.put("data", data);
            result.put("dataType", "String");
            callback.onSuccess(result);
        } catch (JSONException e) {
            HeraTrace.e(TAG, "getStorage assemble result exception!");
            callback.onFail();
        }
    }

    /**
     * 获取当前storage的相关信息
     *
     * @param callback
     */
    private void getStorageInfo(ICallback callback) {
        if (getContext() == null || TextUtils.isEmpty(mPreferenceName)) {
            callback.onFail();
            return;
        }

        try {
            SharedPreferences settings = getContext()
                    .getSharedPreferences(mPreferenceName, Context.MODE_PRIVATE);
            Set<String> keys = settings.getAll().keySet();
            JSONObject result = new JSONObject();
            result.put("keys", String.valueOf(keys));
            result.put("currentSize", mCurSize / 1024);
            result.put("limitSize", BYTE_LIMIT / 1024);
            callback.onSuccess(result);
        } catch (JSONException e) {
            HeraTrace.e(TAG, "getStorageInfo assemble result exception!");
            callback.onFail();
        }
    }

    /**
     * 从本地缓存中异步移除指定 key 。
     *
     * @param param
     * @param callback
     */
    private void removeStorage(JSONObject param, ICallback callback) {
        String key = param.optString("key");
        if (getContext() == null || TextUtils.isEmpty(mPreferenceName) || TextUtils.isEmpty(key)) {
            callback.onFail();
            return;
        }

        try {
            SharedPreferences preference = getContext().getSharedPreferences(mPreferenceName,
                    Context.MODE_PRIVATE);
            String data = preference.getString(key, "");
            SharedPreferences.Editor editor = preference.edit();
            editor.remove(key);
            editor.apply();

            JSONObject result = new JSONObject();
            result.put("data", data);
            callback.onSuccess(result);
        } catch (JSONException e) {
            HeraTrace.e(TAG, "removeStorage assemble result exception!");
            callback.onFail();
        }

        mCurSize = loadPreferenceSize(mPreferenceName);
    }

    /**
     * 清理本地数据缓存。
     *
     * @param callback
     */
    private void clearStorage(ICallback callback) {
        if (mSpFile != null) {
            mSpFile.delete();
        }

        callback.onSuccess(null);
        mCurSize = 0;
    }


    private long loadPreferenceSize(String fileName) {
        long res = 0;

        if (TextUtils.isEmpty(fileName) || getContext() == null) {
            Log.w(TAG, "filename is empty");
            return res;
        }

        if (mSpFile == null) {
            String spPath = "shared_prefs/" + fileName + ".xml";
            mSpFile = new File(getContext().getCacheDir().getParent(), spPath);
            HeraTrace.d(TAG, "sp file:" + mSpFile.getAbsolutePath());
        }


        if (mSpFile.exists()) {
            res = mSpFile.length();
        }

        return res;
    }

}
