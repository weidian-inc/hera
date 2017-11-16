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


package com.weidian.lib.hera.utils;

import android.content.Context;
import android.content.SharedPreferences;
import android.text.TextUtils;


import static android.content.Context.MODE_PRIVATE;

public class SharePreferencesUtil {
    /**
     * 默认名字
     */
    private static final String DEFAULT_PREFERENCE_NAME = "hera";

    private SharePreferencesUtil() {
        throw new UnsupportedOperationException("you can't instantiate me");
    }

    public static final void saveString(Context context, String key, String value) {
        savePreference(context, DEFAULT_PREFERENCE_NAME, key, value);
    }

    public static void saveString(Context context, String preferenceName, String key, String value) {
        savePreference(context, preferenceName, key, value);
    }

    public static String loadString(Context context, String key, String defaultValue) {
        return loadString(context, DEFAULT_PREFERENCE_NAME, key, defaultValue);
    }

    public static String loadString(Context context, String preferenceName, String key, String defaultValue) {
        try {
            String value = getValueFromSP(context, preferenceName, key);
            if (!TextUtils.isEmpty(value)) {
                return value;
            }
        } catch (Exception e) {
        }

        return defaultValue;
    }

    public static void saveInt(Context context, String key, int value) {
        savePreference(context, DEFAULT_PREFERENCE_NAME, key, Integer.toString(value));
    }


    public static void saveInt(Context context, String preferenceName, String key, int value) {
        savePreference(context, preferenceName, key, Integer.toString(value));
    }

    public static int loadInt(Context context, String key, int defaultValue) {
        return loadInt(context, DEFAULT_PREFERENCE_NAME, key, defaultValue);
    }

    public static int loadInt(Context context, String preferenceName, String key, int defaultValue) {
        try {
            String value = getValueFromSP(context, preferenceName, key);
            if (!TextUtils.isEmpty(value)) {
                return Integer.parseInt(value);
            }
        } catch (Exception e) {
        }

        return defaultValue;
    }

    public static void saveBoolean(Context context, String key, boolean value) {
        savePreference(context, DEFAULT_PREFERENCE_NAME, key, Boolean.toString(value));
    }


    public static void saveBoolean(Context context, String preferenceName, String key, boolean value) {
        savePreference(context, preferenceName, key, Boolean.toString(value));
    }


    public static boolean loadBoolean(Context context, String key, boolean defaultValue) {
        return loadBoolean(context, DEFAULT_PREFERENCE_NAME, key, defaultValue);
    }

    public static boolean loadBoolean(Context context, String preferenceName, String key, boolean defaultValue) {
        try {
            String value = getValueFromSP(context, preferenceName, key);
            if (!TextUtils.isEmpty(value)) {
                return Boolean.parseBoolean(value);
            }
        } catch (Exception e) {
        }

        return defaultValue;
    }

    public static void saveLong(Context context, String key, long value) {
        savePreference(context, DEFAULT_PREFERENCE_NAME, key, Long.toString(value));
    }

    public static void saveLong(Context context, String preferenceName, String key, long value) {
        savePreference(context, preferenceName, key, Long.toString(value));
    }

    public static long loadLong(Context context, String key, long defaultValue) {
        return loadLong(context, DEFAULT_PREFERENCE_NAME, key, defaultValue);
    }

    public static long loadLong(Context context, String preferenceName, String key, long defaultValue) {
        try {
            String value = getValueFromSP(context, preferenceName, key);
            if (!TextUtils.isEmpty(value)) {
                return Long.parseLong(value);
            }
        } catch (Exception e) {
        }

        return defaultValue;
    }

    public static void clearPreference(Context context, String key) {
        clearPreference(context, DEFAULT_PREFERENCE_NAME, key);
    }

    public static void clearPreference(Context context, String preferenceName, String key) {
        SharedPreferences preferences = getSharedPreference(context,
                preferenceName);
        SharedPreferences.Editor editor = preferences.edit();
        editor.remove(key);
        editor.apply();
    }

    public static void savePreference(Context context, String preferenceName, String key, Object data) {

        if (TextUtils.isEmpty(key) || data == null) {
            return;
        }

        SharedPreferences preference = getSharedPreference(context, preferenceName);
        SharedPreferences.Editor editor = preference.edit();
        editor.putString(key, String.valueOf(data));
        editor.apply();
    }

    private static String getValueFromSP(Context context, String preferenceName, String key) {
        return getSharedPreference(context, preferenceName).getString(key, null);
    }

    public static SharedPreferences getSharedPreference(Context context, String preferenceName) {
        String name = TextUtils.isEmpty(preferenceName) ? context.getPackageName()
                : preferenceName;

        return context.getSharedPreferences(name, MODE_PRIVATE);
    }
}
