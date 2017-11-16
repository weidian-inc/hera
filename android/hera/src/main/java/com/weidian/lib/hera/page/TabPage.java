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
import android.text.TextUtils;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.LinearLayout;

import com.weidian.lib.hera.R;
import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.model.TabItemInfo;
import com.weidian.lib.hera.page.view.NavigationBar;
import com.weidian.lib.hera.page.view.PageWebView;
import com.weidian.lib.hera.page.view.TabBar;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.web.HeraWebViewClient;
import com.weidian.lib.hera.widget.ToastView;

import java.util.List;

/**
 * Tab页面
 */
public class TabPage extends Page implements TabBar.OnSwitchTabListener {

    private FrameLayout mWebLayout;
    private NavigationBar mNavigationBar;
    private PageWebView mCurrentWebView;
    private TabBar mTabBar;
    private ToastView mToastView;

    public TabPage(Context context, AppConfig appConfig) {
        super(context, appConfig);
        init(context);
    }

    private void init(Context context) {
        inflate(context, R.layout.hera_tab_page, this);
        LinearLayout topLayout = (LinearLayout) findViewById(R.id.top_layout);
        LinearLayout bottomLayout = (LinearLayout) findViewById(R.id.bottom_layout);
        mWebLayout = (FrameLayout) findViewById(R.id.web_layout);
        mToastView = (ToastView) findViewById(R.id.toast_view);
        mNavigationBar = new NavigationBar(context);

        //添加导航栏
        topLayout.addView(mNavigationBar, new LayoutParams(LayoutParams.MATCH_PARENT,
                LayoutParams.WRAP_CONTENT));

        //添加tab栏
        mTabBar = new TabBar(context, appConfig);
        mTabBar.setOnSwitchTabListener(this);
        if (appConfig.isTopTabBar()) {
            bottomLayout.setVisibility(GONE);
            topLayout.addView(mTabBar, new LayoutParams(LayoutParams.MATCH_PARENT,
                    LayoutParams.WRAP_CONTENT));
        } else {
            bottomLayout.setVisibility(VISIBLE);
            bottomLayout.addView(mTabBar, new LayoutParams(LayoutParams.MATCH_PARENT,
                    LayoutParams.WRAP_CONTENT));
        }

        //添加web页面
        List<TabItemInfo> list = appConfig.getTabItemList();
        int len = (list == null ? 0 : list.size());
        for (int i = 0; i < len; i++) {
            TabItemInfo info = list.get(i);
            String pagePath = info != null ? info.pagePath : null;
            mWebLayout.addView(createSwipeRefreshWebView(context, pagePath),
                    new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT,
                            FrameLayout.LayoutParams.MATCH_PARENT));
        }
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        mToastView.clearCallbacks();
        int count = mWebLayout.getChildCount();
        for (int i = 0; i < count; i++) {
            SwipeRefreshLayout refreshLayout = (SwipeRefreshLayout) mWebLayout.getChildAt(i);
            PageWebView webView = (PageWebView) refreshLayout.getChildAt(0);
            refreshLayout.removeAllViews();
            webView.setTag(null);
            webView.destroy();
        }
        mWebLayout.removeAllViews();
        removeAllViews();
    }

    @Override
    public void switchTab(String url) {
        switchTab(url, SWITCH_TAB);
    }

    @Override
    public void subscribeHandler(String event, String params, int[] viewIds) {
        super.subscribeHandler(event, params, viewIds);
        if (viewIds == null || viewIds.length == 0) {
            return;
        }

        int count = mWebLayout.getChildCount();
        for (int i = 0; i < count; i++) {
            SwipeRefreshLayout refreshLayout = (SwipeRefreshLayout) mWebLayout.getChildAt(i);
            PageWebView webView = (PageWebView) refreshLayout.getChildAt(0);
            for (int viewId : viewIds) {
                if (viewId == webView.getViewId()) {
                    String jsFun = String.format("javascript:HeraJSBridge.subscribeHandler('%s',%s)",
                            event, params);
                    webView.loadUrl(jsFun);
                    break;
                }
            }
        }
    }

    @Override
    public void onLaunchHome(String url) {
        super.onLaunchHome(url);
        switchTab(url, APP_LAUNCH);
    }

    @Override
    public int getViewId() {
        return mCurrentWebView != null ? mCurrentWebView.getViewId() : 0;
    }

    @Override
    protected NavigationBar getNavigationBar() {
        return mNavigationBar;
    }

    @Override
    protected WebView getCurrentWebView() {
        return mCurrentWebView;
    }

    @Override
    protected ToastView getToastView() {
        return mToastView;
    }

    @Override
    protected String pageTag() {
        return "TabPage";
    }

    private SwipeRefreshLayout createSwipeRefreshWebView(Context context, String pagePath) {
        SwipeRefreshLayout refreshLayout = new SwipeRefreshLayout(context);
        refreshLayout.setEnabled(appConfig.isEnablePullDownRefresh(pagePath));
        refreshLayout.setColorSchemeColors(Color.GRAY);
        refreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                HeraTrace.d(pageTag(), "start onPullDownRefresh");
                onPageEvent("onPullDownRefresh", "{}");
            }
        });
        PageWebView webView = new PageWebView(context);
        webView.setTag(pagePath);
        webView.setWebViewClient(new HeraWebViewClient(appConfig));
        webView.setJsHandler(this);
        refreshLayout.addView(webView, 0, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        return refreshLayout;
    }

    private void switchTab(String url, String openType) {
        Uri uri = Uri.parse(url);
        String pagePath = uri.getPath();
        int index = pagePath.lastIndexOf(".");
        if (index > 0) {
            pagePath = pagePath.substring(0, index);
        } else {
            uri = uri.buildUpon().path(pagePath + ".html").build();
        }

        mNavigationBar.setText(appConfig.getPageTitle(pagePath));
        mTabBar.switchTab(pagePath);
        int count = mWebLayout.getChildCount();
        for (int i = 0; i < count; i++) {
            SwipeRefreshLayout refreshLayout = (SwipeRefreshLayout) mWebLayout.getChildAt(i);
            PageWebView webView = (PageWebView) refreshLayout.getChildAt(0);
            Object tag = webView.getTag();
            if (tag != null && TextUtils.equals(pagePath, tag.toString())) {
                refreshLayout.setVisibility(VISIBLE);
                mCurrentWebView = webView;
                String webUrl = webView.getUrl();
                if (TextUtils.isEmpty(webUrl)) {
                    loadUrl(uri.toString(), openType);
                } else {
                    currentPagePath = pagePath + ".html";
                    currentPageOpenType = SWITCH_TAB;
                    onDomContentLoaded();
                }
            } else {
                refreshLayout.setVisibility(GONE);
            }
        }
    }
}
