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

import java.io.File;

/**
 * ../hera/
 * ../hera/framework/
 * ../hera/app/
 * ../hera/app/$appId/
 * ../hera/app/$appId/source/
 * ../hera/app/$appId/store/
 * ../hera/app/$appId/temp/
 * 存储工具类
 */
public class StorageUtil {

    public static final String SCHEME_WDFILE = "wdfile://";
    public static final String SCHEME_FILE = "file:";
    public static final String PREFIX_TMP = "tmp_";
    public static final String PREFIX_STORE = "store_";

    private StorageUtil() {
    }

    /**
     * 获取存储框架js代码的根目录
     *
     * @param context 上下文
     * @return 框架根目录文件
     */
    public static String getHeraPath(Context context) {
        return context.getFilesDir() + "/hera/";
    }

    /**
     * 获取framework的目录
     *
     * @param context 上下文
     * @return 存放framework的目录文件
     */
    public static File getFrameworkDir(Context context) {
        File frameworkDir = new File(getHeraPath(context), "framework");
        if (!frameworkDir.exists() || !frameworkDir.isDirectory()) {
            frameworkDir.mkdirs();
        }
        return frameworkDir;
    }

    /**
     * 获取存储小程序的主目录
     *
     * @param context 上下文
     * @return 存放小程序的目录文件
     */
    public static String getHeraAppPath(Context context) {
        return getHeraPath(context) + "app/";
    }

    /**
     * 获取指定的小程序目录
     *
     * @param context 上下文
     * @param appId   小程序id
     * @return 指定小程序id的目录文件
     */
    public static File getMiniAppDir(Context context, String appId) {
        File miniAppDir = new File(getHeraAppPath(context), appId);
        if (!miniAppDir.exists() || !miniAppDir.isDirectory()) {
            miniAppDir.mkdirs();
        }
        return miniAppDir;
    }

    /**
     * 获取指定的小程序源码存储目录
     *
     * @param context 上下文
     * @param appId   小程序id
     * @return 指定小程序id的源码存放目录
     */
    public static File getMiniAppSourceDir(Context context, String appId) {
        File miniAppSourceDir = new File(getMiniAppDir(context, appId), "source");
        if (!miniAppSourceDir.exists() || !miniAppSourceDir.isDirectory()) {
            miniAppSourceDir.mkdirs();
        }
        return miniAppSourceDir;
    }

    /**
     * 获取指定的小程序的storage目录
     *
     * @param context 上下文
     * @param appId   小程序id
     * @return 指定小程序id的资源存储目录
     */
    public static File getMiniAppStoreDir(Context context, String appId) {
        File miniAppStoreDir = new File(getMiniAppDir(context, appId), "store");
        if (!miniAppStoreDir.exists() || !miniAppStoreDir.isDirectory()) {
            miniAppStoreDir.mkdirs();
        }
        return miniAppStoreDir;
    }

    /**
     * 获取指定的小程序的temp目录
     *
     * @param context 上下文
     * @param appId   小程序id
     * @return 指定小程序id的临时文件存储目录
     */
    public static File getMiniAppTempDir(Context context, String appId) {
        File miniAppTempDir = new File(getMiniAppDir(context, appId), "temp");
        if (!miniAppTempDir.exists() || !miniAppTempDir.isDirectory()) {
            miniAppTempDir.mkdirs();
        }
        return miniAppTempDir;
    }

    /**
     * 获取临时目录
     *
     * @param context 上下文
     * @return 临时目录文件
     */
    public static File getTempDir(Context context) {
        File tempDir = new File(context.getFilesDir(), "temp");
        if (!tempDir.exists() || !tempDir.isDirectory()) {
            tempDir.mkdirs();
        }
        return tempDir;
    }

    /**
     * framework是否存在
     *
     * @param context 上下文
     * @return true：framework存在且内容不为空，否则亦然
     */
    public static boolean isFrameworkExists(Context context) {
        File frameworkDir = StorageUtil.getFrameworkDir(context);
        if (!frameworkDir.exists()) {
            return false;
        }
        String[] files = frameworkDir.list();
        return files != null && files.length > 0;
    }

    /**
     * 清除小程序临时存储目录的文件
     *
     * @param context 上下文
     * @param appId   小程序id
     */
    public static void clearMiniAppTempDir(Context context, String appId) {
        File miniAppTempDir = getMiniAppTempDir(context, appId);
        File[] files = miniAppTempDir.listFiles();
        if (files != null && files.length > 0) {
            for (File file : files) {
                file.delete();
            }
        }
    }

}
