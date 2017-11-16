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


package com.weidian.lib.hera.sync;

import android.content.Context;
import android.os.AsyncTask;
import android.text.TextUtils;

import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.StorageUtil;
import com.weidian.lib.hera.utils.ZipUtil;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

/**
 * 小程序资源管理类，负责解压小程序
 */
public class HeraAppManager {

    private static final String TAG = "HeraAppManager";

    private HeraAppManager() {
    }

    /**
     * 同步小程序，暂不涉及更新逻辑，直接解压到指定目录
     *
     * @param context
     * @param appId    小程序id
     * @param appPath  本地的小程序路径
     * @param callback 回调接口
     */
    public static void syncMiniApp(Context context, String appId, String appPath, SyncCallback callback) {
        new SyncMiniAppTask(context, callback)
                .executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR, appId, appPath);
    }

    /**
     * 小程序的解压任务类
     */
    private static class SyncMiniAppTask extends AsyncTask<String, Void, Boolean> {

        private Context mContext;
        private SyncCallback mCallback;

        SyncMiniAppTask(Context context, SyncCallback callback) {
            mContext = context;
            mCallback = callback;
        }

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
        }

        @Override
        protected Boolean doInBackground(String... params) {
            if (params == null || params.length < 2) {
                return false;
            }
            String appId = params[0];
            String appPath = params[1];
            String outputPath = StorageUtil.getMiniAppSourceDir(mContext, appId).getAbsolutePath();
            boolean unzipResult = false;
            if (!TextUtils.isEmpty(appPath)) {
                unzipResult = ZipUtil.unzipFile(appPath, outputPath);
            }
            if (!unzipResult) {
                try {
                    InputStream in = mContext.getAssets().open(appId + ".zip");
                    unzipResult = ZipUtil.unzipFile(in, outputPath);
                } catch (IOException e) {
                    HeraTrace.e(TAG, e.getMessage());
                }
            }

            return unzipResult && new File(outputPath, "service.html").exists();
        }

        @Override
        protected void onPostExecute(Boolean aBoolean) {
            mCallback.onResult(aBoolean);
        }
    }

    public interface SyncCallback {
        void onResult(boolean result);
    }

}
