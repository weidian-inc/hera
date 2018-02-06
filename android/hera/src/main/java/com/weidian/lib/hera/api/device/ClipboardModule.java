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

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;

import com.weidian.lib.hera.api.BaseApi;
import com.weidian.lib.hera.interfaces.ICallback;
import com.weidian.lib.hera.trace.HeraTrace;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * 系统剪贴板api
 */
public class ClipboardModule extends BaseApi {

    public ClipboardModule(Context context) {
        super(context);
    }

    @Override
    public String[] apis() {
        return new String[]{"setClipboardData", "getClipboardData"};
    }

    @Override
    public void invoke(String event, JSONObject param, ICallback callback) {
        ClipboardManager cm = (ClipboardManager) getContext()
                .getSystemService(Context.CLIPBOARD_SERVICE);
        if (cm == null) {
            callback.onFail();
            return;
        }
        if ("setClipboardData".equals(event)) {
            setClipboardData(cm, param.optString("data"), callback);
        } else if ("getClipboardData".equals(event)) {
            getClipboardData(cm, callback);
        }
    }

    private void setClipboardData(ClipboardManager cm, String data, ICallback callback) {
        if (data == null) {
            data = "";
        }
        cm.setPrimaryClip(ClipData.newPlainText(null, data));
        callback.onSuccess(null);
    }

    private void getClipboardData(ClipboardManager cm, ICallback callback) {
        CharSequence data = "";
        ClipData clipData = cm.getPrimaryClip();
        if (clipData != null && clipData.getItemCount() > 0) {
            data = clipData.getItemAt(0).coerceToText(getContext());
        }

        JSONObject result = new JSONObject();
        try {
            result.put("data", data);
            callback.onSuccess(result);
        } catch (JSONException e) {
            HeraTrace.e(TAG, "getClipboardData assemble result exception!");
            callback.onFail();
        }
    }
}
