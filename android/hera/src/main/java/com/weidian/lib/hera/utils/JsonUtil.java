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

import android.os.Bundle;
import android.text.TextUtils;

import com.weidian.lib.hera.trace.HeraTrace;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;
import java.util.Set;

/**
 * json操作工具类
 */
public class JsonUtil {

    private static final String TAG = "JsonUtil";

    private JsonUtil() {
    }

    /**
     * 从被给的JSON字符串中获取指定key的字符串类型值
     *
     * @param json         json字符串
     * @param key          获取其值的键
     * @param defaultValue 默认值
     * @return 对应key的值或默认值
     */
    public static String getStringValue(String json, String key, String defaultValue) {
        try {
            JSONObject paramJson = new JSONObject(json);
            if (paramJson.has(key)) {
                return paramJson.optString(key);
            }
        } catch (JSONException e) {
            HeraTrace.e(TAG, "getStringValue exception!");
        }
        return defaultValue;
    }

    /**
     * 从被给的JSON字符串中获取指定key的数字类型值
     *
     * @param json         json字符串
     * @param key          获取其值的键
     * @param defaultValue 默认值
     * @return 对应key的值或默认值
     */
    public static int getIntValue(String json, String key, int defaultValue) {
        try {
            JSONObject paramJson = new JSONObject(json);
            if (paramJson.has(key)) {
                return paramJson.optInt(key);
            }
        } catch (JSONException e) {
            HeraTrace.e(TAG, "getIntValue exception!");
        }
        return defaultValue;
    }

    /**
     * 解析JSONArray到int数组
     *
     * @param jsonArrayStr json数组字符串
     * @return int数组
     */
    public static int[] parseToIntArray(String jsonArrayStr) {
        int[] ids;
        try {
            JSONArray jsonArray = new JSONArray(jsonArrayStr);
            int len = jsonArray.length();
            if (len > 0) {
                ids = new int[len];
                for (int i = 0; i < len; i++) {
                    ids[i] = jsonArray.getInt(i);
                }
                return ids;
            }
        } catch (JSONException e) {
            HeraTrace.e(TAG, String.format("parseViewIds(%s) exception, %s", jsonArrayStr, e.getMessage()));
        }

        ids = new int[1];
        ids[0] = 0;
        return ids;
    }

    /**
     * 将json字符串对象解析为Bundle对象
     *
     * @param json json字符串
     * @return 解析后的bundle对象
     */
    public static Bundle parseToBundle(String json) {
        Bundle bundle = new Bundle();
        try {
            JSONObject jsonObject = new JSONObject(json);
            Iterator<String> iterator = jsonObject.keys();
            while (iterator.hasNext()) {
                String key = iterator.next();
                String value = jsonObject.optString(key);
                if (!TextUtils.isEmpty(value)) {
                    bundle.putString(key, value);
                }
            }
        } catch (Exception e) {
            HeraTrace.e(TAG, String.format("parseToBundle(%s) exception, %s", json, e.getMessage()));
        }
        return bundle;
    }

    /**
     * 将Bundle对象转换为JSON对象，其值均为String类型
     *
     * @param bundle bundle对象
     * @return 转换后的json对象
     */
    public static JSONObject parseToJson(Bundle bundle) {
        JSONObject jsonObject = new JSONObject();
        if (bundle == null) {
            return jsonObject;
        }
        try {
            Set<String> keys = bundle.keySet();
            for (String key : keys) {
                Object object = bundle.get(key);
                if (object != null) {
                    jsonObject.put(key, object.toString());
                }
            }
        } catch (Exception e) {
            HeraTrace.e(TAG, String.format("parseToJson(Bundle) exception, %s", e.getMessage()));
        }
        return jsonObject;
    }
}
