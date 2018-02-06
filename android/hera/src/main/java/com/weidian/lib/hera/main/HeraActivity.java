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

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v7.app.AppCompatActivity;
import android.text.TextUtils;
import android.view.Window;
import android.widget.FrameLayout;

import com.weidian.lib.hera.R;
import com.weidian.lib.hera.api.ApisManager;
import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.interfaces.OnEventListener;
import com.weidian.lib.hera.service.AppService;
import com.weidian.lib.hera.sync.HeraAppManager;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.StorageUtil;
import com.weidian.lib.hera.widget.LoadingIndicator;

import java.util.Arrays;

/**
 * 页面逻辑控制
 */
public class HeraActivity extends AppCompatActivity implements OnEventListener {

    private static final String TAG = "HeraActivity";
    public static final String APP_ID = "app_id";
    public static final String USER_ID = "user_id";
    public static final String APP_PATH = "app_path";

    private FrameLayout mContainer;
    private AppConfig mAppConfig;
    private ApisManager mApisManager;
    private AppService mAppService;
    private PageManager mPageManager;

    private LoadingIndicator mLoadingIndicator;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (Build.VERSION.SDK_INT >= 21) {
            getWindow().requestFeature(Window.FEATURE_CONTENT_TRANSITIONS);
        }

        //1. 获取并校验参数
        Intent intent = getIntent();
        String appId = intent.getStringExtra(APP_ID);
        String userId = intent.getStringExtra(USER_ID);
        String appPath = intent.getStringExtra(APP_PATH);
        if (TextUtils.isEmpty(appId)) {
            throw new IllegalArgumentException("Intent has not extra 'app_id', " +
                    "start HeraActivity failed!");
        }
        if (TextUtils.isEmpty(userId)) {
            throw new IllegalArgumentException("Intent has not extra 'user_id', " +
                    "start HeraActivity failed!");
        }
        HeraTrace.d(TAG, String.format("MiniApp[%s] open", appId));

        //2. 创建AppConfig，将appId和userId缓存，在整个小程序运行期内有效
        mAppConfig = new AppConfig(appId, userId);

        //3. 创建ApiManager，管理Api的调用
        mApisManager = new ApisManager(this, this, mAppConfig);
        mApisManager.onCreate();

        //4. 初始化视图
        setContentView(R.layout.hera_main_activity);
        mContainer = (FrameLayout) findViewById(R.id.container);

        //5. 初始化并同步小程序信息
        mLoadingIndicator = (LoadingIndicator) findViewById(R.id.loading_indicator);
        mLoadingIndicator.setTitle(getString(R.string.app_name));
        mLoadingIndicator.show();
        HeraAppManager.syncMiniApp(this, appId, appPath, new HeraAppManager.SyncCallback() {
            @Override
            public void onResult(boolean result) {
                if (!result || !StorageUtil.isFrameworkExists(getApplicationContext())) {
                    mLoadingIndicator.hide();
                    finish();
                } else {
                    loadPage(mContainer);
                }
            }
        });
    }

    /**
     * 加载页面
     *
     * @param container
     */
    private void loadPage(FrameLayout container) {
        mAppService = new AppService(this, this, mAppConfig, mApisManager);
        container.addView(mAppService, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        mPageManager = new PageManager(this, mAppConfig);
        container.addView(mPageManager.getContainer(), new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        HeraTrace.d(TAG, String.format("MiniApp[%s] onRestart", mAppConfig.getAppId()));
    }

    @Override
    protected void onStart() {
        super.onStart();
        if (mAppService != null && mPageManager != null) {
            mAppService.subscribeHandler("onAppEnterForeground", "{}", mPageManager.getTopPageId());
        }
    }

    @Override
    protected void onStop() {
        super.onStop();
        if (mAppService != null && mPageManager != null) {
            mAppService.subscribeHandler("onAppEnterBackground", "{\"mode\":\"hang\"}",
                    mPageManager.getTopPageId());
        }
    }

    @Override
    public void onBackPressed() {
        if (mPageManager != null && mPageManager.backPage()) {
            return;
        }
        super.onBackPressed();
        //overridePendingTransition(android.R.anim.slide_in_left, android.R.anim.slide_out_right);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        mApisManager.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onDestroy() {
        HeraTrace.d(TAG, String.format("MiniApp[%s] close", mAppConfig.getAppId()));
        mApisManager.onDestroy();
        StorageUtil.clearMiniAppTempDir(this, mAppConfig.getAppId());
        super.onDestroy();
    }

    @Override
    public void onServiceReady() {
        HeraTrace.d(TAG, "onServiceReady()");
        mLoadingIndicator.hide();
        mPageManager.launchHomePage(mAppConfig.getRootPath(), this);
    }

    @Override
    public void notifyPageSubscribeHandler(String event, String params, int[] viewIds) {
        HeraTrace.d(TAG, String.format("notifyPageSubscribeHandler(%s, %s, %s)",
                Arrays.toString(viewIds), event, params));
        mPageManager.subscribeHandler(event, params, viewIds);
    }

    @Override
    public void notifyServiceSubscribeHandler(String event, String params, int viewId) {
        HeraTrace.d(TAG, String.format("notifyServiceSubscribeHandler('%s', %s, %s)",
                event, params, viewId));
        mAppService.subscribeHandler(event, params, viewId);
    }

    @Override
    public boolean onPageEvent(String event, String params) {
        HeraTrace.d(TAG, String.format("onPageEvent(%s, %s)", event, params));
        return mPageManager.handlePageEvent(event, params, this);
    }

}
