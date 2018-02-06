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

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;

import com.weidian.lib.hera.api.BaseApi;
import com.weidian.lib.hera.interfaces.ICallback;
import com.weidian.lib.hera.trace.HeraTrace;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashSet;
import java.util.Set;

/**
 * 网络类型及状态的api
 */
public class NetInfoModule extends BaseApi {
    private static final String TAG = NetInfoModule.class.getSimpleName();
    private static final String CONNECTION_TYPE_NONE = "none";
    private static final String CONNECTION_TYPE_UNKNOWN = "unknown";
    private final ConnectivityManager mConnectivityManager;
    private final ConnectivityBroadcastReceiver mConnectivityBroadcastReceiver;
    private boolean mIsConnected = false;
    private String mConnectivity = CONNECTION_TYPE_NONE;
    private Set<ICallback> mCallbacks;

    public NetInfoModule(Context context) {
        super(context);
        mConnectivityManager =
                (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        mConnectivityBroadcastReceiver = new ConnectivityBroadcastReceiver();
    }

    @Override
    public String[] apis() {
        return new String[]{"getNetworkType", "onNetworkStatusChange"};
    }

    @Override
    public void invoke(String event, JSONObject param, ICallback callback) {
        if ("getNetworkType".equals(event)) {
            getNetworkType(callback);
        } else if ("onNetworkStatusChange".equals(event)) {
            onNetworkStatusChange(callback);
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        this.mCallbacks = new HashSet<>();
        registerReceiver();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        unregisterReceiver();
        mCallbacks.clear();
    }

    /**
     * 获取当前网络状态
     *
     * @param callback
     */
    private void getNetworkType(ICallback callback) {
        JSONObject data = new JSONObject();
        try {
            data.put("networkType", mConnectivity);
            callback.onSuccess(data);
        } catch (JSONException e) {
            HeraTrace.e(TAG, "getNetworkType assemble result exception!");
            callback.onFail();
        }
    }

    private void onNetworkStatusChange(ICallback callback) {
        if (callback != null) {
            this.mCallbacks.add(callback);
        }
    }

    private void registerReceiver() {
        IntentFilter filter = new IntentFilter();
        filter.addAction(ConnectivityManager.CONNECTIVITY_ACTION);
        getContext().registerReceiver(mConnectivityBroadcastReceiver, filter);
        mConnectivityBroadcastReceiver.setRegistered(true);
    }

    private void unregisterReceiver() {
        if (mConnectivityBroadcastReceiver.isRegistered()) {
            getContext().unregisterReceiver(mConnectivityBroadcastReceiver);
            mConnectivityBroadcastReceiver.setRegistered(false);
        }
    }

    private void updateAndSendConnectionType() {
        String currentConnectivity = getCurrentConnectionType();
        if (!currentConnectivity.equalsIgnoreCase(mConnectivity)) {
            mConnectivity = currentConnectivity;
            sendConnectivityChangedEvent();
        }
    }

    private String getCurrentConnectionType() {
        try {
            NetworkInfo networkInfo = mConnectivityManager.getActiveNetworkInfo();
            if (networkInfo == null || !networkInfo.isConnected()) {
                mIsConnected = false;
                return CONNECTION_TYPE_NONE;
            } else if (ConnectivityManager.isNetworkTypeValid(networkInfo.getType())) {
                mIsConnected = true;
                return networkInfo.getTypeName().toLowerCase();
            } else {
                mIsConnected = true;
                return CONNECTION_TYPE_UNKNOWN;
            }
        } catch (SecurityException e) {
            mIsConnected = false;
            return CONNECTION_TYPE_UNKNOWN;
        }
    }

    private void sendConnectivityChangedEvent() {
        JSONObject data = new JSONObject();
        try {
            data.put("isConnected", mIsConnected);
            data.put("networkType", mConnectivity);
        } catch (JSONException e) {
            HeraTrace.e(TAG, "networkType parse params exception!");
        }

        for (ICallback callback : mCallbacks) {
            callback.onSuccess(data);
        }
    }

    /**
     * 负责接收连接类型改变的广播
     * NB: 在某些机型上，可能收到同种类型多次改变的广播
     */
    private class ConnectivityBroadcastReceiver extends BroadcastReceiver {
        private boolean isRegistered = false;

        public boolean isRegistered() {
            return isRegistered;
        }

        public void setRegistered(boolean registered) {
            isRegistered = registered;
        }

        @Override
        public void onReceive(Context context, Intent intent) {
            if (ConnectivityManager.CONNECTIVITY_ACTION.equals(intent.getAction())) {
                updateAndSendConnectionType();
            }
        }
    }
}
