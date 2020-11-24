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


package com.weidian.lib.hera.main;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Build;
import android.os.IBinder;
import androidx.annotation.Nullable;
import android.text.TextUtils;
import android.webkit.WebView;

import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.config.HeraConfig;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.IOUtil;
import com.weidian.lib.hera.utils.SharePreferencesUtil;
import com.weidian.lib.hera.utils.StorageUtil;
import com.weidian.lib.hera.utils.ZipUtil;


import java.io.IOException;
import java.io.InputStream;

/**
 * hera进程service，提前创建进程，初始化相关操作
 */
public class HeraService extends Service {

    private static final String TAG = "HeraProcessService";
    private static final String HERA_FRAMEWORK = "framework.zip";

    private static HeraConfig sConfig;

    public static HeraConfig config() {
        return sConfig != null ? sConfig : new HeraConfig.Builder().build();
    }

    /**
     * 启动Hera服务进程
     *
     * @param context
     * @param config
     */
    public static void start(Context context, HeraConfig config) {
        HeraTrace.d(TAG, "start HeraProcessService");
        sConfig = config;//宿主进程记录的HeraConfig
        initFramework(context);

        Intent intent = new Intent(context, HeraService.class);
        if (config != null) {
            intent.putExtra("debug", config.isDebug());
        }
        context.startService(intent);
    }

    /**
     * 启动Hera首页面
     *
     * @param context
     * @param appId
     * @param userId
     * @param appPath
     */
    public static void launchHome(Context context, String userId, String appId, String appPath) {
        if (context == null || TextUtils.isEmpty(appId) || TextUtils.isEmpty(userId)) {
            throw new IllegalArgumentException("context, appId and userId are not null");
        }

        Intent intent = new Intent(context, HeraActivity.class);
        intent.putExtra(HeraActivity.APP_ID, appId);
        intent.putExtra(HeraActivity.USER_ID, userId);
        intent.putExtra(HeraActivity.APP_PATH, appPath);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }

    /**
     * 初始化解压framework到指定目录，虽版本升级进行更新的策略
     *
     * @param context
     */
    private static void initFramework(Context context) {
        boolean needUpdate = SharePreferencesUtil.loadBoolean(context, AppConfig.getHostVersion(context), true);
        if (!StorageUtil.isFrameworkExists(context) || needUpdate) {
            FrameworkInitTask task = new FrameworkInitTask(context);
            task.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        HeraTrace.d(TAG, "HeraProcessService onCreate");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (sConfig == null && intent != null) {
            //hera进程记录的HeraConfig
            boolean debug = intent.getBooleanExtra("debug", false);
            sConfig = new HeraConfig.Builder()
                    .setDebug(debug).build();
        }
        if (config().isDebug() && Build.VERSION.SDK_INT >= 19) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        return START_NOT_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
    }

    /**
     * Framework初始化任务
     */
    private static class FrameworkInitTask extends AsyncTask<String, Void, Boolean> {

        private Context mContext;

        FrameworkInitTask(Context context) {
            mContext = context;
        }

        @Override
        protected Boolean doInBackground(String... params) {
            boolean unzipSuccess = false;
            InputStream in = null;
            try {
                in = mContext.getAssets().open(HERA_FRAMEWORK);
                unzipSuccess = ZipUtil.unzipFile(in,
                        StorageUtil.getFrameworkDir(mContext).getAbsolutePath());
            } catch (IOException e) {
                HeraTrace.e(TAG, e.getMessage());
            } finally {
                IOUtil.closeAll(in);
            }

            return unzipSuccess;
        }

        @Override
        protected void onPostExecute(Boolean res) {
            if (res && StorageUtil.isFrameworkExists(mContext)) {
                SharePreferencesUtil.saveBoolean(mContext, AppConfig.getHostVersion(mContext), false);
            }

            HeraTrace.d(TAG, "unzip task is done: " + res);
        }
    }

}
