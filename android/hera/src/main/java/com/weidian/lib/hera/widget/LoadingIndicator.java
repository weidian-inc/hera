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


package com.weidian.lib.hera.widget;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.content.Context;
import android.graphics.drawable.Drawable;
import androidx.annotation.Nullable;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;

import com.weidian.lib.hera.R;

/**
 * 加载指示视图
 */
public class LoadingIndicator extends FrameLayout {

    private View mView;
    private ImageView mTopIcon;
    private TextView mTitle;
    private IndicatorDrawable mDrawable;

    private boolean mIsShowing;

    public LoadingIndicator(Context context) {
        super(context);
        init(context);
    }

    public LoadingIndicator(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    private void init(Context context) {
        mView = LayoutInflater.from(context).inflate(R.layout.hera_loading_indicator, this);
        mTopIcon = (ImageView) findViewById(R.id.indicator_top_icon);
        mTitle = (TextView) findViewById(R.id.indicator_title);
        ImageView indicator = (ImageView) findViewById(R.id.indicator_image);

        mDrawable = new IndicatorDrawable();
        indicator.setImageDrawable(mDrawable);
    }

    /**
     * 设置加载指示器的顶部图标
     *
     * @param icon 加载指示器顶部图标
     */
    public void setTopIcon(Drawable icon) {
        mTopIcon.setImageDrawable(icon);
        mTopIcon.setVisibility(VISIBLE);
    }

    /**
     * 设置加载指示器的标题
     *
     * @param title 加载指示器标题
     */
    public void setTitle(String title) {
        mTitle.setText(title);
        mTitle.setVisibility(VISIBLE);
    }

    /**
     * 显示加载指示器
     */
    public void show() {
        if (mIsShowing) {
            return;
        }
        setVisibility(VISIBLE);
        mDrawable.start();
        mIsShowing = true;
    }

    /**
     * 隐藏加载指示器
     */
    public void hide() {
        if (!mIsShowing) {
            return;
        }
        AnimatorSet animatorSet = new AnimatorSet();
        animatorSet.playTogether(ObjectAnimator.ofFloat(mView, "alpha", 1, 0).setDuration(300),
                ObjectAnimator.ofFloat(mView, "translationY", 0, -getHeight()).setDuration(300));
        animatorSet.addListener(new AnimatorListenerAdapter() {
            @Override
            public void onAnimationCancel(Animator animation) {
                mIsShowing = false;
                setVisibility(GONE);
            }

            @Override
            public void onAnimationEnd(Animator animation) {
                mIsShowing = false;
                setVisibility(GONE);
            }

            @Override
            public void onAnimationStart(Animator animation) {
                mDrawable.stop();
            }
        });
        animatorSet.start();
    }
}

