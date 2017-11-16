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


package com.weidian.lib.hera.trace;

import android.app.ActivityManager;
import android.content.Context;
import android.util.Log;

import com.weidian.lib.hera.main.HeraService;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.Writer;

/**
 * 简单的日志输出类
 */
public class HeraTrace {
    private static final String TAG = "HeraTrace";

    private HeraTrace() {
    }

    public static void d(String debugInfo) {
        d(TAG, debugInfo);
    }

    public static void d(String tag, String debugInfo) {
        if (HeraService.config().isDebug()) {
            Log.d(tag, debugInfo);
        }
    }

    public static void w(String warning) {
        w(TAG, warning);
    }

    public static void w(String tag, String warning) {
        if (HeraService.config().isDebug()) {
            Log.w(tag, warning);
        }
    }

    public static void e(String error) {
        e(TAG, error);
    }

    public static void e(String tag, String error) {
        if (HeraService.config().isDebug()) {
            Log.e(tag, error);
        }
    }

    public static void e(Exception exception) {
        e(TAG, exception);
    }

    public static void e(String tag, Exception exception) {
        String stackInfo = getAllStackInformation(exception);
        e(tag, stackInfo);
    }

    /**
     * 获取所有堆栈信息
     *
     * @param ex
     * @return
     */
    private static String getAllStackInformation(Throwable ex) {
        try {
            Writer writer = new StringWriter();
            PrintWriter printWriter = new PrintWriter(writer);
            ex.printStackTrace(printWriter);
            Throwable cause = ex.getCause();
            while (cause != null) {
                cause.printStackTrace(printWriter);
                cause = cause.getCause();
            }
            printWriter.close();

            return writer.toString();
        } catch (Throwable e) {
            e("class HeraTrace.java - method getAllStackInformation(Throwable) catch error " + e);
        }
        return "unknown: get stack information error";
    }

    public static String getProcessName(Context context) {
        int pid = android.os.Process.myPid();
        String processName = "";
        ActivityManager manager = (ActivityManager) context.getApplicationContext().getSystemService(Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningAppProcessInfo process : manager.getRunningAppProcesses()) {
            if (process.pid == pid) {
                processName = process.processName;
            }
        }
        return processName;
    }
    public static boolean isMainProcess(Context context) {
        boolean ret = true;
        String processName = getProcessName(context);
        if(processName != null) {
            ret = processName.equals(context.getPackageName());
        }
        return ret;
    }

}
