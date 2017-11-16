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


package com.weidian.lib.hera.page;

import android.content.Context;
import android.graphics.Color;
import android.net.Uri;
import android.support.v4.widget.SwipeRefreshLayout;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.LinearLayout;

import com.weidian.lib.hera.R;
import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.page.view.NavigationBar;
import com.weidian.lib.hera.page.view.PageWebView;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.web.HeraWebViewClient;
import com.weidian.lib.hera.widget.ToastView;

/**
 * 单页面
 */
public class SinglePage extends Page {

    private FrameLayout mWebLayout;
    private NavigationBar mNavigationBar;
    private PageWebView mPageWebView;
    private ToastView mToastView;

    public SinglePage(Context context, AppConfig appConfig) {
        super(context, appConfig);
        init(context);
    }

    private void init(Context context) {
        setOrientation(VERTICAL);
        inflate(context, R.layout.hera_single_page, this);

        LinearLayout topLayout = (LinearLayout) findViewById(R.id.top_layout);
        mNavigationBar = new NavigationBar(context);
        topLayout.addView(mNavigationBar, new LayoutParams(LayoutParams.MATCH_PARENT,
                LayoutParams.WRAP_CONTENT));

        mWebLayout = (FrameLayout) findViewById(R.id.web_layout);
        SwipeRefreshLayout refreshLayout = new SwipeRefreshLayout(context);
        refreshLayout.setEnabled(false);//默认不可用，根据页面配置决定启用与否
        refreshLayout.setColorSchemeColors(Color.GRAY);
        refreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                HeraTrace.d(pageTag(), "start onPullDownRefresh");
                onPageEvent("onPullDownRefresh", "{}");
            }
        });
        mPageWebView = new PageWebView(context);
        mPageWebView.setWebViewClient(new HeraWebViewClient(appConfig));
        mPageWebView.setJsHandler(this);
        refreshLayout.addView(mPageWebView, 0, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        mWebLayout.addView(refreshLayout, new LayoutParams(LayoutParams.MATCH_PARENT,
                LayoutParams.MATCH_PARENT));

        mToastView = (ToastView) findViewById(R.id.toast_view);
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        removeAllViews();
        mToastView.clearCallbacks();
        mWebLayout.removeAllViews();
        ((ViewGroup) mPageWebView.getParent()).removeAllViews();
        mPageWebView.destroy();
    }

    @Override
    public void subscribeHandler(String event, String params, int[] viewIds) {
        super.subscribeHandler(event, params, viewIds);
        if (viewIds == null || viewIds.length == 0) {
            return;
        }
        for (int viewId : viewIds) {
            if (viewId == mPageWebView.getViewId()) {
                String jsFun = String.format("javascript:HeraJSBridge.subscribeHandler('%s',%s)",
                        event, params);
                mPageWebView.loadUrl(jsFun);
                return;
            }
        }
    }

    @Override
    public void onLaunchHome(String url) {
        super.onLaunchHome(url);
        Uri uri = Uri.parse(url);
        String pagePath = uri.getPath();
        if (pagePath.lastIndexOf(".") < 0) {
            uri = uri.buildUpon().path(pagePath + ".html").build();
        }
        loadUrl(uri.toString(), APP_LAUNCH);
    }

    @Override
    public int getViewId() {
        return mPageWebView.getViewId();
    }

    @Override
    protected NavigationBar getNavigationBar() {
        return mNavigationBar;
    }

    @Override
    protected WebView getCurrentWebView() {
        return mPageWebView;
    }

    @Override
    protected ToastView getToastView() {
        return mToastView;
    }

    @Override
    protected String pageTag() {
        return "SinglePage";
    }
}
