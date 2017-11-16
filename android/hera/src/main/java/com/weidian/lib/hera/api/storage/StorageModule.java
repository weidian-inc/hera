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

import com.weidian.lib.hera.api.AbsModule;
import com.weidian.lib.hera.api.HeraApi;
import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.interfaces.IApiCallback;
import com.weidian.lib.hera.trace.HeraTrace;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.Set;

@HeraApi(names = {"setStorage", "setStorageSync", "getStorage", "getStorageSync",
        "getStorageInfo", "getStorageInfoSync", "removeStorage", "removeStorageSync",
        "clearStorage", "clearStorageSync"})
public class StorageModule extends AbsModule {

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
    public void invoke(String event, String params, IApiCallback callback) {
        if ("setStorage".equals(event) || "setStorageSync".equals(event)) {
            setStorage(event, params, callback);
        } else if ("getStorage".equals(event) || "getStorageSync".equals(event)) {
            getStorage(event, params, callback);
        } else if ("getStorageInfo".equals(event) || "getStorageInfoSync".equals(event)) {
            getStorageInfo(event, params, callback);
        } else if ("removeStorage".equals(event) || "removeStorageSync".equals(event)) {
            removeStorage(event, params, callback);
        } else if ("clearStorage".equals(event) || "clearStorageSync".equals(event)) {
            clearStorage(event, params, callback);
        }
    }

    /**
     * 将数据存储在本地缓存中指定的key中，会覆盖掉原来该 key 对应的内容
     *
     * @param event
     * @param params
     * @param callback
     */
    public void setStorage(String event, String params, IApiCallback callback) {
        String key = null;

        Object data = null;

        try {
            JSONObject jsonParam = new JSONObject(params);
            key = jsonParam.optString("key");
            data = jsonParam.opt("data");

        } catch (JSONException e) {
            callback.onResult(packageResultData(event, RESULT_FAIL, null));
            return;
        }

        if (getContext() == null || TextUtils.isEmpty(mPreferenceName) || mCurSize >= BYTE_LIMIT || TextUtils.isEmpty(key) || data == null) {
            callback.onResult(packageResultData(event, RESULT_FAIL, null));
            return;
        }


        SharedPreferences preference = getContext().getSharedPreferences(mPreferenceName, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = preference.edit();
        editor.putString(key, String.valueOf(data));
        editor.apply();

        callback.onResult(packageResultData(event, RESULT_OK, null));

        mCurSize = loadPreferenceSize(mPreferenceName);

    }

    /**
     * 从本地缓存中获取指定 key 对应的内容。
     *
     * @param event
     * @param params
     * @param callback
     */
    public void getStorage(String event, String params, IApiCallback callback) {
        String key = null;

        try {
            JSONObject jsonParam = new JSONObject(params);
            key = jsonParam.optString("key");
        } catch (JSONException e) {
            callback.onResult(packageResultData(event, RESULT_FAIL, null));
            return;
        }
        if (getContext() == null || TextUtils.isEmpty(mPreferenceName) || TextUtils.isEmpty(key)) {
            callback.onResult(packageResultData(event, RESULT_FAIL, null));
            return;
        }

        SharedPreferences settings = getContext()
                .getSharedPreferences(mPreferenceName, Context.MODE_PRIVATE);
        String data = settings.getString(key, "");
        JSONObject res = new JSONObject();
        try {
            res.put("data", data);
            res.put("dataType", "String");
        } catch (JSONException e) {
            callback.onResult(packageResultData(event, RESULT_FAIL, null));
            return;
        }

        callback.onResult(packageResultData(event, RESULT_OK, res));

    }

    /**
     * 获取当前storage的相关信息
     *
     * @param event
     * @param params
     * @param callback
     */
    public void getStorageInfo(String event, String params, IApiCallback callback) {

        if (getContext() == null || TextUtils.isEmpty(mPreferenceName)) {
            callback.onResult(packageResultData(event, RESULT_FAIL, null));
            return;
        }

        SharedPreferences settings = getContext()
                .getSharedPreferences(mPreferenceName, Context.MODE_PRIVATE);
        Set<String> keys = settings.getAll().keySet();


        JSONObject res = new JSONObject();

        try {
            res.put("keys", String.valueOf(keys));
            res.put("currentSize", mCurSize / 1024);
            res.put("limitSize", BYTE_LIMIT / 1024);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        callback.onResult(packageResultData(event, RESULT_OK, res));

    }

    /**
     * 从本地缓存中异步移除指定 key 。
     *
     * @param event
     * @param params
     * @param callback
     */
    public void removeStorage(String event, String params, IApiCallback callback) {

        String key = null;


        try {
            JSONObject jsonParam = new JSONObject(params);
            key = jsonParam.optString("key");

        } catch (JSONException e) {
            callback.onResult(packageResultData(event, RESULT_FAIL, null));
            return;
        }

        if (getContext() == null || TextUtils.isEmpty(mPreferenceName) || TextUtils.isEmpty(key)) {
            callback.onResult(packageResultData(event, RESULT_FAIL, null));
            return;
        }


        SharedPreferences preference = getContext().getSharedPreferences(mPreferenceName, Context.MODE_PRIVATE);

        String data = preference.getString(key, "");
        SharedPreferences.Editor editor = preference.edit();
        editor.remove(key);
        editor.apply();

        JSONObject res = new JSONObject();

        try {
            res.put("data", data);

        } catch (JSONException e) {
            e.printStackTrace();
        }


        callback.onResult(packageResultData(event, RESULT_OK, res));

        mCurSize = loadPreferenceSize(mPreferenceName);


    }

    /**
     * 清理本地数据缓存。
     *
     * @param event
     * @param params
     * @param callback
     */
    public void clearStorage(String event, String params, IApiCallback callback) {

        if (mSpFile != null) {
            mSpFile.delete();
        }

        callback.onResult(packageResultData(event, RESULT_OK, null));
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
