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


package com.weidian.lib.hera.page.view;

import android.content.Context;
import android.text.TextUtils;
import android.util.DisplayMetrics;
import android.view.View;
import android.widget.LinearLayout;

import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.model.TabItemInfo;
import com.weidian.lib.hera.utils.ColorUtil;

import java.util.List;

/**
 * 自定义Tab栏视图
 */
public class TabBar extends LinearLayout {

    private LinearLayout mTabItemLayout;
    private OnSwitchTabListener mListener;

    public TabBar(Context context, AppConfig appConfig) {
        super(context);
        init(context, appConfig);
    }

    private void init(Context context, AppConfig appConfig) {
        setOrientation(VERTICAL);
        boolean isTop = appConfig.isTopTabBar();
        String borderColor = appConfig.getTabBarBorderColor();
        String backgroundColor = appConfig.getTabBarBackgroundColor();
        List<TabItemInfo> list = appConfig.getTabItemList();
        if (list == null || list.isEmpty()) {
            return;
        }

        setBackgroundColor(ColorUtil.parseColor(backgroundColor));

        //添加border
        View border = new View(context);
        border.setBackgroundColor(ColorUtil.parseColor(borderColor));
        addView(border, new LayoutParams(LayoutParams.MATCH_PARENT, 1));

        //添加item
        mTabItemLayout = new LinearLayout(context);
        mTabItemLayout.setOrientation(HORIZONTAL);
        DisplayMetrics dm = getResources().getDisplayMetrics();
        int itemWidth = dm.widthPixels / list.size();
        int lrPadding = (dm.widthPixels % list.size()) / 2;
        mTabItemLayout.setPadding(lrPadding, 0, lrPadding, 0);
        addView(mTabItemLayout, new LayoutParams(LayoutParams.MATCH_PARENT,
                LayoutParams.WRAP_CONTENT));

        for (int i = 0; i < list.size(); i++) {
            TabItemInfo info = list.get(i);
            TabItemView itemView = new TabItemView(context, appConfig);
            itemView.setInfo(info);
            itemView.setTop(isTop);
            itemView.setOnClickListener(new OnClickListener() {
                @Override
                public void onClick(View v) {
                    TabItemView view = (TabItemView) v;
                    String url = view.getPagePath();
                    if (mListener != null) {
                        mListener.switchTab(url);
                    }
                }
            });
            mTabItemLayout.addView(itemView, new LayoutParams(itemWidth, LayoutParams.MATCH_PARENT));
        }

        if (isTop) {
            //添加底部border
            View bottomBorder = new View(context);
            bottomBorder.setBackgroundColor(ColorUtil.parseColor(borderColor));
            addView(bottomBorder, new LayoutParams(LayoutParams.MATCH_PARENT, 1));
        }
    }

    /**
     * 切换Tab item
     *
     * @param url Tab item对应的页面路径
     */
    public void switchTab(String url) {
        int count = mTabItemLayout.getChildCount();
        for (int i = 0; i < count; i++) {
            TabItemView itemView = (TabItemView) mTabItemLayout.getChildAt(i);
            if (TextUtils.equals(url, itemView.getPagePath())) {
                itemView.setSelected(true);
            } else {
                itemView.setSelected(false);
            }
        }
    }

    public void setOnSwitchTabListener(OnSwitchTabListener listener) {
        mListener = listener;
    }

    /**
     * Tab切换监听
     */
    public interface OnSwitchTabListener {

        /**
         * 切换tab
         *
         * @param url tab item的页面路径
         */
        void switchTab(String url);

    }

}
