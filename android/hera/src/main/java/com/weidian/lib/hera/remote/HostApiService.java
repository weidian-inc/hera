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

import android.app.Service;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import androidx.annotation.Nullable;
import android.util.Log;

import com.weidian.lib.hera.main.HeraService;
import com.weidian.lib.hera.trace.HeraTrace;

import org.json.JSONObject;

/**
 * 宿主api服务
 */
public class HostApiService extends Service {
    private static final String TAG = "HostApiService";

    //接受请求的Messenger
    private Messenger mReceiver;
    //接收请求并处理
    private Handler mHandler = new Handler(Looper.getMainLooper()) {
        @Override
        public void handleMessage(Message msg) {
            //收到Hera请求,解析出对应参数
            Bundle bundle = msg.getData();
            if (bundle == null) {
                return;
            }
            String event = bundle.getString("event");
            String param = bundle.getString("param");
            String callbackId = bundle.getString("callbackId");
            HeraTrace.d(TAG, String.format("received the request, event:%s,param:%s,callbackId:%s",
                    event, param, callbackId));

            IHostApiDispatcher dispatcher = HeraService.config().hostApiDispatcher();
            if (dispatcher != null) {
                dispatcher.dispatch(event, param, new ApiCallback(msg.replyTo, callbackId));
            } else {
                Log.w(TAG, "The Host App should provide the Api processing logic");
                new ApiCallback(msg.replyTo, callbackId).onResult(IHostApiCallback.UNDEFINE, null);
            }
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        HeraTrace.d(TAG, "service onCreate");
        mReceiver = new Messenger(mHandler);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return super.onStartCommand(intent, flags, startId);
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        HeraTrace.d(TAG, "service onBind");
        return mReceiver.getBinder();
    }

    @Override
    public void onDestroy() {
        HeraTrace.d(TAG, "service onDestroy");
        if (mHandler != null) {
            mHandler.removeCallbacksAndMessages(null);
        }
        super.onDestroy();
    }


    private class ApiCallback implements IHostApiCallback {

        private Messenger mSender;
        private String mCallbackId;

        ApiCallback(Messenger sender, String callbackId) {
            mSender = sender;
            mCallbackId = callbackId;
        }

        @Override
        public void onResult(int status, JSONObject result) {
            Bundle bundle = new Bundle();
            bundle.putString("callbackId", mCallbackId);
            bundle.putString("result", result != null ? result.toString() : "");
            Message message = Message.obtain();
            message.what = status;
            message.setData(bundle);
            if (mSender != null) {
                try {
                    mSender.send(message);
                } catch (RemoteException e) {
                    HeraTrace.e(TAG, "send result to Hera exception, " + e.getMessage());
                }
            } else {
                HeraTrace.e(TAG, "send result to Hera failed, Messenger is null!");
            }
        }
    }

}
