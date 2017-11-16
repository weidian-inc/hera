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
import android.content.Intent;

import com.weidian.lib.hera.api.AbsModule;
import com.weidian.lib.hera.api.HeraApi;
import com.weidian.lib.hera.interfaces.IApiCallback;
import com.weidian.lib.hera.interfaces.OnActivityResultListener;
import com.weidian.lib.hera.scancode.ui.activity.ScanCaptureActivity;
import com.weidian.lib.hera.trace.HeraTrace;

import org.json.JSONException;
import org.json.JSONObject;

import static com.weidian.lib.hera.utils.Constants.REQUEST_CODE_SCAN_CODE;

/**
 * 扫码api
 */
@HeraApi(names = {"scanCode"})
public class ScanCodeModule extends AbsModule implements OnActivityResultListener {

    private Activity mActivity;
    private IApiCallback mApiCallback;

    public ScanCodeModule(Activity context) {
        super(context);
        mActivity = context;
    }

    @Override
    public void invoke(String event, String params, IApiCallback callback) {
        mApiCallback = callback;
        boolean onlyFromCamera = true;
        try {
            JSONObject jsonObject = new JSONObject(params);
            onlyFromCamera = jsonObject.optBoolean("onlyFromCamera", true);
        } catch (Exception e) {
            HeraTrace.w(TAG, "scanCode, parse json params exception!");
        }
        if (onlyFromCamera) {
            Intent intent = new Intent(mActivity, ScanCaptureActivity.class);
            mActivity.startActivityForResult(intent, REQUEST_CODE_SCAN_CODE);
        } else {
            callback.onResult(packageResultData(event, RESULT_FAIL, null));
        }
    }

    @Override
    public boolean isResultReceiver(int requestCode) {
        return requestCode == REQUEST_CODE_SCAN_CODE;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (mApiCallback == null || requestCode != REQUEST_CODE_SCAN_CODE) {
            return;
        }

        if (resultCode != Activity.RESULT_OK) {
            mApiCallback.onResult(packageResultData("scanCode", RESULT_CANCEL, null));
        } else if (data == null) {
            mApiCallback.onResult(packageResultData("scanCode", RESULT_FAIL, null));
        } else {
            String result = data.getStringExtra("result");
            String scanType = data.getStringExtra("scanType");
            JSONObject jsonObject = new JSONObject();
            try {
                jsonObject.put("result", result);
                jsonObject.put("scanType", scanType);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            mApiCallback.onResult(packageResultData("scanCode", RESULT_OK, jsonObject));
        }

    }
}
