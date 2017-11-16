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


package com.weidian.lib.hera.api;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;

import com.weidian.lib.hera.interfaces.IApiCallback;
import com.weidian.lib.hera.interfaces.LifecycleListener;
import com.weidian.lib.hera.trace.HeraTrace;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * 模块基类
 */
public abstract class AbsModule implements LifecycleListener {

    protected static final String TAG = "JsApi";
    protected static final int RESULT_OK = 0;
    protected static final int RESULT_FAIL = 1;
    protected static final int RESULT_CANCEL = 2;

    protected static final Handler HANDLER = new Handler(Looper.getMainLooper());

    private Context mContext;

    public AbsModule(Context context) {
        mContext = context;
    }

    public Context getContext() {
        return mContext;
    }

    @Override
    public void onCreate() {
    }

    @Override
    public void onDestroy() {
    }

    /**
     * api调用
     *
     * @param event    api名称
     * @param params   参数
     * @param callback 回调函数
     */
    public abstract void invoke(String event, String params, IApiCallback callback);

    /**
     * 打包结果数据
     *
     * @param event  事件名称
     * @param status api调用的结果状态
     * @param data   api调用的结果数据
     * @return 最终的结果数据
     */
    protected String packageResultData(String event, int status, JSONObject data) {
        if (data == null) {
            data = new JSONObject();
        }

        String errMsg;
        switch (status) {
            case RESULT_OK:
                errMsg = String.format("%s:ok", event);
                break;
            case RESULT_FAIL:
                errMsg = String.format("%s:fail", event);
                break;
            case RESULT_CANCEL:
                errMsg = String.format("%s:cancel", event);
                break;
            default:
                errMsg = String.format("%s:ok", event);
                break;
        }

        try {
            data.put("errMsg", errMsg);
        } catch (JSONException e) {
            HeraTrace.e("AbsModule", "result put errMsg exception!");
        }
        return data.toString();
    }
}
