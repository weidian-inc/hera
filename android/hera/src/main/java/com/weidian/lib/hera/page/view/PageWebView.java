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
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.ViewConfiguration;
import android.view.ViewParent;

import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.weidian.lib.hera.web.HeraWebView;

public class PageWebView extends HeraWebView {
    private boolean isSwiped=false;
    private float mLastTouchX;
    private final float mTouchSlop;

    private OnHorizontalSwipeListener mSwipeListener;

    public PageWebView(Context context) {
        this(context,null);
    }

    public PageWebView(Context context, AttributeSet attrs) {
        this(context, attrs,0);

    }

    public PageWebView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        final ViewConfiguration configuration = ViewConfiguration
                .get(getContext());
        mTouchSlop = configuration.getScaledTouchSlop();
    }

    public int getViewId() {
        return hashCode();
    }

    @Override
    public String tag() {
        return "PageWebView";
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        switch (event.getAction()){
            case MotionEvent.ACTION_DOWN:
                isSwiped=false;
                if (event.getRawX()>50||mSwipeListener==null){
                    isSwiped=false;
                }else {
                    ViewParent parent = getParent();
                    if (parent != null&& parent instanceof SwipeRefreshLayout) {
                        parent.requestDisallowInterceptTouchEvent(true);
                        ((SwipeRefreshLayout)parent).setEnabled(false);
                    }
                    isSwiped=true;
                    mLastTouchX = event.getRawX();
                    return true;
                }
                break;

            case MotionEvent.ACTION_MOVE:
                if (isSwiped) {
                    float dx = event.getRawX() - mLastTouchX;
                    if (Math.abs(dx)>mTouchSlop){
                        mSwipeListener.onHorizontalSwipeMove(dx);
                        mLastTouchX = event.getRawX();
                        return true;
                    }
                }
                break;
            case MotionEvent.ACTION_CANCEL:
            case MotionEvent.ACTION_UP:
                if (isSwiped){
                    mSwipeListener.onSwipeTapUp(event.getRawX());
                    return true;
                }

                ViewParent parent = getParent();
                if (parent != null&& parent instanceof SwipeRefreshLayout) {
                    parent.requestDisallowInterceptTouchEvent(false);
                    ((SwipeRefreshLayout)parent).setEnabled(true);
                }
                break;

        }

        return super.onTouchEvent(event);
    }

    public void setSwipeListener(OnHorizontalSwipeListener swipeListener) {
        this.mSwipeListener = swipeListener;
    }

    public interface OnHorizontalSwipeListener{
        void onHorizontalSwipeMove(float dx);
        void onSwipeTapUp(float x);
    }
}
