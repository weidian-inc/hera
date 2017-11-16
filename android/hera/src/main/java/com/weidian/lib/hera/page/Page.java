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
import android.net.Uri;
import android.support.v4.widget.SwipeRefreshLayout;
import android.text.TextUtils;
import android.view.inputmethod.InputMethodManager;
import android.webkit.WebView;
import android.widget.LinearLayout;

import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.interfaces.IBridgeHandler;
import com.weidian.lib.hera.interfaces.OnEventListener;
import com.weidian.lib.hera.page.view.NavigationBar;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.ColorUtil;
import com.weidian.lib.hera.utils.FileUtil;
import com.weidian.lib.hera.widget.ToastView;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.Set;

/**
 * Page层，即小程序view展示层
 */
public abstract class Page extends LinearLayout implements IBridgeHandler {

    public static final String APP_LAUNCH = "appLaunch";
    public static final String NAVIGATE_TO = "navigateTo";
    public static final String NAVIGATE_BACK = "navigateBack";
    public static final String REDIRECT_TO = "redirectTo";
    public static final String SWITCH_TAB = "switchTab";

    protected AppConfig appConfig;
    protected OnEventListener eventListener;
    protected String currentPageOpenType;
    protected String currentPagePath;

    public Page(Context context, AppConfig appConfig) {
        super(context);
        this.appConfig = appConfig;
    }

    public void setEventListener(OnEventListener listener) {
        this.eventListener = listener;
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        HeraTrace.d(pageTag(), String.format("view@%s onAttachedToWindow()", getViewId()));
        //设置标题栏背景色（通过应用配置信息获取）
        String textColor = appConfig.getNavigationBarTextColor();
        String bgColor = appConfig.getNavigationBarBackgroundColor();
        getNavigationBar().setTextColor(ColorUtil.parseColor(textColor));
        getNavigationBar().setBGColor(ColorUtil.parseColor(bgColor));
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        HeraTrace.d(pageTag(), String.format("view@%s onDetachedFromWindow()", getViewId()));
        InputMethodManager imm = (InputMethodManager) getContext().getSystemService(
                Context.INPUT_METHOD_SERVICE);
        imm.hideSoftInputFromWindow(getWindowToken(), InputMethodManager.HIDE_NOT_ALWAYS);
    }

    @Override
    public void handlePublish(String event, String params, String viewIds) {
        HeraTrace.d(pageTag(), String.format("view@%s handlePublish(), event=%s, params=%s, viewIds=%s",
                getViewId(), event, params, viewIds));

        if ("custom_event_DOMContentLoaded".equals(event)) {
            onDomContentLoaded();
        } else if ("custom_event_H5_LOG_MSG".equals(event)) {
            HeraTrace.d(params);
        } else {
            onPageEvent(event, params);
        }
    }

    @Override
    public void handleInvoke(String event, String params, String callbackId) {
        HeraTrace.d(pageTag(), String.format("view@%s handleInvoke(), event=%s, params=%s, callbackIds=%s",
                getViewId(), event, params, callbackId));
    }

    /**
     * 页面dom内容加载完成
     */
    protected void onDomContentLoaded() {
        if (eventListener != null) {
            String eventName = "onAppRoute";
            String eventParams = "{}";
            try {
                JSONObject json = new JSONObject();
                json.put("webviewId", getViewId());
                json.put("openType", currentPageOpenType);
                if (!TextUtils.isEmpty(currentPagePath)) {
                    Uri uri = Uri.parse(currentPagePath);
                    json.put("path", uri.getPath());
                    Set<String> keys = uri.getQueryParameterNames();
                    if (keys != null && keys.size() > 0) {
                        JSONObject queryJson = new JSONObject();
                        for (String key : keys) {
                            String value = uri.getQueryParameter(key);
                            queryJson.put(key, value);
                        }
                        json.put("query", queryJson);
                    }
                }
                eventParams = json.toString();
            } catch (JSONException e) {
                HeraTrace.e(pageTag(), "onDomContentLoaded assembly params exception!");
            }
            //通知Service层的订阅处理器处理
            eventListener.notifyServiceSubscribeHandler(eventName, eventParams, getViewId());
        }
    }

    /**
     * 页面事件
     *
     * @param event  事件名称
     * @param params 参数
     */
    protected void onPageEvent(String event, String params) {
        if (eventListener != null) {
            //转由Service层的订阅处理器处理
            eventListener.notifyServiceSubscribeHandler(event, params, getViewId());
        }
    }

    /**
     * Page层的订阅处理器处理事件
     *
     * @param event   事件名称
     * @param params  参数
     * @param viewIds 视图id数组
     */
    public void subscribeHandler(String event, String params, int[] viewIds) {
        HeraTrace.d(pageTag(), String.format("view@%s subscribeHandler('%s',%s)", getViewId(), event, params));
    }

    /**
     * 启动主页面
     *
     * @param url 页面url
     */
    public void onLaunchHome(String url) {
        HeraTrace.d(pageTag(), String.format("view@%s onLaunchHome(%s)", getViewId(), url));
    }

    /**
     * 导航到此页面
     *
     * @param url 页面url
     */
    public void onNavigateTo(String url) {
        HeraTrace.d(pageTag(), String.format("onNavigateTo view@%s, url:%s", getViewId(), url));
        loadUrl(url, NAVIGATE_TO);
    }

    /**
     * 重定向此页面的url
     *
     * @param url 页面url
     */
    public void onRedirectTo(String url) {
        HeraTrace.d(pageTag(), String.format("onRedirectTo view@%s, url:%s", getViewId(), url));
        loadUrl(url, REDIRECT_TO);
    }

    /**
     * 导航回到此页面
     */
    public void onNavigateBack() {
        HeraTrace.d(pageTag(), String.format("onNavigateBack view@%s", getViewId()));
        currentPageOpenType = NAVIGATE_BACK;
        onDomContentLoaded();
    }

    /**
     * 加载页面url
     *
     * @param url      页面url
     * @param openType 打开页面的类型
     */
    public void loadUrl(String url, String openType) {
        HeraTrace.d(pageTag(), String.format("loadUrl(%s, %s) view@%s", url, openType, getViewId()));
        if (TextUtils.isEmpty(url) || getCurrentWebView() == null) {
            return;
        }

        currentPagePath = url;
        currentPageOpenType = openType;

        post(new Runnable() {
            @Override
            public void run() {
                loadContent(currentPagePath, currentPageOpenType);
            }
        });
    }

    private void loadContent(String url, String openType) {
        Uri uri = Uri.parse(url);
        String path = uri.getPath();//屏蔽参数干扰
        HeraTrace.d(pageTag(), "Page file path :" + path);

        int index = path.lastIndexOf(".");
        if (index > 0) {
            String dirPath = url.substring(0, index);
            getNavigationBar().setText(appConfig.getPageTitle(dirPath));
            SwipeRefreshLayout refreshLayout = getSwipeRefreshLayout();
            if (refreshLayout != null) {
                refreshLayout.setEnabled(appConfig.isEnablePullDownRefresh(dirPath));
            }
        }

        String sourceDir = appConfig.getMiniAppSourcePath(getContext());
        String baseUrl = FileUtil.toUriString(sourceDir) + File.separator;
        HeraTrace.d(pageTag(), "BaseURL: " + baseUrl);
        String content = FileUtil.readContent(new File(sourceDir, path));
        getCurrentWebView().loadDataWithBaseURL(baseUrl, content, "text/html", "UTF-8", null);
        if (REDIRECT_TO.equals(openType)) {
            getCurrentWebView().clearHistory();
        }
    }

    /**
     * 获取当前的SwipeRefreshLayout，即当前显示的WebView所在的布局
     *
     * @return
     */
    private SwipeRefreshLayout getSwipeRefreshLayout() {
        WebView webView = getCurrentWebView();
        if (webView != null) {
            return (SwipeRefreshLayout) webView.getParent();
        }
        return null;
    }

    /**
     * 设置导航栏标题
     *
     * @param title 标题名
     */
    public void setNavigationBarTitle(String title) {
        HeraTrace.d(pageTag(), String.format("setNavigationBarTitle view@%s", getViewId()));
        getNavigationBar().setText(title);
    }

    /**
     * 设置导航栏颜色
     *
     * @param frontColor      前景颜色值，包括按钮、标题、状态栏的颜色，仅支持 #ffffff 和 #000000
     * @param backgroundColor 背景颜色值
     */
    public void setNavigationBarColor(int frontColor, int backgroundColor) {
        getNavigationBar().setTextColor(frontColor);
        getNavigationBar().setBGColor(backgroundColor);
    }

    /**
     * 显示导航条加载动画
     */
    public void showNavigationBarLoading() {
        getNavigationBar().showLoading();
    }

    /**
     * 隐藏导航条加载动画
     */
    public void hideNavigationBarLoading() {
        getNavigationBar().hideLoading();
    }

    /**
     * 显示弹窗
     *
     * @param isLoading 是否是loading弹窗
     * @param params    参数
     */
    public void showToast(boolean isLoading, String params) {
        getToastView().show(isLoading, params);
    }

    /**
     * 隐藏弹窗
     */
    public void hideToast() {
        getToastView().hide();
    }

    /**
     * 开始下拉刷新，触发下拉刷新动画
     */
    public void startPullDownRefresh() {
        SwipeRefreshLayout refreshLayout = getSwipeRefreshLayout();
        if (refreshLayout != null && refreshLayout.isEnabled() && !refreshLayout.isRefreshing()) {
            refreshLayout.setRefreshing(true);
        }
    }

    /**
     * 停止下拉刷新
     */
    public void stopPullDownRefresh() {
        SwipeRefreshLayout refreshLayout = getSwipeRefreshLayout();
        if (refreshLayout != null && refreshLayout.isRefreshing()) {
            refreshLayout.setRefreshing(false);
        }
    }

    /**
     * 获取视图id
     *
     * @return 当前显示视图的id
     */
    public abstract int getViewId();

    /**
     * 获取导航栏
     *
     * @return NavigationBar
     */
    protected abstract NavigationBar getNavigationBar();

    /**
     * 获取当前的WebView
     *
     * @return 当前的WebView
     */
    protected abstract WebView getCurrentWebView();

    /**
     * 获取弹窗视图
     *
     * @return ToastView
     */
    protected abstract ToastView getToastView();

    /**
     * 页面TAG，记录日志用
     *
     * @return 页面TAG
     */
    protected abstract String pageTag();

}
