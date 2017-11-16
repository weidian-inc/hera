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


package com.weidian.lib.hera.api.media;

import android.content.Context;
import android.graphics.BitmapFactory;
import android.text.TextUtils;
import android.webkit.URLUtil;

import com.weidian.lib.hera.api.AbsModule;
import com.weidian.lib.hera.api.HeraApi;
import com.weidian.lib.hera.interfaces.IApiCallback;
import com.weidian.lib.hera.trace.HeraTrace;
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
import okhttp3.Request;
import okhttp3.Response;

/**
 * 获取图片信息的api
 */
@HeraApi(names = {"getImageInfo"})
public class ImageInfoModule extends AbsModule {

    private String mTempDir;

    public ImageInfoModule(Context context) {
        super(context);
        mTempDir = StorageUtil.getTempDir(context).getAbsolutePath();
    }

    @Override
    public void invoke(String event, String params, IApiCallback callback) {
        String src = "";
        try {
            JSONObject paramJson = new JSONObject(params);
            src = paramJson.optString("src");
        } catch (JSONException e) {
            HeraTrace.e(TAG, "getImageInfo parse params exception!");
        }

        if (TextUtils.isEmpty(src)) {
            callback.onResult(packageResultData(event, RESULT_FAIL, null));
            return;
        }

        if (!URLUtil.isNetworkUrl(src)) {
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;
            BitmapFactory.decodeFile(src, options);

            JSONObject data = new JSONObject();
            try {
                data.put("width", options.outWidth);
                data.put("height", options.outHeight);
                data.put("path", src);
            } catch (JSONException e) {
                e.printStackTrace();
            }

            callback.onResult(packageResultData(event, RESULT_OK, data));
        } else {
            getImageInfoForUrl(src, event, callback);
        }
    }

    private void getImageInfoForUrl(String url, final String event, final IApiCallback callback) {
        try {
            Request request = new Request.Builder().url(url).build();
            OkHttpUtil.enqueue(request, new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    HANDLER.post(new Runnable() {
                        @Override
                        public void run() {
                            callback.onResult(packageResultData(event, RESULT_FAIL, null));
                        }
                    });
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    String tempFilePath = null;
                    InputStream is = null;
                    FileOutputStream os = null;
                    try {
                        tempFilePath = new File(mTempDir,
                                String.valueOf(System.currentTimeMillis())).getAbsolutePath();
                        is = response.body().byteStream();
                        os = new FileOutputStream(tempFilePath);
                        byte[] buffer = new byte[4096];
                        int len;
                        while ((len = is.read(buffer)) >= 0) {
                            os.write(buffer, 0, len);
                        }
                        os.flush();
                    } catch (IOException e) {
                        tempFilePath = null;
                    } finally {
                        IOUtil.closeAll(is, os);
                    }

                    final String filePath = tempFilePath;
                    HANDLER.post(new Runnable() {
                        @Override
                        public void run() {
                            if (TextUtils.isEmpty(filePath)) {
                                callback.onResult(packageResultData(event, RESULT_FAIL, null));
                            } else {
                                BitmapFactory.Options options = new BitmapFactory.Options();
                                options.inJustDecodeBounds = true;
                                BitmapFactory.decodeFile(filePath, options);

                                JSONObject data = new JSONObject();
                                try {
                                    data.put("width", options.outWidth);
                                    data.put("height", options.outHeight);
                                    data.put("path", filePath);
                                } catch (JSONException e) {
                                    e.printStackTrace();
                                }
                                callback.onResult(packageResultData(event, RESULT_OK, data));
                            }
                        }
                    });

                }
            });
        } catch (Exception e) {
            callback.onResult(packageResultData(event, RESULT_FAIL, null));
        }
    }

}
