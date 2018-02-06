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


package com.weidian.lib.hera.api;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.text.TextUtils;
import android.util.Pair;

import com.weidian.lib.hera.api.debug.DebugModule;
import com.weidian.lib.hera.api.device.ClipboardModule;
import com.weidian.lib.hera.api.device.NetInfoModule;
import com.weidian.lib.hera.api.device.PhoneCallModule;
import com.weidian.lib.hera.api.device.ScanCodeModule;
import com.weidian.lib.hera.api.device.SystemInfoModule;
import com.weidian.lib.hera.api.file.FileModule;
import com.weidian.lib.hera.api.location.RequestLocationModule;
import com.weidian.lib.hera.api.media.ImageInfoModule;
import com.weidian.lib.hera.api.media.ImageModule;
import com.weidian.lib.hera.api.network.DownloadModule;
import com.weidian.lib.hera.api.network.RequestModule;
import com.weidian.lib.hera.api.network.UploadModule;
import com.weidian.lib.hera.api.storage.StorageModule;
import com.weidian.lib.hera.api.ui.DialogModule;
import com.weidian.lib.hera.api.ui.PageModule;
import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.interfaces.IApi;
import com.weidian.lib.hera.interfaces.IBridge;
import com.weidian.lib.hera.interfaces.ICallback;
import com.weidian.lib.hera.interfaces.OnEventListener;
import com.weidian.lib.hera.model.Event;
import com.weidian.lib.hera.remote.RemoteService;
import com.weidian.lib.hera.trace.HeraTrace;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * Api管理
 */
public class ApisManager implements ServiceConnection {

    private final static String TAG = ApisManager.class.getSimpleName();

    public static final int SUCCESS = 0x10;
    public static final int FAIL = 0x11;
    public static final int CANCEL = 0x12;
    public static final int PENDING = 0x13;

    private final IApi EMPTY_API = new EmptyApi();
    private final Map<String, IApi> APIS = new HashMap<>();
    private final Map<Event, Pair<IApi, ICallback>> CALLING_APIS = new HashMap<>();

    private Activity mActivity;
    private Messenger mSender;//发送请求的Messenger
    private Messenger mReceiver;//接收请求结果的Messenger

    //处理请求的结果
    private Handler mHandler = new Handler(Looper.getMainLooper()) {
        @Override
        public void handleMessage(Message msg) {
            HeraTrace.d(TAG, "received extends api result");
            Bundle data = msg.getData();
            if (data == null) {
                HeraTrace.d(TAG, "extends api invoke result msg.getData() is null");
                return;
            }

            data.setClassLoader(Event.class.getClassLoader());
            Event event = data.getParcelable("event");
            if (event == null) {
                HeraTrace.d(TAG, "extends api invoke result event is null");
                return;
            }

            Pair<IApi, ICallback> pair = CALLING_APIS.get(event);
            if (pair == null || pair.second == null) {
                HeraTrace.d(TAG, "extends api invoke result callback is null");
                return;
            }

            ICallback callback = pair.second;
            switch (msg.what) {
                case SUCCESS:
                    String result = data.getString("result");
                    JSONObject resultJson = null;
                    if (!TextUtils.isEmpty(result)) {
                        try {
                            resultJson = new JSONObject(result);
                        } catch (JSONException e) {
                            //ignore
                        }
                    }
                    callback.onSuccess(resultJson);
                    break;
                case CANCEL:
                    callback.onCancel();
                    break;
                case PENDING:
                    Intent intent = data.getParcelable("intent");
                    int requestCode = data.getInt("requestCode");
                    callback.startActivityForResult(intent, requestCode);
                    break;
                case FAIL:
                default:
                    callback.onFail();
                    break;
            }
        }
    };

    public ApisManager(Activity activity, OnEventListener listener, AppConfig appConfig) {
        HeraTrace.d(TAG, "HostApiManager create");
        mActivity = activity;
        mReceiver = new Messenger(mHandler);
        Intent intent = new Intent(mActivity, RemoteService.class);
        mActivity.bindService(intent, this, Context.BIND_AUTO_CREATE);
        initSdkApi(activity, listener, appConfig);
    }

    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
        HeraTrace.d(TAG, "remote service connected");
        mSender = new Messenger(service);
    }

    @Override
    public void onServiceDisconnected(ComponentName name) {
        HeraTrace.d(TAG, "onServiceDisconnected:" + name);
    }

    /**
     * 当{@link Activity#onCreate(Bundle)}调用时调用
     */
    public void onCreate() {
        for (Map.Entry<String, IApi> entry : APIS.entrySet()) {
            IApi api = entry.getValue();
            if (api != null) {
                api.onCreate();
            }
        }
    }

    /**
     * 当{@link Activity#onDestroy()}调用时调用
     */
    public void onDestroy() {
        for (Map.Entry<String, IApi> entry : APIS.entrySet()) {
            IApi api = entry.getValue();
            if (api != null) {
                api.onDestroy();
            }
        }
        APIS.clear();
        CALLING_APIS.clear();
        mHandler.removeCallbacksAndMessages(null);
        mActivity.unbindService(this);
    }

    /**
     * 当{@link Activity#onActivityResult(int, int, Intent)}调用时调用
     *
     * @param requestCode 请求码
     * @param resultCode  结果码
     * @param data        返回的数据
     */
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        for (Map.Entry<Event, Pair<IApi, ICallback>> entry : CALLING_APIS.entrySet()) {
            Pair<IApi, ICallback> pair = entry.getValue();
            IApi api = pair.first;
            if (api != null && api.apis() != null) {
                api.onActivityResult(requestCode, resultCode, data, pair.second);
            }
        }

        if (mSender == null) {
            return;
        }

        Bundle bundle = new Bundle();
        bundle.putInt("requestCode", requestCode);
        bundle.putInt("resultCode", resultCode);
        bundle.putParcelable("intent", data);
        Message msg = Message.obtain();
        msg.setData(bundle);
        msg.what = RemoteService.PENDING_RESULT;
        msg.replyTo = mReceiver;
        try {
            mSender.send(msg);
        } catch (RemoteException e) {
            Iterator<Map.Entry<Event, Pair<IApi, ICallback>>> iterator
                    = CALLING_APIS.entrySet().iterator();
            while (iterator.hasNext()) {
                Map.Entry<Event, Pair<IApi, ICallback>> entry = iterator.next();
                Pair<IApi, ICallback> pair = entry.getValue();
                if (pair != null && pair.second != null) {
                    iterator.remove();
                    pair.second.onFail();
                }
            }
        }
    }

    /**
     * api功能调用
     *
     * @param event  封装了api名称，参数及回调函数id的对象
     * @param bridge 与H5的通信接口
     */
    public void invoke(Event event, IBridge bridge) {
        ICallback callback = new ApiCallback(event, bridge);
        IApi api = APIS.get(event.getName());
        if (api != null) {
            CALLING_APIS.put(event, Pair.create(api, callback));
            api.invoke(event.getName(), event.getParam(), callback);
            return;
        }

        if (mSender == null) {
            HeraTrace.w(TAG,
                    String.format("cannot invoke extends api, sender is null, event:%s, params:%s",
                            event.getName(), event.getParam().toString()));
            return;
        }

        CALLING_APIS.put(event, Pair.create(EMPTY_API, callback));
        Bundle data = new Bundle();
        data.putParcelable("event", event);
        Message msg = Message.obtain();
        msg.setData(data);
        msg.what = RemoteService.INVOKE;
        msg.replyTo = mReceiver;
        try {
            mSender.send(msg);
        } catch (RemoteException e) {
            HeraTrace.e(TAG, String.format("invoke send exception, event:%s, params:%s",
                    event.getName(), event.getParam().toString()));
            callback.onFail();
        }
    }

    private void initSdkApi(Activity activity, OnEventListener listener, AppConfig appConfig) {
        add(new DebugModule(activity));

        //设备
        add(new ClipboardModule(activity));
        add(new PhoneCallModule(activity));
        add(new NetInfoModule(activity));
        add(new SystemInfoModule(activity));
        add(new ScanCodeModule(activity));

        //定位
        add(new RequestLocationModule(activity));

        //媒体
        add(new ImageModule(activity, appConfig));
        add(new ImageInfoModule(activity));

        //网络
        add(new RequestModule(activity));
        add(new DownloadModule(activity, appConfig));
        add(new UploadModule(activity, appConfig));

        //数据缓存
        add(new StorageModule(activity, appConfig));

        //界面
        add(new DialogModule(activity));
        add(new PageModule(activity, listener));

        //文件
        add(new FileModule(activity, appConfig));
    }

    private void add(IApi api) {
        if (api != null && api.apis() != null && api.apis().length > 0) {
            String[] apiNames = api.apis();
            for (String name : apiNames) {
                if (!TextUtils.isEmpty(name)) {
                    APIS.put(name, api);
                }
            }
        }
    }


    private class ApiCallback implements ICallback {

        private Event event;
        private IBridge bridge;

        private ApiCallback(Event event, IBridge bridge) {
            this.event = event;
            this.bridge = bridge;
        }

        @Override
        public void onSuccess(JSONObject result) {
            CALLING_APIS.remove(event);
            if (bridge != null) {
                bridge.callback(event.getCallbackId(),
                        assembleResult(result, event.getName(), "ok"));
            }
        }

        @Override
        public void onFail() {
            CALLING_APIS.remove(event);
            if (bridge != null) {
                bridge.callback(event.getCallbackId(),
                        assembleResult(null, event.getName(), "fail"));
            }
        }

        @Override
        public void onCancel() {
            CALLING_APIS.remove(event);
            if (bridge != null) {
                bridge.callback(event.getCallbackId(),
                        assembleResult(null, event.getName(), "cancel"));
            }
        }

        @Override
        public void startActivityForResult(Intent intent, int requestCode) {
            PackageManager pm = mActivity.getPackageManager();
            if (intent.resolveActivity(pm) != null) {
                mActivity.startActivityForResult(intent, requestCode);
            } else {
                onFail();
            }
        }

        private String assembleResult(JSONObject data, String event, String status) {
            if (data == null) {
                data = new JSONObject();
            }
            try {
                data.put("errMsg", String.format("%s:%s", event, status));
            } catch (JSONException e) {
                HeraTrace.e("Api", "assemble result exception!");
            }
            return data.toString();
        }
    }
}
