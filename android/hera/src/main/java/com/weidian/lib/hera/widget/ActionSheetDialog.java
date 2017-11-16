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
import android.util.TypedValue;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.weidian.lib.hera.R;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.ColorUtil;

import java.util.List;

/**
 * ActionSheet对话框，由api调用
 */
public class ActionSheetDialog extends Dialog {

    private static final String TAG = "ActionSheetDialog";

    private LinearLayout mContentView;
    private int mLRPadding;
    private int mTBPadding;
    private int mTextSize;

    private OnItemClickListener mListener;

    public ActionSheetDialog(Context context) {
        this(context, R.style.ModalDialog);
    }

    public ActionSheetDialog(Context context, int theme) {
        super(context, theme);
        initDialog(context);
    }

    private void initDialog(Context context) {
        mContentView = (LinearLayout) View.inflate(context, R.layout.hera_action_sheet_dialog, null);
        setContentView(mContentView);
        mLRPadding = context.getResources().getDimensionPixelSize(R.dimen.action_sheet_item_lr_padding);
        mTBPadding = context.getResources().getDimensionPixelSize(R.dimen.action_sheet_item_tb_padding);
        mTextSize = context.getResources().getDimensionPixelSize(R.dimen.action_sheet_item_text_size);
    }

    public void setOnItemClickListener(OnItemClickListener listener) {
        mListener = listener;
    }

    public void setItemList(List<String> list, int color) {
        mContentView.removeAllViews();
        if (list == null || list.isEmpty()) {
            return;
        }

        int size = list.size();
        for (int i = 0; i < size; i++) {
            TextView textView = new TextView(getContext());
            textView.setPadding(mLRPadding, mTBPadding, mLRPadding, mTBPadding);
            textView.setTextColor(color);
            textView.setTextSize(TypedValue.COMPLEX_UNIT_PX, mTextSize);
            textView.setText(list.get(i));
            textView.setTag(i);
            textView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (mListener != null) {
                        mListener.onItemClick((Integer) v.getTag(), v);
                    }
                    dismiss();
                }
            });
            mContentView.addView(textView, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
            if (i != size - 1) {
                View view = new View(getContext());
                view.setBackgroundColor(ColorUtil.parseColor("#e5e5e5"));
                mContentView.addView(view, new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT, 1));
            }
        }
    }

    @Override
    public void show() {
        try {
            super.show();
        } catch (Exception e) {
            HeraTrace.e(TAG, "show dialog exception");
        }
    }

    public interface OnItemClickListener {
        void onItemClick(int index, View view);
    }
}
