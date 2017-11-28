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

import android.animation.ValueAnimator;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorFilter;
import android.graphics.Paint;
import android.graphics.PixelFormat;
import android.graphics.Rect;
import android.graphics.drawable.Animatable;
import android.graphics.drawable.Drawable;
import android.support.annotation.IntRange;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * 加载指示动画
 */
public class IndicatorDrawable extends Drawable implements Animatable {
    public static final int ALPHA = 100;
    private int[] mAlphas = new int[]{ALPHA,
            ALPHA,
            ALPHA,};
    private Paint mPaint;
    private Rect mDrawBounds = new Rect();

    private ArrayList<ValueAnimator> mAnimators;
    private Map<ValueAnimator, ValueAnimator.AnimatorUpdateListener> mUpdateListeners = new HashMap<>();

    public IndicatorDrawable() {
        mPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        mPaint.setColor(Color.GRAY);
        mPaint.setStyle(Paint.Style.FILL);
    }

    @Override
    public void start() {
        if (mAnimators == null) {
            mAnimators = getAnimators();
        }
        if (isStarted()) {
            return;
        }
        startAnimators();
        invalidateSelf();
    }

    @Override
    public void stop() {
        stopAnimators();
    }

    @Override
    public boolean isRunning() {
        return isStarted();
    }

    @Override
    public void draw(@NonNull Canvas canvas) {
        int width = getWidth();
        int height = getHeight();
        float space = 30;
        float radius = (Math.min(width, height) - space * 2) / 5;
        float x = width / 2 - radius * 2 - space;
        float y = height / 2;
        for (int i = 0; i < 3; i++) {
            canvas.save();
            float offsetX = x + (radius * 2) * i + space * i;
            canvas.translate(offsetX, y);
            mPaint.setAlpha(mAlphas[i]);
            canvas.drawCircle(0, 0, radius, mPaint);
            canvas.restore();
        }
    }

    @Override
    public void setAlpha(@IntRange(from = 0, to = 255) int i) {
        mPaint.setAlpha(i);
    }

    @Override
    public void setColorFilter(@Nullable ColorFilter colorFilter) {
        mPaint.setColorFilter(colorFilter);
    }

    @Override
    public int getOpacity() {
        return PixelFormat.OPAQUE;
    }

    @Override
    protected void onBoundsChange(Rect bounds) {
        super.onBoundsChange(bounds);
        mDrawBounds = new Rect(bounds);
    }

    public int getWidth() {
        return mDrawBounds.width();
    }

    public int getHeight() {
        return mDrawBounds.height();
    }

    private ArrayList<ValueAnimator> getAnimators() {
        ArrayList<ValueAnimator> animators = new ArrayList<>();
        int[] delays = new int[]{300, 600, 900};
        for (int i = 0; i < 3; i++) {
            final int index = i;

            ValueAnimator alphaAnim = ValueAnimator.ofInt(100, 255, 100);
            alphaAnim.setDuration(1000);

            alphaAnim.setRepeatCount(-1);
            alphaAnim.setStartDelay(delays[i]);
            mUpdateListeners.put(alphaAnim, new ValueAnimator.AnimatorUpdateListener() {
                @Override
                public void onAnimationUpdate(ValueAnimator animation) {
                    mAlphas[index] = (int) animation.getAnimatedValue();
                    invalidateSelf();
                }
            });

            animators.add(alphaAnim);
        }
        return animators;
    }

    public void setColor(int color) {
        mPaint.setColor(color);
    }

    private void startAnimators() {
        for (int i = 0; i < mAnimators.size(); i++) {
            ValueAnimator animator = mAnimators.get(i);

            //when the animator restart , add the updateListener again because they
            // was removed by animator stop .
            ValueAnimator.AnimatorUpdateListener updateListener = mUpdateListeners.get(animator);
            if (updateListener != null) {
                animator.addUpdateListener(updateListener);
            }

            animator.start();
        }
    }

    private void stopAnimators() {
        if (mAnimators != null) {
            for (ValueAnimator animator : mAnimators) {
                if (animator != null && animator.isStarted()) {
                    animator.removeAllUpdateListeners();
                    //animator.end();
                    animator.cancel();
                }
            }
        }
    }

    private boolean isStarted() {
        if (mAnimators != null) {
            return mAnimators.get(0).isRunning();
        }
        return false;
    }
}