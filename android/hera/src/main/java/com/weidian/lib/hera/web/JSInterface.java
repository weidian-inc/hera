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


package com.weidian.lib.hera.web;

import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;

import com.weidian.lib.hera.interfaces.IBridge;
import com.weidian.lib.hera.trace.HeraTrace;

/**
 * js与native通信的通道类
 */
public class JSInterface {

    private static final String TAG = "JSInterface";

    private IBridge mBridgeHandler;
    private Handler mHandler = new Handler(Looper.getMainLooper());

    public JSInterface(IBridge handler) {
        mBridgeHandler = handler;
    }

    @JavascriptInterface
    public void publishHandler(final String event, final String params, final String viewIds) {
        HeraTrace.d(TAG, String.format("publishHandler is called! event=%s, params=%s, viewIds=%s",
                event, params, viewIds));
        mHandler.post(new Runnable() {
            @Override
            public void run() {
                if (mBridgeHandler != null) {
                    mBridgeHandler.publish(event, params, viewIds);
                }
            }
        });
    }

    @JavascriptInterface
    public void invokeHandler(final String event, final String params, final String callbackId) {
        HeraTrace.d(TAG, String.format("invokeHandler is called! event=%s, params=%s, callbackId=%s",
                event, params, callbackId));
        mHandler.post(new Runnable() {
            @Override
            public void run() {
                if (mBridgeHandler != null) {
                    mBridgeHandler.invoke(event, params, callbackId);
                }
            }
        });
    }

}
