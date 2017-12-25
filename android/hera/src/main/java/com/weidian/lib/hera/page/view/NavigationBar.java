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
import android.content.ContextWrapper;
import android.content.res.TypedArray;
import android.graphics.PorterDuff;
import android.graphics.drawable.Drawable;
import android.support.annotation.Nullable;
import android.support.v7.content.res.AppCompatResources;
import android.support.v7.widget.Toolbar;
import android.util.AttributeSet;
import android.view.Gravity;
import android.view.View;
import android.widget.ProgressBar;

import com.weidian.lib.hera.R;
import com.weidian.lib.hera.utils.DensityUtil;

/**
 * 自定义导航栏
 */
public class NavigationBar extends Toolbar {

    private ProgressBar mProgress;

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
        Drawable drawable = AppCompatResources.getDrawable(context, R.drawable.hera_ic_arrow_back);
        if (drawable != null) {
            drawable = drawable.mutate();
        }
        setNavigationIcon(drawable);
        setNavigationOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                onBack(v.getContext());
            }
        });

        mProgress = new ProgressBar(context);
        mProgress.setIndeterminateDrawable(
                getResources().getDrawable(R.drawable.hera_anim_navigation_loading));
        int size = DensityUtil.dip2px(context, 20);
        LayoutParams params = new LayoutParams(size, size);
        params.gravity = Gravity.END;
        params.rightMargin = size;
        addView(mProgress, params);
        hideLoading();
    }

    public void onBack(Context context) {
        if (context instanceof Activity) {
            ((Activity) context).onBackPressed();
        } else if (context instanceof ContextWrapper) {
            onBack(((ContextWrapper) context).getBaseContext());
        }
    }

    @Override
    public void setTitleTextColor(int color) {
        super.setTitleTextColor(color);
        Drawable drawable = getNavigationIcon();
        if (drawable != null) {
            drawable.setColorFilter(color, PorterDuff.Mode.SRC_IN);
        }
    }

    /**
     * 获取最大显示高度
     *
     * @return 最大高度限制
     */
    public int getMaximumHeight() {
        TypedArray typedArray = getContext().getTheme().obtainStyledAttributes(
                new int[]{android.R.attr.actionBarSize});
        int height = typedArray.getDimensionPixelSize(0, 0);
        if (height <= 0) {
            height = LayoutParams.WRAP_CONTENT;
        }
        return height;
    }

    /**
     * 禁用导航栏返回按钮
     *
     * @param disable 是否禁用
     */
    public void disableNavigationBack(boolean disable) {
        if (disable) {
            setNavigationIcon(null);
            setNavigationOnClickListener(null);
        }
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
