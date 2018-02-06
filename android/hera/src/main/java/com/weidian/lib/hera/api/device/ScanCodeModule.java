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

import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;

import com.weidian.lib.hera.api.BaseApi;
import com.weidian.lib.hera.interfaces.ICallback;
import com.weidian.lib.hera.scancode.ui.activity.ScanCaptureActivity;
import com.weidian.lib.hera.trace.HeraTrace;

import org.json.JSONException;
import org.json.JSONObject;

import static com.weidian.lib.hera.utils.Constants.REQUEST_CODE_SCAN_CODE;

/**
 * 扫码api
 */
public class ScanCodeModule extends BaseApi {

    public ScanCodeModule(Activity context) {
        super(context);
    }

    @Override
    public String[] apis() {
        return new String[]{"scanCode"};
    }

    @Override
    public void invoke(String event, JSONObject param, ICallback callback) {
        boolean onlyFromCamera = param.optBoolean("onlyFromCamera", true);
        if (onlyFromCamera) {
            Intent intent = new Intent();
            intent.setComponent(new ComponentName(getContext(), ScanCaptureActivity.class));
            callback.startActivityForResult(intent, REQUEST_CODE_SCAN_CODE);
            return;
        }
        callback.onFail();
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data, ICallback callback) {
        if (requestCode != REQUEST_CODE_SCAN_CODE) {
            return;
        }

        if (resultCode != Activity.RESULT_OK) {
            callback.onCancel();
            return;
        }

        if (data == null) {
            callback.onFail();
            return;
        }

        String result = data.getStringExtra("result");
        String scanType = data.getStringExtra("scanType");
        JSONObject resultJson = new JSONObject();
        try {
            resultJson.put("result", result);
            resultJson.put("scanType", scanType);
            callback.onSuccess(resultJson);
        } catch (JSONException e) {
            HeraTrace.e(TAG, "scanCode assemble result exception!");
            callback.onFail();
        }
    }
}
