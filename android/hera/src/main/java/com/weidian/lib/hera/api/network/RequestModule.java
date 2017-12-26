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


package com.weidian.lib.hera.api.network;

import android.content.Context;
import android.text.TextUtils;
import android.util.Log;

import com.weidian.lib.hera.api.AbsModule;
import com.weidian.lib.hera.api.HeraApi;
import com.weidian.lib.hera.interfaces.IApiCallback;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.OkHttpUtil;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.Map;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.FormBody;
import okhttp3.Headers;
import okhttp3.Request;
import okhttp3.Response;

/**
 * 发起请求api
 */
@HeraApi(names = {"request"})
public class RequestModule extends AbsModule {

    private static final String METHOD_GET = "GET";

    public RequestModule(Context context) {
        super(context);
    }

    @Override
    public void invoke(final String event, String params, final IApiCallback callback) {
        String url = "";
        String method = "";
        JSONObject data = null;
        JSONObject header = null;
        try {
            JSONObject jsonObject = new JSONObject(params);
            url = jsonObject.optString("url");
            method = jsonObject.optString("method");
            header = jsonObject.optJSONObject("header");
            String dataStr = jsonObject.optString("data");
            if (!TextUtils.isEmpty(dataStr)) {
                data = new JSONObject(dataStr);
            }
        } catch (Exception e) {
            Log.w(TAG, "parse params exception", e);
        }

        if (TextUtils.isEmpty(url)) {
            callback.onResult(packageResultData(event, RESULT_FAIL, null));
            return;
        }

        if (TextUtils.isEmpty(method)) {
            method = METHOD_GET;
        }

        try {
            Map<String, String> reqParam = OkHttpUtil.parseJsonToMap(data);
            Headers headers = Headers.of(OkHttpUtil.parseJsonToMap(header));
            Request.Builder requestBuilder = new Request.Builder().headers(headers);
            if (METHOD_GET.equals(method)) {
                //url = OkHttpUtil.appendUrlParams(url, reqParam);
                requestBuilder.url(url).get();
            } else {
                FormBody.Builder formBuilder = new FormBody.Builder();
                for (Map.Entry<String, String> entry : reqParam.entrySet()) {
                    formBuilder.add(entry.getKey(), entry.getValue());
                }
                requestBuilder.url(url).method(method, formBuilder.build());
            }

            OkHttpUtil.enqueue(requestBuilder.build(), new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    final JSONObject data = new JSONObject();
                    try {
                        data.put("exception", e != null ? e.getMessage() : "request onFailure");
                    } catch (Exception ex) {
                        HeraTrace.w(TAG, "request failed, assemble exception message to json error!");
                    }
                    HANDLER.post(new Runnable() {
                        @Override
                        public void run() {
                            callback.onResult(packageResultData(event, RESULT_FAIL, data));
                        }
                    });
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    final JSONObject data = new JSONObject();
                    try {
                        data.put("statusCode", response.code());
                        String result = response.body().string();
                        data.put("data", result);
                        JSONObject headerJson = new JSONObject();
                        Headers resHeaders = response.headers();
                        for (int i = 0, size = resHeaders.size(); i < size; i++) {
                            headerJson.put(resHeaders.name(i), resHeaders.value(i));
                        }
                        data.put("header", headerJson);
                    } catch (JSONException e) {
                        HeraTrace.w(TAG, "request success, assemble data to json error!");
                    }
                    HANDLER.post(new Runnable() {
                        @Override
                        public void run() {
                            callback.onResult(packageResultData(event, RESULT_OK, data));
                        }
                    });
                }
            });
        } catch (Exception e) {
            callback.onResult(packageResultData(event, RESULT_FAIL, null));
        }
    }
}
