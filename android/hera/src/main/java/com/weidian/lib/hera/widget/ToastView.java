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

import android.content.Context;
import android.os.Handler;
import androidx.annotation.Nullable;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.bumptech.glide.Glide;
import com.weidian.lib.hera.R;
import com.weidian.lib.hera.trace.HeraTrace;

import org.json.JSONObject;

/**
 * 页面内的toast或loading视图，由api调用
 */
public class ToastView extends LinearLayout {

    private static final String TAG = "ToastView";

    private ImageView mImage;
    private ProgressBar mLoading;
    private TextView mText;
    private Handler mHandler;

    private Runnable mRunnable = new Runnable() {
        @Override
        public void run() {
            setVisibility(GONE);
        }
    };

    public ToastView(Context context) {
        super(context);
        init(context);
    }

    public ToastView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public ToastView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        setOrientation(VERTICAL);
        setGravity(Gravity.CENTER);
        setVisibility(GONE);
        inflate(context, R.layout.hera_toast_view, this);
        mImage = (ImageView) findViewById(R.id.toast_image);
        mLoading = (ProgressBar) findViewById(R.id.toast_loading);
        mText = (TextView) findViewById(R.id.toast_text);

        mHandler = new Handler();
    }

    private void setMask(boolean mask) {
        if (mask) {
            setOnTouchListener(new View.OnTouchListener() {
                @Override
                public boolean onTouch(View v, MotionEvent event) {
                    return true;
                }
            });
        } else {
            setOnTouchListener(null);
        }
    }

    private void setImage(String image) {
        if (TextUtils.isEmpty(image)) {
            mLoading.setVisibility(GONE);
            mImage.setVisibility(GONE);
        } else if ("success".equals(image)) {
            mLoading.setVisibility(GONE);
            mImage.setVisibility(VISIBLE);
            mImage.setImageResource(R.drawable.hera_success);
        } else if ("loading".equals(image)) {
            mLoading.setVisibility(VISIBLE);
            mImage.setVisibility(GONE);
        } else {
            mLoading.setVisibility(GONE);
            mImage.setVisibility(VISIBLE);
            Glide.with(getContext()).load(image).into(mImage);
        }
    }

    public void show(boolean isLoading, String params) {
        clearCallbacks();

        String title = null;
        String icon = null;
        String image = null;
        long duration = 1500;
        boolean mask = false;
        try {
            JSONObject json = new JSONObject(params);
            title = json.optString("title");
            icon = json.optString("icon");
            image = json.optString("image");
            duration = json.optLong("duration", 1500);
            mask = json.optBoolean("mask", false);
        } catch (Exception e) {
            HeraTrace.e(TAG, e.getMessage());
        }

        mText.setText(title);
        setMask(mask);
        if (isLoading) {
            setImage("hera_loading");
        } else {
            if (!TextUtils.isEmpty(image)) {
                setImage(image);
            } else {
                setImage(icon);
            }
            mHandler.postDelayed(mRunnable, duration);
        }

        setVisibility(VISIBLE);
    }

    public void hide() {
        setVisibility(GONE);
        clearCallbacks();
    }

    public void clearCallbacks() {
        if (mHandler != null) {
            mHandler.removeCallbacks(mRunnable);
        }
    }

    @Override
    public void onDetachedFromWindow() {
        clearCallbacks();
        super.onDetachedFromWindow();
    }
}
