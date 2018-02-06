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
import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.interfaces.ICallback;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.FileUtil;
import com.weidian.lib.hera.utils.IOUtil;
import com.weidian.lib.hera.utils.OkHttpUtil;
import com.weidian.lib.hera.utils.StorageUtil;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Headers;
import okhttp3.Request;
import okhttp3.Response;

/**
 * 下载文件api
 */
public class DownloadModule extends BaseApi {

    private String mTempDir;

    public DownloadModule(Context context, AppConfig appConfig) {
        super(context);
        mTempDir = appConfig.getMiniAppTempPath(context);
    }

    @Override
    public String[] apis() {
        return new String[]{"downloadFile"};
    }

    @Override
    public void invoke(String event, JSONObject param, final ICallback callback) {
        String url = param.optString("url");
        JSONObject header = param.optJSONObject("header");

        if (TextUtils.isEmpty(mTempDir) || TextUtils.isEmpty(url)) {
            callback.onFail();
            return;
        }

        Headers headers = Headers.of(OkHttpUtil.parseJsonToMap(header));
        Request request = new Request.Builder().headers(headers).url(url).build();
        OkHttpUtil.enqueue(request, new Callback() {
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
                File tempFile = null;
                InputStream is = null;
                FileOutputStream os = null;
                try {
                    String urlPath = response.request().url().encodedPath();
                    String tempFileName = StorageUtil.PREFIX_TMP + System.currentTimeMillis()
                            + FileUtil.getFileSuffix(urlPath);
                    tempFile = new File(mTempDir, tempFileName);
                    is = response.body().byteStream();
                    os = new FileOutputStream(tempFile);
                    byte[] buffer = new byte[4096];
                    int len;
                    while ((len = is.read(buffer)) >= 0) {
                        os.write(buffer, 0, len);
                    }
                    os.flush();
                } catch (IOException e) {
                    tempFile = null;
                } finally {
                    IOUtil.closeAll(is, os);
                }

                final int statusCode = response.code();
                final String tempFileName = tempFile != null ?
                        StorageUtil.SCHEME_WDFILE + tempFile.getName() : null;
                HANDLER.post(new Runnable() {
                    @Override
                    public void run() {
                        if (!TextUtils.isEmpty(tempFileName)) {
                            JSONObject data = new JSONObject();
                            try {
                                data.put("statusCode", statusCode);
                                data.put("tempFilePath", tempFileName);
                                callback.onSuccess(data);
                                return;
                            } catch (JSONException e) {
                                HeraTrace.e(TAG, "downloadFile assemble result exception!");
                            }
                        }
                        callback.onFail();
                    }
                });
            }
        });
    }
}
