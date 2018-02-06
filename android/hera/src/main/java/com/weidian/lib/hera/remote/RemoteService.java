//
// Copyright (c) 2018, weidian.com
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
import android.support.annotation.Nullable;
import android.util.Pair;

import com.weidian.lib.hera.api.ApisManager;
import com.weidian.lib.hera.interfaces.IApi;
import com.weidian.lib.hera.interfaces.ICallback;
import com.weidian.lib.hera.main.HeraService;
import com.weidian.lib.hera.model.Event;
import com.weidian.lib.hera.trace.HeraTrace;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

/**
 * 远程服务，运行在宿主App进程
 */
public class RemoteService extends Service {

    private static final String TAG = RemoteService.class.getSimpleName();

    public static final int INVOKE = 0x10;
    public static final int PENDING_RESULT = 0x11;

    private final Map<Event, Pair<IApi, ICallback>> CALLING_APIS = new HashMap<>();

    //接受请求的Messenger
    private Messenger mReceiver;
    //接收请求并处理
    private Handler mHandler = new Handler(Looper.getMainLooper()) {
        @Override
        public void handleMessage(Message msg) {
            Bundle data = msg.getData();
            if (data != null) {
                data.setClassLoader(Event.class.getClassLoader());
                switch (msg.what) {
                    case INVOKE:
                        Event event = data.getParcelable("event");
                        if (event != null) {
                            invoke(event, msg.replyTo);
                        }
                        break;
                    case PENDING_RESULT:
                        int requestCode = data.getInt("requestCode");
                        int resultCode = data.getInt("resultCode");
                        Intent intent = data.getParcelable("intent");
                        onActivityResult(requestCode, resultCode, intent);
                        break;
                    default:
                        break;
                }
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
        Map<String, IApi> apis = HeraService.config().getExtendsApi();
        if (apis != null && !apis.isEmpty()) {
            for (Map.Entry<String, IApi> entry : apis.entrySet()) {
                IApi api = entry.getValue();
                if (api != null) {
                    api.onCreate();
                }
            }
        }
        return mReceiver.getBinder();
    }

    @Override
    public boolean onUnbind(Intent intent) {
        Map<String, IApi> apis = HeraService.config().getExtendsApi();
        if (apis != null && !apis.isEmpty()) {
            for (Map.Entry<String, IApi> entry : apis.entrySet()) {
                IApi api = entry.getValue();
                if (api != null) {
                    api.onDestroy();
                }
            }
        }
        return super.onUnbind(intent);
    }

    @Override
    public void onDestroy() {
        HeraTrace.d(TAG, "service onDestroy");
        CALLING_APIS.clear();
        mHandler.removeCallbacksAndMessages(null);
        super.onDestroy();
    }

    private void invoke(Event event, Messenger reply) {
        ICallback callback = new ApiCallback(event, reply);
        Map<String, IApi> apis = HeraService.config().getExtendsApi();
        if (apis != null && !apis.isEmpty()) {
            IApi api = apis.get(event.getName());
            if (api != null) {
                CALLING_APIS.put(event, Pair.create(api, callback));
                api.invoke(event.getName(), event.getParam(), callback);
                return;
            }
        }

        callback.onFail();
    }

    private void onActivityResult(int requestCode, int resultCode, Intent data) {
        for (Map.Entry<Event, Pair<IApi, ICallback>> entry : CALLING_APIS.entrySet()) {
            Pair<IApi, ICallback> pair = entry.getValue();
            IApi api = pair.first;
            ICallback callback = pair.second;
            if (api != null && callback != null) {
                api.onActivityResult(requestCode, resultCode, data, pair.second);
            }
        }
    }

    private class ApiCallback implements ICallback {

        private Event event;
        private Messenger sender;

        ApiCallback(Event event, Messenger sender) {
            this.event = event;
            this.sender = sender;
        }

        @Override
        public void onSuccess(JSONObject result) {
            CALLING_APIS.remove(event);
            Bundle data = new Bundle();
            data.putString("result", result != null ? result.toString() : null);
            sendData(ApisManager.SUCCESS, data);
        }

        @Override
        public void onFail() {
            CALLING_APIS.remove(event);
            sendData(ApisManager.FAIL, null);
        }

        @Override
        public void onCancel() {
            CALLING_APIS.remove(event);
            sendData(ApisManager.CANCEL, null);
        }

        @Override
        public void startActivityForResult(Intent intent, int requestCode) {
            Bundle data = new Bundle();
            data.putParcelable("intent", intent);
            data.putInt("requestCode", requestCode);
            sendData(ApisManager.PENDING, data);
        }

        private void sendData(int what, Bundle data) {
            if (data == null) {
                data = new Bundle();
            }
            data.putParcelable("event", event);
            Message message = Message.obtain();
            message.setData(data);
            message.what = what;
            try {
                sender.send(message);
            } catch (RemoteException e) {
                HeraTrace.e(TAG, "send result to Hera exception, " + e.getMessage());
            }
        }
    }

}
