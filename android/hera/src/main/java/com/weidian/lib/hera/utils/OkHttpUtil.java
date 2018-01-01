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


package com.weidian.lib.hera.utils;

import android.net.Uri;
import android.text.TextUtils;
import android.webkit.URLUtil;

import com.facebook.stetho.okhttp3.StethoInterceptor;

import org.json.JSONObject;

import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * http请求工具类
 */
public class OkHttpUtil {

    private static final String TAG = "OkHttpUtil";

    private OkHttpUtil() {
    }

    private static final OkHttpClient CLIENT = new OkHttpClient.Builder()
            .connectTimeout(100, TimeUnit.SECONDS)
            .readTimeout(100, TimeUnit.SECONDS)
            .writeTimeout(100, TimeUnit.SECONDS)
            .addNetworkInterceptor(new StethoInterceptor())
            .build();

    /**
     * 执行同步请求
     *
     * @param request 请求对象
     * @return 响应对象
     * @throws IOException
     */
    public static Response execute(Request request) throws IOException {
        return CLIENT.newCall(request).execute();
    }

    /**
     * 执行异步请求
     *
     * @param request  请求对象
     * @param callback 异步请求的回调
     */
    public static void enqueue(Request request, Callback callback) {
        CLIENT.newCall(request).enqueue(callback);
    }

    /**
     * 为url添加参数
     *
     * @param url   原url，必须以http或https开头
     * @param key   参数的键
     * @param value 参数的值
     * @return 原url或附加参数后的url
     */
    public static String appendUrlParam(String url, String key, String value) {
        if (!URLUtil.isNetworkUrl(url) || TextUtils.isEmpty(key) || TextUtils.isEmpty(value)) {
            return url;
        }

        Uri uri = Uri.parse(url);
        Uri.Builder builder = uri.buildUpon();
        builder.appendQueryParameter(key, value);
        return builder.build().toString();
    }

    /**
     * 附加一组url参数，不会去重
     *
     * @param url    原url，必须以http或https开头
     * @param params 参数组
     * @return 原url或附加参数后的url
     */
    public static String appendUrlParams(String url, Map<String, String> params) {
        if (!URLUtil.isNetworkUrl(url) || params == null || params.size() == 0) {
            return url;
        }

        Uri uri = Uri.parse(url);
        Uri.Builder builder = uri.buildUpon();
        for (Map.Entry<String, String> param : params.entrySet()) {
            builder.appendQueryParameter(param.getKey(), param.getValue());
        }
        return builder.build().toString();
    }

    /**
     * 将JSONObject对象转为Map对象
     *
     * @param json json字符串
     * @return 解析转换后的Map对象
     */
    public static Map<String, String> parseJsonToMap(JSONObject json) {
        Map<String, String> map = new HashMap<>();
        if (json == null) {
            return map;
        }

        Iterator<String> iterator = json.keys();
        while (iterator.hasNext()) {
            String key = iterator.next();
            String value = json.optString(key);
            if (!TextUtils.isEmpty(value)) {
                map.put(key, value);
            }
        }

        return map;
    }

}
