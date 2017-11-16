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


package com.weidian.lib.hera.remote;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.text.TextUtils;

import com.weidian.lib.hera.interfaces.IApiCallback;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.JsonUtil;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

import static com.weidian.lib.hera.utils.Constants.REQUEST_CODE_PAGE_RESULT;

/**
 * 宿主api调用管理器
 */
public class HostApiManager implements ServiceConnection {

    private final static String TAG = "HostApiManager";

    private Activity mActivity;
    private Messenger mSender;//发送请求的Messenger
    private Messenger mReceiver;//接收请求结果的Messenger
    private Map<String, IApiCallback> mApiCallbacks;//缓存的结果回调接口
    //处理请求的结果
    private Handler mHandler = new Handler(Looper.getMainLooper()) {
        @Override
        public void handleMessage(Message msg) {
            HeraTrace.d(TAG, "received host api result");
            Bundle data = msg.getData();
            if (data == null) {
                HeraTrace.d(TAG, "host api invoke result msg.getData() is null");
                return;
            }

            String callbackId = data.getString("callbackId");
            if (TextUtils.isEmpty(callbackId)) {
                HeraTrace.d(TAG, "host api invoke result callbackId is null");
                return;
            }

            IApiCallback apiCallback = mApiCallbacks.remove(callbackId);
            if (apiCallback == null) {
                HeraTrace.d(TAG, "host api invoke result callback is null");
                return;
            }

            handleResult(msg.what, data.getString("result"), apiCallback);
        }
    };

    public HostApiManager(Activity activity) {
        HeraTrace.d(TAG, "HostApiManager create");
        mActivity = activity;
        mApiCallbacks = new HashMap<>();
        mReceiver = new Messenger(mHandler);
        Context context = mActivity.getApplicationContext();
        Intent intent = new Intent(context, HostApiService.class);
        context.startService(intent);
        context.bindService(intent, this, Context.BIND_IMPORTANT);
    }

    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
        HeraTrace.d(TAG, "host api service connected");
        mSender = new Messenger(service);
    }

    @Override
    public void onServiceDisconnected(ComponentName name) {
        HeraTrace.d(TAG, "onServiceDisconnected:" + name);
        releaseResource();
    }

    /**
     * 请求宿主的API
     *
     * @param event    事件名称，即调用api名称
     * @param params   调用api的参数
     * @param callback 返回给JS端的回调
     */
    public void invoke(String event, String params, IApiCallback callback) {
        if (mSender == null) {
            HeraTrace.w(TAG, String.format("invoke sender is null, event:%s, params:%s",
                    event, params));
            handleResult(IHostApiCallback.FAILED, null, callback);
            return;
        }
        Bundle data = new Bundle(3);
        data.putString("event", event);
        data.putString("param", params);
        String callbackId = callback != null ? callback.getCallbackId() : "";
        data.putString("callbackId", callbackId);

        HeraTrace.d(TAG, String.format("invoke host api, event:%s, param:%s, callbackId:%s",
                event, params, callbackId));

        if (!TextUtils.isEmpty(callbackId)) {
            // 缓存callback对象
            mApiCallbacks.put(callbackId, callback);
        }

        Message msg = Message.obtain();
        msg.setData(data);
        msg.replyTo = mReceiver;
        try {
            mSender.send(msg);
        } catch (RemoteException e) {
            HeraTrace.e(TAG, String.format("invoke send exception, event:%s, params:%s",
                    event, params));
            handleResult(IHostApiCallback.FAILED, null, callback);
        }
    }

    /**
     * Activity结果回调
     *
     * @param requestCode 请求码
     * @param resultCode  结果码
     * @param data        结果数据
     * @return true：被处理了，false：未被处理
     */
    public boolean onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != REQUEST_CODE_PAGE_RESULT) {
            return false;
        }

        IApiCallback callback = mApiCallbacks.remove(String.valueOf(requestCode));
        if (callback == null) {
            return false;
        }

        String resultStatus;
        JSONObject resultJson;
        if (resultCode == Activity.RESULT_OK) {
            resultJson = JsonUtil.parseToJson(data != null ? data.getExtras() : null);
            resultStatus = String.format("%s:ok", callback.getEvent());
        } else {
            resultJson = new JSONObject();
            resultStatus = String.format("%s:cancel", callback.getEvent());
        }
        try {
            resultJson.put("errMsg", resultStatus);
        } catch (Exception e) {
            HeraTrace.e(TAG, "result put errMsg exception!");
        }
        callback.onResult(resultJson.toString());

        return true;
    }

    public void destroy() {
        HeraTrace.d(TAG, "unbind host service");
        releaseResource();
        mActivity.getApplicationContext().unbindService(this);
        mActivity = null;
    }

    /**
     * 处理结果
     *
     * @param status   结果调用状态
     * @param result   结果数据
     * @param callback api的回调接口
     */
    private void handleResult(int status, String result, IApiCallback callback) {
        JSONObject resultJson = null;
        if (!TextUtils.isEmpty(result)) {
            try {
                resultJson = new JSONObject(result);
            } catch (JSONException e) {
                HeraTrace.e(TAG, e.getMessage());
            }
        }
        if (resultJson == null) {
            resultJson = new JSONObject();
        }

        //PENDING状态的openPageForResult调用特殊处理
        if (status == IHostApiCallback.PENDING
                && "openPageForResult".equals(callback.getEvent())) {
            String packageName = resultJson.optString("package");
            String className = resultJson.optString("name");
            String params = resultJson.optString("params");
            if (!TextUtils.isEmpty(packageName) && !TextUtils.isEmpty(className)) {
                Intent intent = new Intent();
                intent.setComponent(new ComponentName(packageName, className));
                intent.putExtras(JsonUtil.parseToBundle(params));
                if (intent.resolveActivity(mActivity.getPackageManager()) != null) {
                    mApiCallbacks.put(String.valueOf(REQUEST_CODE_PAGE_RESULT), callback);
                    mActivity.startActivityForResult(intent, REQUEST_CODE_PAGE_RESULT);
                    return;
                }
            }
            status = IHostApiCallback.FAILED;
        }

        String resultStatus;
        switch (status) {
            case IHostApiCallback.SUCCEED:
                resultStatus = String.format("%s:ok", callback.getEvent());
                break;
            case IHostApiCallback.FAILED:
                resultStatus = String.format("%s:fail", callback.getEvent());
                break;
            case IHostApiCallback.UNDEFINE:
                resultStatus = String.format("%s:fail", callback.getEvent());
                break;
            default:
                resultStatus = String.format("%s:fail", callback.getEvent());
                break;
        }

        try {
            resultJson.put("errMsg", resultStatus);
        } catch (JSONException e) {
            HeraTrace.e(TAG, "result put errMsg exception!");
        }

        callback.onResult(resultJson.toString());
    }

    private void releaseResource() {
        if (mHandler != null) {
            mHandler.removeCallbacksAndMessages(null);
        }
        if (mApiCallbacks != null) {
            mApiCallbacks.clear();
        }
    }

}
