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

import android.content.Context;
import android.os.Build;
import android.util.AttributeSet;
import android.util.Log;
import android.util.Pair;
import android.view.accessibility.AccessibilityManager;
import com.tencent.smtt.sdk.WebSettings;
import com.tencent.smtt.sdk.WebView;
import android.widget.Toast;

import com.weidian.lib.hera.config.HeraConfig;
import com.weidian.lib.hera.interfaces.IBridge;
import com.weidian.lib.hera.trace.HeraTrace;

import java.lang.reflect.Field;
import java.lang.reflect.Method;

public class HeraWebView extends WebView {

    private Boolean mIsAccessibilityEnabledOriginal;

    public HeraWebView(Context context) {
        super(context);
        initSetting();
    }

    public HeraWebView(Context context, AttributeSet attributeSet) {
        super(context, attributeSet);
        initSetting();
    }

    public HeraWebView(Context context, AttributeSet attributeSet, int i) {
        super(context, attributeSet, i);
        initSetting();
    }

    private void initSetting() {
        fixedAccessibilityInjectorException();
        removeJavaInterface();

        WebSettings webSetting = getSettings();
        webSetting.setAllowFileAccess(true);
        webSetting.setBuiltInZoomControls(true);
        webSetting.setDisplayZoomControls(false);
        webSetting.setSupportMultipleWindows(false);
        webSetting.setAppCacheEnabled(true);
        webSetting.setDomStorageEnabled(true);
        webSetting.setDatabaseEnabled(true);
        webSetting.setJavaScriptEnabled(true);
        webSetting.setGeolocationEnabled(true);
        webSetting.setUseWideViewPort(true);
        webSetting.setCacheMode(WebSettings.LOAD_NO_CACHE);
        String ua = webSetting.getUserAgentString();
        webSetting.setUserAgentString(String.format("%s Hera(version/%s)", ua, HeraConfig.VERSION));
        setVerticalScrollBarEnabled(false);
        setHorizontalScrollBarEnabled(false);
    }

    public void setJsHandler(IBridge handler) {
        addJavascriptInterface(new JSInterface(handler), "HeraJSCore");
    }

    @Override
    public void destroy() {
        try {
            setWebChromeClient(null);
            removeJavascriptInterface("HeraJSCore");
            releaseConfigCallback();
            resetAccessibilityEnabled();
            super.destroy();
        } catch (Throwable t) {
            HeraTrace.e(tag(), "destroy exception");
        }
    }

    public String tag() {
        return "HeraWebView";
    }

    private void removeJavaInterface() {
        try {
            Method removeJavascriptInterface = this.getClass().getMethod("removeJavascriptInterface", String.class);
            if (removeJavascriptInterface != null) {
                removeJavascriptInterface.invoke(this, "searchBoxJavaBridge_");
                removeJavascriptInterface.invoke(this, "accessibility");
                removeJavascriptInterface.invoke(this, "accessibilityTraversal");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void releaseConfigCallback() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT) { // KITKAT
            try {
                Field sConfigCallback = Class.forName("android.webkit.BrowserFrame").getDeclaredField("sConfigCallback");
                if (sConfigCallback != null) {
                    sConfigCallback.setAccessible(true);
                    sConfigCallback.set(null, null);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private void fixedAccessibilityInjectorException() {
        if (Build.VERSION.SDK_INT == Build.VERSION_CODES.JELLY_BEAN_MR1
                && mIsAccessibilityEnabledOriginal == null
                && isAccessibilityEnabled()) {
            mIsAccessibilityEnabledOriginal = true;
            setAccessibilityEnabled(false);
        }
    }

    private boolean isAccessibilityEnabled() {
        AccessibilityManager am = (AccessibilityManager) getContext().getSystemService(Context.ACCESSIBILITY_SERVICE);
        return am.isEnabled();
    }

    private void setAccessibilityEnabled(boolean enabled) {
        AccessibilityManager am = (AccessibilityManager) getContext().getSystemService(Context.ACCESSIBILITY_SERVICE);
        try {
            Method setAccessibilityState = am.getClass().getDeclaredMethod("setAccessibilityState", boolean.class);
            setAccessibilityState.setAccessible(true);
            setAccessibilityState.invoke(am, enabled);
            setAccessibilityState.setAccessible(false);
        } catch (Throwable e) {
            e.printStackTrace();
        }
    }

    private void resetAccessibilityEnabled() {
        if (mIsAccessibilityEnabledOriginal != null) {
            setAccessibilityEnabled(mIsAccessibilityEnabledOriginal);
        }
    }

    public static Pair<Boolean, String> isWebViewPackageException(Throwable e) {
        String messageCause = e.getCause() == null ? e.toString() : e.getCause().toString();
        String trace = Log.getStackTraceString(e);
        if (trace.contains("android.content.pm.PackageManager$NameNotFoundException")
                || trace.contains("java.lang.RuntimeException: Cannot load WebView")
                || trace.contains("android.webkit.WebViewFactory$MissingWebViewPackageException: Failed to load WebView provider: No WebView installed")) {

            HeraTrace.e("HeraWebView", "isWebViewPackageException" + e.getMessage());
            return new Pair<>(true, "WebView load failed, " + messageCause);
        }
        return new Pair<>(false, messageCause);
    }

    @Override
    public void setOverScrollMode(int mode) {
        try {
            super.setOverScrollMode(mode);
        } catch (Throwable e) {
            Pair<Boolean, String> pair = isWebViewPackageException(e);
            if (pair.first) {
                Toast.makeText(getContext(), pair.second, Toast.LENGTH_SHORT).show();
                destroy();
            } else {
                throw e;
            }
        }
    }
}
