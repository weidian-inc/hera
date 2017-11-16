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

import android.app.Activity;
import android.content.Context;
import android.graphics.PorterDuff;
import android.graphics.drawable.Drawable;
import android.support.annotation.Nullable;
import android.util.AttributeSet;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.weidian.lib.hera.R;

/**
 * 自定义导航栏
 */
public class NavigationBar extends LinearLayout {

    private View mNavigationBar;
    private ImageView mClose;
    private TextView mTitle;
    private View mProgress;

    public NavigationBar(Context context) {
        super(context);
        init(context);
    }

    public NavigationBar(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public NavigationBar(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        inflate(context, R.layout.hera_navigation_bar, this);
        mNavigationBar = findViewById(R.id.navigation_bar);
        mClose = (ImageView) findViewById(R.id.close);
        mTitle = (TextView) findViewById(R.id.title);
        mProgress = findViewById(R.id.progress);
        mClose.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                Context ctx = v.getContext();
                if (ctx instanceof Activity) {
                    ((Activity) ctx).onBackPressed();
                }
            }
        });


    }

    /**
     * 设置导航栏文字
     *
     * @param text 导航栏文字
     */
    public void setText(String text) {
        mTitle.setText(text);
    }

    /**
     * 设置导航栏文字颜色
     *
     * @param color 文字颜色
     */
    public void setTextColor(int color) {
        mTitle.setTextColor(color);
        Drawable drawable = mClose.getDrawable();
        if (drawable != null) {
            drawable.setColorFilter(color, PorterDuff.Mode.SRC_IN);
        }
    }

    /**
     * 设置导航栏背景颜色
     *
     * @param color 导航栏背景颜色
     */
    public void setBGColor(int color) {
        mNavigationBar.setBackgroundColor(color);
    }

    /**
     * 显示加载动画
     */
    public void showLoading() {
        mProgress.setVisibility(VISIBLE);
    }

    /**
     * 隐藏加载动画
     */
    public void hideLoading() {
        mProgress.setVisibility(GONE);
    }

}
