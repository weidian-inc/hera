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


package com.weidian.lib.hera.config;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.text.TextUtils;

import com.weidian.lib.hera.model.TabItemInfo;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.StorageUtil;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * 小程序的配置信息
 */
public class AppConfig {

    private static final String TAG = "AppConfig";
    private JSONObject mConfig;
    private WindowConfig mWindowConfig;
    private TabBarConfig mTabBarConfig;

    private String mUserId;
    private String mAppId;

    /**
     * 获取宿主版本号
     *
     * @param context 上下文
     * @return 宿主程序版本号
     */
    public static String getHostVersion(Context context) {
        String version;
        PackageManager packageManager = context.getPackageManager();
        try {
            PackageInfo packageInfo = packageManager.getPackageInfo(context.getPackageName(), 0);
            version = packageInfo.versionName;
        } catch (Exception e) {
            HeraTrace.d(TAG, e.getMessage());
            version = "1.0.0";
        }

        return version;
    }

    public AppConfig(String appId, String userId) {
        mAppId = appId;
        mUserId = userId;
        if (TextUtils.isEmpty(appId) || TextUtils.isEmpty(userId)) {
            throw new IllegalArgumentException("appId and userId must be not null!");
        }
    }

    public String getUserId() {
        return this.mUserId;
    }

    public String getAppId() {
        return this.mAppId;
    }

    /**
     * 获取存放当前小程序源码的绝对路径
     *
     * @param context 上下文
     * @return 存放小程序源码的路径
     */
    public String getMiniAppSourcePath(Context context) {
        return StorageUtil.getMiniAppSourceDir(context, mAppId).getAbsolutePath() + File.separator;
    }

    /**
     * 获取当前小程序的文件存储目录的绝对路径
     *
     * @param context 上下文
     * @return 小程序资源存储的路径
     */
    public String getMiniAppStorePath(Context context) {
        return StorageUtil.getMiniAppStoreDir(context, mAppId).getAbsolutePath() + File.separator;
    }

    /**
     * 获取当前小程序的临时文件存储目录的绝对路径
     *
     * @param context 上下文
     * @return 小程序临时文件存储路径
     */
    public String getMiniAppTempPath(Context context) {
        return StorageUtil.getMiniAppTempDir(context, mAppId).getAbsolutePath() + File.separator;
    }

    /**
     * 初始化配置
     *
     * @param config 小程序的配置信息，json字符串
     */
    public void initConfig(String config) {
        try {
            mConfig = new JSONObject(config);
        } catch (JSONException e) {
            HeraTrace.e(TAG, String.format("config is not JSON format! config=%s", config));
        }

        if (mConfig == null) {
            HeraTrace.e(TAG, "config is not initialized!");
            return;
        }

        JSONObject windowJson = mConfig.optJSONObject("window");
        if (windowJson != null) {
            mWindowConfig = new WindowConfig();
            mWindowConfig.backgroundColor = windowJson.optString("backgroundColor");
            mWindowConfig.backgroundTextStyle = windowJson.optString("backgroundTextStyle");
            mWindowConfig.navigationBarBackgroundColor = windowJson.optString("navigationBarBackgroundColor");
            mWindowConfig.navigationBarTextStyle = windowJson.optString("navigationBarTextStyle");
            mWindowConfig.navigationBarTitleText = windowJson.optString("navigationBarTitleText");
            mWindowConfig.pages = windowJson.optJSONObject("pages");
        }

        JSONObject tabBarJson = mConfig.optJSONObject("tabBar");
        if (tabBarJson != null) {
            mTabBarConfig = new TabBarConfig();
            mTabBarConfig.color = tabBarJson.optString("color");
            mTabBarConfig.selectedColor = tabBarJson.optString("selectedColor");
            mTabBarConfig.backgroundColor = tabBarJson.optString("backgroundColor");
            mTabBarConfig.borderStyle = tabBarJson.optString("borderStyle");
            mTabBarConfig.position = tabBarJson.optString("position");
            mTabBarConfig.list = tabBarJson.optJSONArray("list");
        }
    }

    /**
     * 获取配置的根路径
     *
     * @return 根路径
     */
    public String getRootPath() {
        if (mConfig == null) {
            return "";
        }
        String root = mConfig.optString("root");
        return TextUtils.isEmpty(root) ? "" : root + ".html";
    }

    /**
     * 获取导航栏背景色(#000000)
     *
     * @return 导航栏背景色
     */
    public String getNavigationBarBackgroundColor() {
        if (mWindowConfig == null || TextUtils.isEmpty(mWindowConfig.navigationBarBackgroundColor)
                || !mWindowConfig.navigationBarBackgroundColor.startsWith("#")) {
            return "#F8F8F8";
        }
        return mWindowConfig.navigationBarBackgroundColor;
    }

    /**
     * 获取导航栏文字颜色
     *
     * @return 导航栏文字颜色
     */
    public String getNavigationBarTextColor() {
        if (mWindowConfig != null && "black".equals(mWindowConfig.navigationBarTextStyle)) {
            return "#404040";
        }
        return "#FFFFFF";
    }

    /**
     * 获取页面的标题
     *
     * @param url 页面路径
     * @return 页面标题
     */
    public String getPageTitle(String url) {
        if (TextUtils.isEmpty(url) || mWindowConfig == null) {
            return "";
        }

        if (mWindowConfig.pages == null) {
            return mWindowConfig.navigationBarTitleText;
        }

        JSONObject pageConfig = mWindowConfig.pages.optJSONObject(getPath(url));
        if (pageConfig == null) {
            return mWindowConfig.navigationBarTitleText;
        }

        return pageConfig.optString("navigationBarTitleText");
    }

    /**
     * 判断页面是否启用了下拉刷新
     *
     * @param url 页面路径
     * @return true：启用了下拉刷新，否则亦然
     */
    public boolean isEnablePullDownRefresh(String url) {
        if (TextUtils.isEmpty(url) || mWindowConfig == null || mWindowConfig.pages == null) {
            return false;
        }

        JSONObject pageConfig = mWindowConfig.pages.optJSONObject(getPath(url));
        return pageConfig != null && pageConfig.optBoolean("enablePullDownRefresh");
    }

    /**
     * 判断页面是否禁用了导航栏返回按钮
     *
     * @param url 页面路径
     * @return true：禁用了导航栏返回按钮，否则亦然
     */
    public boolean isDisableNavigationBack(String url) {
        if (TextUtils.isEmpty(url) || mWindowConfig == null || mWindowConfig.pages == null) {
            return false;
        }

        JSONObject pageConfig = mWindowConfig.pages.optJSONObject(getPath(url));
        return pageConfig != null && pageConfig.optBoolean("disableNavigationBack");
    }

    /**
     * 获取TabBar背景色
     *
     * @return TabBar背景色
     */
    public String getTabBarBackgroundColor() {
        if (mTabBarConfig == null || TextUtils.isEmpty(mTabBarConfig.backgroundColor)
                || !mTabBarConfig.backgroundColor.startsWith("#")) {
            return "#ffffff";
        }
        return mTabBarConfig.backgroundColor;
    }

    /**
     * 获取TabBar上边框的颜色
     *
     * @return TabBar上边框的颜色
     */
    public String getTabBarBorderColor() {
        if (mTabBarConfig != null && "white".equals(mTabBarConfig.borderStyle)) {
            return "#f5f5f5";
        }
        return "#e5e5e5";
    }

    /**
     * TabBar是否在顶部
     *
     * @return true：顶部
     */
    public boolean isTopTabBar() {
        if (mTabBarConfig != null && "top".equals(mTabBarConfig.position)) {
            return true;
        }
        return false;
    }

    /**
     * 获取Tab项列表
     *
     * @return Tab项列表
     */
    public List<TabItemInfo> getTabItemList() {
        if (mTabBarConfig == null || mTabBarConfig.list == null) {
            return null;
        }

        List<TabItemInfo> list = new ArrayList<>();
        int len = mTabBarConfig.list.length();
        for (int i = 0; i < len; i++) {
            JSONObject itemJson = mTabBarConfig.list.optJSONObject(i);
            if (itemJson == null || itemJson.length() == 0) {
                continue;
            }
            TabItemInfo info = new TabItemInfo();
            info.color = mTabBarConfig.color;
            info.selectedColor = mTabBarConfig.selectedColor;
            info.iconPath = itemJson.optString("iconPath");
            info.selectedIconPath = itemJson.optString("selectedIconPath");
            info.text = itemJson.optString("text");
            info.pagePath = itemJson.optString("pagePath");
            if (!TextUtils.isEmpty(info.pagePath)) {
                info.pagePath += ".html";
            }
            list.add(info);
        }
        return list;
    }

    /**
     * 检查被给的url是否属于Tab页面
     *
     * @param url 页面路径
     * @return true：是Tab页，否则亦然
     */
    public boolean isTabPage(String url) {
        if (TextUtils.isEmpty(url)) {
            return false;
        }
        if (mTabBarConfig == null || mTabBarConfig.list == null) {
            return false;
        }
        String pagePath = getPath(url);
        int len = mTabBarConfig.list.length();
        for (int i = 0; i < len; i++) {
            JSONObject itemJson = mTabBarConfig.list.optJSONObject(i);
            if (itemJson != null && pagePath.equals(itemJson.optString("pagePath"))) {
                return true;
            }
        }
        return false;
    }

    private String getPath(String url) {
        if (TextUtils.isEmpty(url)) {
            return "";
        }
        Uri uri = Uri.parse(url);
        String pagePath = uri.getPath();
        if (TextUtils.isEmpty(pagePath)) {
            return "";
        }
        int index = pagePath.lastIndexOf(".");
        if (index > 0) {
            pagePath = pagePath.substring(0, index);
        }
        return pagePath;
    }

    /**
     * 窗口配置
     */
    private static class WindowConfig {
        String backgroundColor; //窗口的背景色
        String backgroundTextStyle; //下拉背景字体、hera_anim_white_loading 图的样式，仅支持 dark/light
        String navigationBarBackgroundColor; //导航栏背景颜色，如"#000000"
        String navigationBarTextStyle; //导航栏标题颜色，仅支持 black/white
        String navigationBarTitleText; //导航栏标题文字内容
        JSONObject pages; //页面标题配置

    }

    /**
     * TabBar配置
     */
    private static class TabBarConfig {
        String color; //tab 上的文字默认颜色
        String selectedColor; //tab 上的文字选中时的颜色
        String backgroundColor; //tab 的背景色
        String borderStyle; //tabbar上边框的颜色， 仅支持 black/white
        String position; //可选值 bottom、top
        JSONArray list; //tab 的列表，详见 list 属性说明，最少2个、最多5个 tab
    }

}
