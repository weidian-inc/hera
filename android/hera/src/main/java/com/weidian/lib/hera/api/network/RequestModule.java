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

import com.weidian.lib.hera.api.BaseApi;
import com.weidian.lib.hera.interfaces.ICallback;
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
public class RequestModule extends BaseApi {

    private static final String METHOD_GET = "GET";

    public RequestModule(Context context) {
        super(context);
    }

    @Override
    public String[] apis() {
        return new String[]{"request"};
    }

    @Override
    public void invoke(String event, JSONObject param, final ICallback callback) {
        String url = param.optString("url");
        String method = param.optString("method");
        JSONObject header = param.optJSONObject("header");
        String dataStr = param.optString("data");
        JSONObject data = null;
        try {
            if (!TextUtils.isEmpty(dataStr)) {
                data = new JSONObject(dataStr);
            }
        } catch (JSONException e) {
            //ignore
        }

        if (TextUtils.isEmpty(url)) {
            callback.onFail();
            return;
        }

        if (TextUtils.isEmpty(method)) {
            method = METHOD_GET;
        }

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
                HANDLER.post(new Runnable() {
                    @Override
                    public void run() {
                        callback.onFail();
                    }
                });
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                try {
                    final JSONObject data = new JSONObject();
                    data.put("statusCode", response.code());
                    String result = response.body().string();
                    data.put("data", result);
                    JSONObject headerJson = new JSONObject();
                    Headers resHeaders = response.headers();
                    for (int i = 0, size = resHeaders.size(); i < size; i++) {
                        headerJson.put(resHeaders.name(i), resHeaders.value(i));
                    }
                    data.put("header", headerJson);
                    HANDLER.post(new Runnable() {
                        @Override
                        public void run() {
                            callback.onSuccess(data);
                        }
                    });
                } catch (JSONException e) {
                    HANDLER.post(new Runnable() {
                        @Override
                        public void run() {
                            HeraTrace.e(TAG, "request assemble result exception!");
                            callback.onFail();
                        }
                    });
                }
            }
        });
    }
}
