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

import android.app.Dialog;
import android.content.Context;
import android.graphics.drawable.Drawable;
import android.text.TextUtils;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import com.weidian.lib.hera.R;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.ColorUtil;

/**
 * 自定义白色对话框，由api调用的模态对话框
 */
public class ModalDialog extends Dialog {

    private static final String TAG = "ModalDialog";

    private View mTitleView;
    private View mButtonView;
    private TextView mTitle;
    private TextView mMessage;
    private TextView mLeftBtn;
    private TextView mRightBtn;
    private ImageView mBtnDivideLine;

    private View.OnClickListener mLeftBtnClickListener;
    private View.OnClickListener mRightBtnClickListener;

    public ModalDialog(Context context) {
        this(context, R.style.ModalDialog);
    }

    public ModalDialog(Context context, int theme) {
        super(context, theme);
        initDialog(context);
    }

    protected ModalDialog(Context context, boolean cancelable, OnCancelListener cancelListener) {
        this(context, R.style.ModalDialog);
        setCancelable(cancelable);
        setOnCancelListener(cancelListener);
        initDialog(context);
    }

    private void initDialog(Context context) {
        View contentView = View.inflate(context, R.layout.hera_modal_dialog, null);
        mTitleView = contentView.findViewById(R.id.dlg_title_view);
        mButtonView = contentView.findViewById(R.id.dlg_btn_view);
        mTitle = (TextView) contentView.findViewById(R.id.dlg_title);
        mMessage = (TextView) contentView.findViewById(R.id.dlg_msg);
        mBtnDivideLine = (ImageView) contentView.findViewById(R.id.line_v);
        mLeftBtn = (TextView) contentView.findViewById(R.id.dlg_left_btn);
        mRightBtn = (TextView) contentView.findViewById(R.id.dlg_right_btn);
        mLeftBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mLeftBtnClickListener != null) {
                    mLeftBtnClickListener.onClick(v);
                }
                dismiss();
            }
        });
        mRightBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mRightBtnClickListener != null) {
                    mRightBtnClickListener.onClick(v);
                }
                dismiss();
            }
        });
        setContentView(contentView);
    }

    /**
     * 设置标题栏图标
     *
     * @param drawableId
     */
    public void setTitleIcon(int drawableId) {
        Drawable drawable = getContext().getResources().getDrawable(drawableId);
        setTitleIcon(drawable);
    }

    /**
     * 设置标题栏图标
     *
     * @param drawable
     */
    public void setTitleIcon(Drawable drawable) {
        if (drawable == null) {
            return;
        }
        drawable.setBounds(0, 0, drawable.getMinimumWidth(), drawable.getMinimumHeight());
        mTitle.setCompoundDrawables(drawable, null, null, null);
        mTitleView.setVisibility(View.VISIBLE);
    }

    /**
     * 设置对话框标题
     *
     * @param strId
     */
    public void setTitle(int strId) {
        setTitle(getContext().getString(strId));
    }

    /**
     * 设置对话框标题
     *
     * @param title
     */
    public void setTitle(String title) {
        if (TextUtils.isEmpty(title)) {
            mTitleView.setVisibility(View.GONE);
            return;
        }
        mTitle.setText(title);
        mTitleView.setVisibility(View.VISIBLE);
    }

    /**
     * 设置对话框内容
     *
     * @param strId
     */
    public void setMessage(int strId) {
        setMessage(getContext().getString(strId));
    }

    /**
     * 设置对话框内容
     *
     * @param msg
     */
    public void setMessage(String msg) {
        mMessage.setText(msg);
    }

    /**
     * 设置左侧按钮文字颜色
     *
     * @param color 颜色值
     */
    public void setLeftButtonTextColor(String color) {
        try {
            mLeftBtn.setTextColor(ColorUtil.parseColor(color));
        } catch (Exception e) {
            HeraTrace.e(TAG, String.format("setLeftButtonTextColor(%s) parse color error", color));
        }
    }

    /**
     * 设置右侧按钮文字颜色
     *
     * @param color 颜色值
     */
    public void setRightButtonTextColor(String color) {
        try {
            mRightBtn.setTextColor(ColorUtil.parseColor(color));
        } catch (Exception e) {
            HeraTrace.e(TAG, String.format("setRightButtonTextColor(%s) parse color error", color));
        }
    }

    /**
     * 设置左边按钮文字和点击监听
     *
     * @param strId
     * @param listener
     */
    public void setLeftButton(int strId, View.OnClickListener listener) {
        setLeftButton(getContext().getString(strId), listener);
    }

    /**
     * 设置左边按钮文字和点击监听
     *
     * @param text
     * @param listener
     */
    public void setLeftButton(String text, View.OnClickListener listener) {
        mButtonView.setVisibility(View.VISIBLE);
        if (mRightBtn.getVisibility() == View.VISIBLE) {
            mBtnDivideLine.setVisibility(View.VISIBLE);
        } else {
            mBtnDivideLine.setVisibility(View.GONE);
        }
        mLeftBtn.setText(text);
        mLeftBtn.setVisibility(View.VISIBLE);
        mLeftBtnClickListener = listener;
    }

    /**
     * 设置右边按钮文字和点击监听
     *
     * @param strId
     * @param listener
     */
    public void setRightButton(int strId, View.OnClickListener listener) {
        setRightButton(getContext().getString(strId), listener);
    }

    /**
     * 设置右边按钮文字和监听
     *
     * @param text
     * @param listener
     */
    public void setRightButton(String text, View.OnClickListener listener) {
        mButtonView.setVisibility(View.VISIBLE);
        if (mLeftBtn.getVisibility() == View.VISIBLE) {
            mBtnDivideLine.setVisibility(View.VISIBLE);
        } else {
            mBtnDivideLine.setVisibility(View.GONE);
        }
        mRightBtn.setText(text);
        mRightBtn.setVisibility(View.VISIBLE);
        mRightBtnClickListener = listener;
    }

    @Override
    public void show() {
        try {
            super.show();
        } catch (Exception e) {
            HeraTrace.e(TAG, "show dialog exception");
        }
    }
}
