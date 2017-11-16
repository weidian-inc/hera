package com.weidian.lib.hera.sample.api;

import android.content.Context;
import android.text.TextUtils;

import com.weidian.lib.hera.api.HeraApi;
import com.weidian.lib.hera.remote.IHostApiCallback;

import java.util.HashMap;
import java.util.Map;

/**
 * 宿主提供的扩展Api
 */
public class HostApis {

    private Map<String, IHostApi> mApis = new HashMap<>();

    public HostApis(Context context) {
        add(new ApiOpenLink(context));
        add(new ApiOpenPageForResult());
    }

    /**
     * 处理宿主api调用
     *
     * @param event    事件名称，即api名称
     * @param params   调用参数
     * @param callback 回调接口
     */
    public void invoke(String event, String params, IHostApiCallback callback) {
        IHostApi api = mApis.get(event);
        if (api != null) {
            api.invoke(event, params, callback);
        } else {
            callback.onResult(IHostApiCallback.UNDEFINE, null);
        }
    }

    private void add(IHostApi api) {
        if (api == null) {
            return;
        }

        HeraApi annotation = api.getClass().getAnnotation(HeraApi.class);
        if (annotation == null) {
            return;
        }

        String[] names = annotation.names();
        if (names.length == 0) {
            return;
        }

        for (String name : names) {
            if (TextUtils.isEmpty(name)) {
                continue;
            }
            mApis.put(name, api);
        }
    }

}

