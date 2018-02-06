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

import android.animation.LayoutTransition;
import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.net.Uri;
import android.support.v4.widget.SwipeRefreshLayout;
import android.text.TextUtils;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.inputmethod.InputMethodManager;

import com.tencent.smtt.sdk.WebView;

import android.widget.FrameLayout;
import android.widget.LinearLayout;

import com.weidian.lib.hera.R;
import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.interfaces.IBridge;
import com.weidian.lib.hera.interfaces.OnEventListener;
import com.weidian.lib.hera.model.TabItemInfo;
import com.weidian.lib.hera.page.view.NavigationBar;
import com.weidian.lib.hera.page.view.PageWebView;
import com.weidian.lib.hera.page.view.TabBar;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.ColorUtil;
import com.weidian.lib.hera.utils.FileUtil;
import com.weidian.lib.hera.utils.UIUtil;
import com.weidian.lib.hera.web.HeraWebViewClient;
import com.weidian.lib.hera.widget.ToastView;
import com.weidian.lib.hera.widget.X5SwipeRefreshLayout;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.List;
import java.util.Set;

/**
 * Page层，即小程序view展示层
 */
public class Page extends LinearLayout implements IBridge,
        TabBar.OnSwitchTabListener, PageWebView.OnHorizontalSwipeListener {

    public static final String TAG = "Page";

    public static final String APP_LAUNCH = "appLaunch";
    public static final String NAVIGATE_TO = "navigateTo";
    public static final String NAVIGATE_BACK = "navigateBack";
    public static final String REDIRECT_TO = "redirectTo";
    public static final String SWITCH_TAB = "switchTab";

    private FrameLayout mWebLayout;
    private NavigationBar mNavigationBar;
    private PageWebView mCurrentWebView;
    private TabBar mTabBar;
    private ToastView mToastView;


    private AppConfig mAppConfig;
    private OnEventListener mEventListener;
    private String mPageOpenType;
    private String mPagePath;

    private boolean isHomePage;

    public Page(Context context, String pagePath, AppConfig appConfig, boolean isHomePage) {
        super(context);
        this.mAppConfig = appConfig;
        this.isHomePage = isHomePage;
        init(context, pagePath);
    }

    private void init(Context context, String url) {
        inflate(context, R.layout.hera_page, this);
        LinearLayout topLayout = (LinearLayout) findViewById(R.id.top_layout);
        LinearLayout bottomLayout = (LinearLayout) findViewById(R.id.bottom_layout);
        mWebLayout = (FrameLayout) findViewById(R.id.web_layout);
        mToastView = (ToastView) findViewById(R.id.toast_view);
        mNavigationBar = new NavigationBar(context);

        //添加导航栏
        topLayout.addView(mNavigationBar, new LayoutParams(LayoutParams.MATCH_PARENT,
                mNavigationBar.getMaximumHeight()));

        if (mAppConfig.isTabPage(url)) {
            initTabPage(context, topLayout, bottomLayout);
        } else {
            initSinglePage(context);
        }
    }

    private void initTabPage(Context context, LinearLayout topLayout, LinearLayout bottomLayout) {
        //添加tab栏
        mTabBar = new TabBar(context, mAppConfig);
        mTabBar.setOnSwitchTabListener(this);
        if (mAppConfig.isTopTabBar()) {
            bottomLayout.setVisibility(GONE);
            topLayout.addView(mTabBar, new LayoutParams(LayoutParams.MATCH_PARENT,
                    LayoutParams.WRAP_CONTENT));
        } else {
            bottomLayout.setVisibility(VISIBLE);
            bottomLayout.addView(mTabBar, new LayoutParams(LayoutParams.MATCH_PARENT,
                    LayoutParams.WRAP_CONTENT));
        }

        //添加web页面
        List<TabItemInfo> list = mAppConfig.getTabItemList();
        int len = (list == null ? 0 : list.size());
        for (int i = 0; i < len; i++) {
            TabItemInfo info = list.get(i);
            String url = info != null ? info.pagePath : null;
            mWebLayout.addView(createSwipeRefreshWebView(context, url),
                    new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT,
                            FrameLayout.LayoutParams.MATCH_PARENT));
        }
    }

    private void initSinglePage(Context context) {
        mWebLayout = (FrameLayout) findViewById(R.id.web_layout);
        mWebLayout.addView(createSwipeRefreshWebView(context, null),
                new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.MATCH_PARENT));
    }

    /**
     * 创建封装下拉刷新功能的WebView包装视图
     *
     * @param context 上下文
     * @param url     页面路径
     * @return 封装下拉刷新功能的WebView包装视图
     */
    private SwipeRefreshLayout createSwipeRefreshWebView(Context context, String url) {
        boolean enablePullRefresh = mAppConfig.isEnablePullDownRefresh(url);
        SwipeRefreshLayout refreshLayout = new X5SwipeRefreshLayout(context);
        refreshLayout.setEnabled(enablePullRefresh);
        refreshLayout.setColorSchemeColors(Color.GRAY);
        refreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                HeraTrace.d(TAG, "start onPullDownRefresh");
                onPageEvent("onPullDownRefresh", "{}");
            }
        });
        PageWebView webView = new PageWebView(context);
        webView.setTag(url);
        webView.setWebViewClient(new HeraWebViewClient(mAppConfig));
        webView.setJsHandler(this);
        webView.setRefreshEnable(enablePullRefresh);

        if (!isHomePage) {
            webView.setSwipeListener(this);
        }
        refreshLayout.addView(webView, 0, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        mCurrentWebView = webView;
        return refreshLayout;
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        HeraTrace.d(TAG, String.format("view@%s onAttachedToWindow()", getViewId()));
        //设置标题栏背景色（通过应用配置信息获取）
        String textColor = mAppConfig.getNavigationBarTextColor();
        String bgColor = mAppConfig.getNavigationBarBackgroundColor();
        mNavigationBar.setTitleTextColor(ColorUtil.parseColor(textColor));
        int naviBgColor = ColorUtil.parseColor(bgColor);
        mNavigationBar.setBackgroundColor(naviBgColor);

        Context context = getContext();
        if (context != null && context instanceof Activity) {
            UIUtil.setColor((Activity) context, naviBgColor);
        }

    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        HeraTrace.d(TAG, String.format("view@%s onDetachedFromWindow()", getViewId()));
        InputMethodManager imm = (InputMethodManager) getContext().getSystemService(
                Context.INPUT_METHOD_SERVICE);
        if (imm != null) {
            imm.hideSoftInputFromWindow(getWindowToken(), InputMethodManager.HIDE_NOT_ALWAYS);
        }

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
    public void publish(String event, String params, String viewIds) {
        HeraTrace.d(TAG, String.format("view@%s publish(), event=%s, params=%s, viewIds=%s",
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
    public void invoke(String event, String params, String callbackId) {
        HeraTrace.d(TAG, String.format("view@%s invoke(), event=%s, params=%s, callbackIds=%s",
                getViewId(), event, params, callbackId));
    }

    @Override
    public void callback(String callbackId, String result) {
    }

    @Override
    public void switchTab(String url) {
        switchTab(url, SWITCH_TAB);
    }

    /**
     * 页面dom内容加载完成
     */
    private void onDomContentLoaded() {
        if (mEventListener != null) {
            String eventName = "onAppRoute";
            String eventParams = "{}";
            try {
                JSONObject json = new JSONObject();
                json.put("webviewId", getViewId());
                json.put("openType", mPageOpenType);
                if (!TextUtils.isEmpty(mPagePath)) {
                    Uri uri = Uri.parse(mPagePath);
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
                HeraTrace.e(TAG, "onDomContentLoaded assembly params exception!");
            }
            //通知Service层的订阅处理器处理
            mEventListener.notifyServiceSubscribeHandler(eventName, eventParams, getViewId());
        }
    }

    /**
     * 页面事件
     *
     * @param event  事件名称
     * @param params 参数
     */
    private void onPageEvent(String event, String params) {
        if (mEventListener != null) {
            //转由Service层的订阅处理器处理
            mEventListener.notifyServiceSubscribeHandler(event, params, getViewId());
        }
    }

    /**
     * 切换Tab
     *
     * @param url      tab页路径
     * @param openType 打开类型
     */
    private void switchTab(String url, String openType) {
        Uri uri = Uri.parse(url);
        String pagePath = uri.getPath();
        mNavigationBar.setTitle(mAppConfig.getPageTitle(pagePath));
        if (mTabBar != null) {
            mTabBar.switchTab(pagePath);
        }
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
                    loadUrl(url, openType);
                } else {
                    mPagePath = url;
                    mPageOpenType = SWITCH_TAB;
                    onDomContentLoaded();
                }
            } else {
                refreshLayout.setVisibility(GONE);
            }
        }
    }

    /**
     * 设置事件监听
     *
     * @param listener 监听接口的实例类
     */
    public void setEventListener(OnEventListener listener) {
        this.mEventListener = listener;
    }

    /**
     * Page层的订阅处理器处理事件
     *
     * @param event   事件名称
     * @param params  参数
     * @param viewIds 视图id数组
     */
    public void subscribeHandler(String event, String params, int[] viewIds) {
        HeraTrace.d(TAG, String.format("view@%s subscribeHandler('%s',%s)", getViewId(), event, params));
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

    /**
     * 启动主页面
     *
     * @param url 页面url
     */
    public void onLaunchHome(String url) {
        HeraTrace.d(TAG, String.format("view@%s onLaunchHome(%s)", getViewId(), url));
        if (mAppConfig.isTabPage(url)) {
            switchTab(url, APP_LAUNCH);
        } else {
            loadUrl(url, APP_LAUNCH);
        }
    }

    /**
     * 导航到此页面
     *
     * @param url 页面url
     */
    public void onNavigateTo(String url) {
        HeraTrace.d(TAG, String.format("onNavigateTo view@%s, url:%s", getViewId(), url));
        loadUrl(url, NAVIGATE_TO);
    }

    /**
     * 重定向此页面的url
     *
     * @param url 页面url
     */
    public void onRedirectTo(String url) {
        HeraTrace.d(TAG, String.format("onRedirectTo view@%s, url:%s", getViewId(), url));
        if (mTabBar != null) {
            mTabBar.setVisibility(View.GONE);
        }

        loadUrl(url, REDIRECT_TO);
    }

    /**
     * 导航回到此页面
     */
    public void onNavigateBack() {
        HeraTrace.d(TAG, String.format("onNavigateBack view@%s", getViewId()));
        mPageOpenType = NAVIGATE_BACK;
        onDomContentLoaded();
    }

    /**
     * 加载页面url
     *
     * @param url      页面url
     * @param openType 打开页面的类型
     */
    public void loadUrl(String url, String openType) {
        HeraTrace.d(TAG, String.format("loadUrl(%s, %s) view@%s", url, openType, getViewId()));
        if (TextUtils.isEmpty(url) || mCurrentWebView == null) {
            return;
        }

        mPagePath = url;
        mPageOpenType = openType;

        post(new Runnable() {
            @Override
            public void run() {
                loadContent(mPagePath, mPageOpenType);
            }
        });
    }

    private void loadContent(String url, String openType) {
        Uri uri = Uri.parse(url);
        String path = uri.getPath();//屏蔽参数干扰
        HeraTrace.d(TAG, "Page file path :" + path);

        //更新导航栏返回按钮和标题
        mNavigationBar.disableNavigationBack(mAppConfig.isDisableNavigationBack(url));
        mNavigationBar.setTitle(mAppConfig.getPageTitle(url));

        //设置下拉刷新启用状态
        boolean enablePullRefresh = mAppConfig.isEnablePullDownRefresh(url);
        if (mCurrentWebView != null) {
            mCurrentWebView.setRefreshEnable(enablePullRefresh);
        }
        SwipeRefreshLayout refreshLayout = getSwipeRefreshLayout();
        if (refreshLayout != null) {
            refreshLayout.setEnabled(enablePullRefresh);
        }

        //加载内容
        String sourceDir = mAppConfig.getMiniAppSourcePath(getContext());
        String baseUrl = FileUtil.toUriString(sourceDir) + File.separator;
        HeraTrace.d(TAG, "BaseURL: " + baseUrl);
        String content = FileUtil.readContent(new File(sourceDir, path));
        mCurrentWebView.loadDataWithBaseURL(baseUrl, content, "text/html", "UTF-8", null);
        if (REDIRECT_TO.equals(openType)) {
            mCurrentWebView.clearHistory();
        }
    }

    /**
     * 获取当前的SwipeRefreshLayout，即当前显示的WebView所在的布局
     *
     * @return
     */
    private SwipeRefreshLayout getSwipeRefreshLayout() {
        WebView webView = mCurrentWebView;
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
        HeraTrace.d(TAG, String.format("setNavigationBarTitle view@%s", getViewId()));
        mNavigationBar.setTitle(title);
    }

    /**
     * 设置导航栏颜色
     *
     * @param frontColor      前景颜色值，包括按钮、标题、状态栏的颜色，仅支持 #ffffff 和 #000000
     * @param backgroundColor 背景颜色值
     */
    public void setNavigationBarColor(int frontColor, int backgroundColor) {
        mNavigationBar.setTitleTextColor(frontColor);
        mNavigationBar.setBackgroundColor(backgroundColor);
    }

    /**
     * 显示导航条加载动画
     */
    public void showNavigationBarLoading() {
        mNavigationBar.showLoading();
    }

    /**
     * 隐藏导航条加载动画
     */
    public void hideNavigationBarLoading() {
        mNavigationBar.hideLoading();
    }

    /**
     * 显示弹窗
     *
     * @param isLoading 是否是loading弹窗
     * @param params    参数
     */
    public void showToast(boolean isLoading, String params) {
        mToastView.show(isLoading, params);
    }

    /**
     * 隐藏弹窗
     */
    public void hideToast() {
        mToastView.hide();
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

    public int getViewId() {
        return mCurrentWebView != null ? mCurrentWebView.getViewId() : 0;
    }

    // --------------------------  OnHorizontalSwipeListener  ---------------------------------

    @Override
    public void onHorizontalSwipeMove(float dx) {
        this.scrollBy(-(int) dx, 0);
    }

    @Override
    public void onSwipeTapUp(float x) {
        if (x < getWidth() / 2) {// 回到原位
            this.scrollTo(0, 0);
        } else {// 返回上一层级
            disableParentAnim();
            mNavigationBar.onBack(getContext());
        }
    }

    private void disableParentAnim() {
        ViewParent parent = this.getParent();
        if (parent != null && parent instanceof FrameLayout) {
            LayoutTransition transition = ((FrameLayout) parent).getLayoutTransition();
            if (transition != null) {
                transition.disableTransitionType(LayoutTransition.APPEARING);
                transition.disableTransitionType(LayoutTransition.DISAPPEARING);
                transition.disableTransitionType(LayoutTransition.CHANGE_APPEARING);
                transition.disableTransitionType(LayoutTransition.CHANGE_DISAPPEARING);
                transition.disableTransitionType(LayoutTransition.CHANGING);
            }
        }
    }
}
