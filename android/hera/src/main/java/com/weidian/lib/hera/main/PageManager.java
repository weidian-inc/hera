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

import android.animation.Animator;
import android.animation.AnimatorSet;
import android.animation.LayoutTransition;
import android.animation.ObjectAnimator;
import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.text.TextUtils;
import android.util.DisplayMetrics;
import android.widget.FrameLayout;

import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.interfaces.OnEventListener;
import com.weidian.lib.hera.page.Page;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.ColorUtil;
import com.weidian.lib.hera.utils.JsonUtil;

/**
 * {@link Page}管理类
 */
public class PageManager {
    private static final String TAG = "PageManager";

    private static final int MAX_COUNT = 5;

    private Context mContext;
    private AppConfig mAppConfig;
    private FrameLayout mContainer;

    public PageManager(Context context, AppConfig appConfig) {
        mContext = context;
        mAppConfig = appConfig;
        mContainer = new FrameLayout(context);

        DisplayMetrics dm = mContext.getResources().getDisplayMetrics();
        LayoutTransition transition = new LayoutTransition();
        // View 页面转场动画
        transition.setAnimator(LayoutTransition.APPEARING, getAppearingAnimation(dm.widthPixels));
        transition.setAnimator(LayoutTransition.DISAPPEARING, getDisappearingAnimation(dm.widthPixels));
        // 动画开始延迟
        transition.setStartDelay(LayoutTransition.APPEARING, 0);
        transition.setStartDelay(LayoutTransition.DISAPPEARING, 0);
        transition.setStartDelay(LayoutTransition.CHANGE_APPEARING, 0);
        transition.setStartDelay(LayoutTransition.CHANGE_DISAPPEARING, 0);
        // 动画执行时间
        transition.setDuration(LayoutTransition.APPEARING, 300);
        transition.setDuration(LayoutTransition.DISAPPEARING, 300);
        transition.setDuration(LayoutTransition.CHANGE_APPEARING, 300);
        transition.setDuration(LayoutTransition.CHANGE_DISAPPEARING, 300);
        mContainer.setLayoutTransition(transition);
    }

    private Animator getAppearingAnimation(int start) {
        AnimatorSet mSet = new AnimatorSet();
        mSet.playTogether(ObjectAnimator.ofFloat(null, "Alpha", 0.0f, 1.0f),
                ObjectAnimator.ofFloat(null, "translationX", start, 0));
        return mSet;
    }

    private Animator getDisappearingAnimation(int end) {
        AnimatorSet mSet = new AnimatorSet();
        mSet.playTogether(ObjectAnimator.ofFloat(null, "Alpha", 1.0f, 0.0f),
                ObjectAnimator.ofFloat(null, "translationX", 0, end));
        return mSet;
    }

    private void enableAnimation() {
        LayoutTransition transition = mContainer.getLayoutTransition();
        if (transition != null) {
            transition.enableTransitionType(LayoutTransition.APPEARING);
            transition.enableTransitionType(LayoutTransition.DISAPPEARING);
            transition.enableTransitionType(LayoutTransition.CHANGE_APPEARING);
            transition.enableTransitionType(LayoutTransition.CHANGE_DISAPPEARING);
            transition.enableTransitionType(LayoutTransition.CHANGING);
        }
    }

    private void disableAnimation() {
        LayoutTransition transition = mContainer.getLayoutTransition();
        if (transition != null) {
            transition.disableTransitionType(LayoutTransition.APPEARING);
            transition.disableTransitionType(LayoutTransition.DISAPPEARING);
            transition.disableTransitionType(LayoutTransition.CHANGE_APPEARING);
            transition.disableTransitionType(LayoutTransition.CHANGE_DISAPPEARING);
            transition.disableTransitionType(LayoutTransition.CHANGING);
        }
    }

    /**
     * 获取页面的容器
     *
     * @return 页面容器
     */
    public FrameLayout getContainer() {
        return mContainer;
    }

    /**
     * 获取顶部页面（即当前显示页面）的id
     *
     * @return 当前显示页面的id
     */
    public int getTopPageId() {
        Page topPage = getTopPage();
        return topPage != null ? topPage.getViewId() : 0;
    }

    /**
     * 启动主页面（第一个页面）
     *
     * @param url      页面路径
     * @param listener 页面触发的事件监听
     */
    public boolean launchHomePage(String url, OnEventListener listener) {
        if (TextUtils.isEmpty(url)) {
            HeraTrace.d(TAG, "launchHomePage failed, url is null");
            return false;
        }
        mContainer.removeAllViews();
        Page page = createAndAddPage(url, listener);
        if (page != null) {
            page.onLaunchHome(url);
            return true;
        }
        return false;
    }

    /**
     * 返回页面
     */
    public boolean backPage() {
        return navigateBackPage(1);
    }

    /**
     * 订阅事件处理器
     *
     * @param event   事件名称
     * @param params  参数
     * @param viewIds 需要订阅的视图id
     */
    public void subscribeHandler(String event, String params, int[] viewIds) {
        if (viewIds == null || viewIds.length == 0) {
            HeraTrace.d(TAG, "page subscribeHandler failed, viewIds is empty");
            return;
        }

        int count = getPageCount();
        for (int i = 0; i < count; i++) {
            Page page = getPageAt(i);
            page.subscribeHandler(event, params, viewIds);
        }
    }

    /**
     * 处理页面事件
     *
     * @param event    事件名称
     * @param params   参数
     * @param listener 事件监听
     * @return true：处理成功，否则亦然
     */
    public boolean handlePageEvent(String event, String params, OnEventListener listener) {
        if ("navigateTo".equals(event)) {
            return navigateToPage(JsonUtil.getStringValue(params, "url", ""), listener);
        } else if ("redirectTo".equals(event)) {
            return redirectToPage(JsonUtil.getStringValue(params, "url", ""));
        } else if ("switchTab".equals(event)) {
            return switchTabPage(JsonUtil.getStringValue(params, "url", ""), listener);
        } else if ("reLaunch".equals(event)) {
            return reLaunchPage(JsonUtil.getStringValue(params, "url", ""), listener);
        } else if ("navigateBack".equals(event)) {
            return navigateBackPage(JsonUtil.getIntValue(params, "delta", 0));
        } else if ("setNavigationBarTitle".equals(event)) {
            return setNavigationBarTitle(JsonUtil.getStringValue(params, "title", ""));
        } else if ("setNavigationBarColor".equals(event)) {
            return setNavigationBarColor(JsonUtil.getStringValue(params, "frontColor", "#000000"),
                    JsonUtil.getStringValue(params, "backgroundColor", "#ffffff"));
        } else if ("showNavigationBarLoading".equals(event)) {
            return showNavigationBarLoading();
        } else if ("hideNavigationBarLoading".equals(event)) {
            return hideNavigationBarLoading();
        } else if ("showToast".equals(event)) {
            return showToast(false, params);
        } else if ("showLoading".equals(event)) {
            return showToast(true, params);
        } else if ("hideToast".equals(event) || "hideLoading".equals(event)) {
            return hideToast();
        } else if ("startPullDownRefresh".equals(event)) {
            return startPullDownRefresh();
        } else if ("stopPullDownRefresh".equals(event)) {
            return stopPullDownRefresh();
        }
        return false;
    }

    /**
     * 获取当前页面数
     *
     * @return 当前页面数
     */
    private int getPageCount() {
        return mContainer.getChildCount();
    }

    /**
     * 获取顶部的页面，即当前显示的页面
     *
     * @return 当前显示的页面
     */
    private Page getTopPage() {
        int count = mContainer.getChildCount();
        if (count <= 0) {
            HeraTrace.d(TAG, "container have no pages");
            return null;
        }
        return (Page) mContainer.getChildAt(count - 1);
    }

    /**
     * 获取指定索引的页面
     *
     * @param index 索引值
     * @return 索引位置的页面
     */
    private Page getPageAt(int index) {
        return (Page) mContainer.getChildAt(index);
    }

    /**
     * 自顶部向下移除delta个页面，delta取值范围[1, {@link #getPageCount()}-1]，否则不做移除
     *
     * @param delta 移除的页面数
     */
    private boolean removePages(int delta) {
        int pageCount = getPageCount();
        if (delta <= 0 || delta >= pageCount) {
            HeraTrace.d(TAG, String.format("removePages failed, delta must be in [1, %s]", pageCount - 1));
            return false;
        }

        if (pageCount <= 1) {
            disableAnimation();
        } /*else {
            enableAnimation();
        }*/

        for (int i = pageCount - delta; i < pageCount; i++) {
            mContainer.removeViewAt(i);
        }
        return true;
    }

    /**
     * 创建并添加一个页面
     *
     * @param url      页面路径
     * @param listener 页面触发的事件监听
     * @return 新创建的页面
     */
    private Page createAndAddPage(String url, OnEventListener listener) {
        if (mAppConfig.isTabPage(url)) {
            disableAnimation();
            mContainer.removeAllViews();
        } else {
            int pageCount = getPageCount();
            if (pageCount >= MAX_COUNT) {
                HeraTrace.d(TAG, String.format("create page failed, current page count:%s, most count:%s",
                        pageCount, MAX_COUNT));
                return null;
            }

            if (pageCount == 0) {
                disableAnimation();
            } else {
                enableAnimation();
            }
        }

        Page page = new Page(mContext, url, mAppConfig,getPageCount()==0);
        page.setEventListener(listener);
        mContainer.addView(page, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        return page;
    }

    /**
     * 导航到页面
     *
     * @param url      页面url
     * @param listener 页面触发的事件监听
     * @return true：成功，否则亦然
     */
    private boolean navigateToPage(String url, OnEventListener listener) {
        if (TextUtils.isEmpty(url)) {
            HeraTrace.d(TAG, "navigateToPage failed, url is null");
            return false;
        }
        if (mAppConfig.isTabPage(url)) {
            HeraTrace.d(TAG, "navigateToPage failed, can not navigateTo Tab Page!");
            return false;
        }

        Page page = createAndAddPage(url, listener);
        if (page == null) {
            HeraTrace.d(TAG, String.format("navigateToPage failed, no more than %s pages", MAX_COUNT));
            return false;
        }

        page.onNavigateTo(url);
        return true;
    }

    /**
     * 重定向页面url
     *
     * @param url 页面url
     * @return true：成功，否则亦然
     */
    private boolean redirectToPage(String url) {
        if (TextUtils.isEmpty(url)) {
            HeraTrace.d(TAG, "redirectToPage failed, url is null");
            return false;
        }
        if (mAppConfig.isTabPage(url)) {
            HeraTrace.d(TAG, "redirectToPage failed, can not redirectTo Tab Page!");
            return false;
        }

        Page page = getTopPage();
        if (page == null) {
            HeraTrace.d(TAG, "redirectToPage failed, no pages available");
            return false;
        }
        page.onRedirectTo(url);
        return true;
    }

    /**
     * 打开Tab Bar页面并关闭所有其他非Tab Bar页面
     *
     * @param url      页面url
     * @param listener 页面触发的事件监听
     * @return true：成功，否则亦然
     */
    private boolean switchTabPage(String url, OnEventListener listener) {
        if (TextUtils.isEmpty(url)) {
            HeraTrace.d(TAG, "switchTabPage failed, url is null");
            return false;
        }
        if (!mAppConfig.isTabPage(url)) {
            HeraTrace.d(TAG, "switchTabPage failed, can not switchTab to Single Page!");
            return false;
        }

        Page page = createAndAddPage(url, listener);
        if (page == null) {
            return false;
        }
        page.switchTab(url);
        return true;
    }

    /**
     * 关闭所有页面，打开到应用内的某个页面
     *
     * @param url      页面url
     * @param listener 页面触发的事件监听
     * @return true：成功，否则亦然
     */
    private boolean reLaunchPage(String url, OnEventListener listener) {
        return launchHomePage(url, listener);
    }

    /**
     * 导航返回页面
     *
     * @param delta 返回的页面层数
     * @return true：成功，否则亦然
     */
    private boolean navigateBackPage(int delta) {
        if (!removePages(delta)) {
            HeraTrace.d(TAG, String.format("navigateBackPage failed, delta must be in [1, %s]",
                    getPageCount() - 1));
            return false;
        }

        Page page = getTopPage();
        if (page != null) {
            page.onNavigateBack();
        }
        return true;
    }

    /**
     * 设置当前页面的导航栏标题
     *
     * @param title 标题名
     * @return true：设置成功，否则亦然
     */
    private boolean setNavigationBarTitle(String title) {
        if (TextUtils.isEmpty(title)) {
            HeraTrace.d(TAG, "setNavigationBarTitle failed, title is null");
            return false;
        }

        Page page = getTopPage();
        if (page == null) {
            HeraTrace.d(TAG, "setNavigationBarTitle failed, no pages available");
            return false;
        }
        page.setNavigationBarTitle(title);
        return true;
    }

    /**
     * 设置导航栏颜色
     *
     * @param frontColor      前景颜色值，包括按钮、标题、状态栏的颜色
     * @param backgroundColor 背景颜色值
     * @return true：设置成功，否则亦然
     */
    private boolean setNavigationBarColor(String frontColor, String backgroundColor) {
        Page page = getTopPage();
        if (page == null) {
            HeraTrace.d(TAG, "setNavigationBarColor failed, no pages available");
            return false;
        }
        page.setNavigationBarColor(ColorUtil.parseColor(frontColor),
                ColorUtil.parseColor(backgroundColor));
        return true;
    }

    /**
     * 显示导航条加载动画
     *
     * @return true：成功，否则亦然
     */
    private boolean showNavigationBarLoading() {
        Page page = getTopPage();
        if (page == null) {
            HeraTrace.d(TAG, "showNavigationBarLoading failed, no pages available");
            return false;
        }
        page.showNavigationBarLoading();
        return true;
    }

    /**
     * 隐藏导航条加载动画
     *
     * @return true：成功，否则亦然
     */
    private boolean hideNavigationBarLoading() {
        Page page = getTopPage();
        if (page == null) {
            HeraTrace.d(TAG, "hideNavigationBarLoading failed, no pages available");
            return false;
        }
        page.hideNavigationBarLoading();
        return true;
    }

    /**
     * 显示弹窗，toast或loading
     *
     * @param isLoading 是否是loading弹窗
     * @param params    参数
     * @return true：成功，否则亦然
     */
    private boolean showToast(boolean isLoading, String params) {
        Page page = getTopPage();
        if (page == null) {
            HeraTrace.d(TAG, "showToast failed, no pages available");
            return false;
        }
        page.showToast(isLoading, params);
        return true;
    }

    /**
     * 隐藏弹窗
     *
     * @return true：成功，否则亦然
     */
    private boolean hideToast() {
        Page page = getTopPage();
        if (page == null) {
            HeraTrace.d(TAG, "hideToast failed, no pages available");
            return false;
        }
        page.hideToast();
        return true;
    }

    /**
     * 开始下拉刷新
     *
     * @return true：成功，否则亦然
     */
    private boolean startPullDownRefresh() {
        Page page = getTopPage();
        if (page == null) {
            HeraTrace.d(TAG, "startPullDownRefresh failed, no pages available");
            return false;
        }
        page.startPullDownRefresh();
        return true;
    }

    /**
     * 停止下拉刷新
     *
     * @return true：成功，否则亦然
     */
    private boolean stopPullDownRefresh() {
        Page page = getTopPage();
        if (page == null) {
            HeraTrace.d(TAG, "stopPullDownRefresh failed, no pages available");
            return false;
        }
        page.stopPullDownRefresh();
        return true;
    }

}
