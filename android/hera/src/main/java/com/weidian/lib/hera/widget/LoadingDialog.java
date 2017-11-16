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

import android.app.AlertDialog;
import android.content.Context;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.TextView;

import com.weidian.lib.hera.R;
import com.weidian.lib.hera.trace.HeraTrace;

public class LoadingDialog extends AlertDialog {

    private static final String TAG = "LoadingDialog";

    private TextView mTextView;

    public LoadingDialog(Context context) {
        super(context, R.style.TransparentDialog);
        setCancelable(true);
        setCanceledOnTouchOutside(false);
    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.hera_loading_dialog);
        mTextView = (TextView) findViewById(R.id.loading_message);
    }

    public void show(String message) {
        show();

        if (TextUtils.isEmpty(message)) {
            mTextView.setText("");
            mTextView.setVisibility(View.GONE);
        } else {
            mTextView.setText(message);
            mTextView.setVisibility(View.VISIBLE);
        }
    }

    @Override
    public void show() {
        try {
            super.show();
        } catch (Exception e) {
            HeraTrace.e(TAG, e.getMessage());
        }
    }

    @Override
    public boolean isShowing() {
        try {
            return super.isShowing();
        } catch (Exception e) {
            HeraTrace.e(TAG, e.getMessage());
        }

        return false;
    }

}
