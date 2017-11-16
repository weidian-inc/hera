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


package com.weidian.lib.hera.api.device;

import android.content.ClipboardManager;
import android.content.Context;

import com.weidian.lib.hera.api.AbsModule;
import com.weidian.lib.hera.api.HeraApi;
import com.weidian.lib.hera.interfaces.IApiCallback;

import org.json.JSONObject;

/**
 * 系统剪贴板api
 */
@HeraApi(names = {"setClipboardData", "getClipboardData"})
public class ClipboardModule extends AbsModule {

    public ClipboardModule(Context context) {
        super(context);
    }

    @Override
    public void invoke(String event, String params, IApiCallback callback) {
        try {
            ClipboardManager cmb = (ClipboardManager) getContext().getSystemService(Context.CLIPBOARD_SERVICE);
            if ("setClipboardData".equals(event)) {
                JSONObject json = new JSONObject(params);
                cmb.setText(json.optString("data"));
                callback.onResult(packageResultData(event, RESULT_OK, null));
            } else if ("getClipboardData".equals(event)) {
                JSONObject data = new JSONObject();
                CharSequence text = cmb.getText();
                data.put("data", text.toString());
                callback.onResult(packageResultData(event, RESULT_OK, data));
            }
        } catch (Throwable t) {
            callback.onResult(packageResultData(event, RESULT_FAIL, null));
        }
    }
}
