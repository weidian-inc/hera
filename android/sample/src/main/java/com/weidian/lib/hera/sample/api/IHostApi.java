package com.weidian.lib.hera.sample.api;

import com.weidian.lib.hera.remote.IHostApiCallback;

public interface IHostApi {

    void invoke(String event, String params, IHostApiCallback callback);
}
