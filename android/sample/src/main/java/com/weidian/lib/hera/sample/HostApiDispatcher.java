package com.weidian.lib.hera.sample;

import android.content.Context;

import com.weidian.lib.hera.remote.IHostApiCallback;
import com.weidian.lib.hera.remote.IHostApiDispatcher;
import com.weidian.lib.hera.sample.api.HostApis;

/**
 * 宿主api的调用分发
 */
public class HostApiDispatcher implements IHostApiDispatcher {

    private HostApis mApis;

    public HostApiDispatcher(Context context) {
        mApis = new HostApis(context);
    }

    @Override
    public void dispatch(String event, String param, IHostApiCallback apiCallback) {
        mApis.invoke(event, param, apiCallback);
    }
}
