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
import android.net.Uri;
import android.text.TextUtils;
import android.util.Log;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.security.MessageDigest;

/**
 * 文件操作工具类
 */
public class FileUtil {
    private static final String TAG = "FileUtil";

    private FileUtil() {
    }

    /**
     * 复制文件，支持文件夹复制
     *
     * @param srcPath  原文件路径
     * @param destPath 目标文件路径
     * @return true：复制成功，否则亦然
     */
    public static boolean copyAll(String srcPath, String destPath) {
        if (TextUtils.isEmpty(srcPath) || TextUtils.isEmpty(destPath)) {
            throw new IllegalArgumentException("srcPath and destPath can not be null");
        }
        File srcFile = new File(srcPath);
        if (!srcFile.exists()) {
            throw new IllegalArgumentException("src file not exists");
        }

        if (srcFile.isFile()) {
            return copyFile(srcPath, destPath);
        }

        File[] files = srcFile.listFiles();
        if (files != null) {
            for (File file : files) {
                copyAll(file.getAbsolutePath(), new File(destPath, file.getName()).getPath());
            }
        }

        return true;
    }

    /**
     * 复制文件
     *
     * @param srcPath  原文件路径
     * @param destPath 目标文件路径
     * @return true：复制成功，否则亦然
     */
    public static boolean copyFile(String srcPath, String destPath) {
        if (TextUtils.isEmpty(srcPath) || TextUtils.isEmpty(destPath)) {
            throw new IllegalArgumentException("srcPath and destPath can not be null");
        }
        File srcFile = new File(srcPath);
        if (!srcFile.exists()) {
            throw new IllegalArgumentException("src file not exists");
        }

        File destFile = new File(destPath);
        if (destFile.exists()) {
            destFile.delete();
        }
        FileInputStream in = null;
        FileOutputStream out = null;
        try {
            in = new FileInputStream(srcFile);
            out = new FileOutputStream(destFile);
            byte[] buffer = new byte[4096];
            int len;
            while ((len = in.read(buffer)) >= 0) {
                out.write(buffer, 0, len);
            }
        } catch (Exception e) {
            Log.d(TAG, "copyAll file exception", e);
            return false;
        } finally {
            IOUtil.closeAll(in, out);
        }
        return true;
    }


    /**
     * 删除文件，如果是目录的话则会递归删除
     *
     * @param path 文件路径
     */
    public static void deleteFile(String path) {
        if (TextUtils.isEmpty(path)) {
            return;
        }

        File file = new File(path);
        if (!file.exists()) {
            return;
        }
        if (file.isFile()) {
            file.delete();
            return;
        }

        File[] files = file.listFiles();
        if (files == null || files.length == 0) {
            file.delete();
            return;
        }

        for (File f : files) {
            if (f.isFile()) {
                f.delete();
            } else {
                deleteFile(f.getAbsolutePath());
            }
        }
    }

    /**
     * 读取文件内容
     *
     * @param file 被读取的文件
     * @return 文件内容的字符串
     */
    public static String readContent(File file) {
        if (file == null || !file.exists()) {
            return "";
        }

        ByteArrayOutputStream out = null;
        FileInputStream in = null;
        try {
            out = new ByteArrayOutputStream();
            in = new FileInputStream(file);
            byte[] buffer = new byte[4096];
            int len;
            while ((len = in.read(buffer)) >= 0) {
                out.write(buffer, 0, len);
            }
            return new String(out.toByteArray());
        } catch (Exception e) {
            Log.e(TAG, "read file content exception", e);
        } finally {
            IOUtil.closeAll(out, in);
        }

        return "";
    }

    /**
     * 获取Assets文件的内容
     *
     * @param context
     * @param localHtmlPath 本地页面路径
     * @return 页面内容
     */
    public static String readAssetsFileContent(Context context, String localHtmlPath) {
        ByteArrayOutputStream out = null;
        InputStream in = null;
        try {
            out = new ByteArrayOutputStream();
            in = context.getAssets().open(localHtmlPath);
            byte[] buffer = new byte[4096];
            int len;
            while ((len = in.read(buffer)) >= 0) {
                out.write(buffer, 0, len);
            }
            return new String(out.toByteArray());
        } catch (Exception e) {
            Log.e(TAG, "read assets file content exception", e);
        } finally {
            IOUtil.closeAll(out, in);
        }
        return "";
    }

    /**
     * 获取输入流的md5值
     *
     * @param in 输入流
     * @return md5值
     */
    public static String getMD5(InputStream in) {
        if (in == null) {
            return null;
        }

        MessageDigest md;
        byte buffer[] = new byte[4096];
        try {
            md = MessageDigest.getInstance("MD5");
            int len;
            while ((len = in.read(buffer)) >= 0) {
                md.update(buffer, 0, len);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return bytesToHexString(md.digest());
    }

    /**
     * 获取文件的md5值
     *
     * @param file 被获取md5的文件
     * @return 文件的md5值
     */
    public static String getMD5(File file) {
        if (!file.isFile()) {
            return null;
        }
        MessageDigest digest;
        FileInputStream in = null;
        byte buffer[] = new byte[4096];
        int len;
        try {
            digest = MessageDigest.getInstance("MD5");
            in = new FileInputStream(file);
            while ((len = in.read(buffer)) >= 0) {
                digest.update(buffer, 0, len);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {
            IOUtil.closeAll(in);
        }
        return bytesToHexString(digest.digest());
    }

    /**
     * 获取文件的SHA1值
     *
     * @param filePath 文件路径
     * @return 文件的SHA1值
     */
    public static String getSHA1(String filePath) {
        InputStream inputStream = null;
        try {
            inputStream = new FileInputStream(filePath);
            byte[] buffer = new byte[4096];
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            int numRead = 0;
            while (numRead != -1) {
                numRead = inputStream.read(buffer);
                if (numRead > 0)
                    digest.update(buffer, 0, numRead);
            }
            byte[] sha1Bytes = digest.digest();
            return bytesToHexString(sha1Bytes);
        } catch (Exception e) {
            return null;
        } finally {
            IOUtil.closeAll(inputStream);
        }
    }

    /**
     * 字节数组转十六进制字符串
     *
     * @param src 字节数组
     * @return 十六进制字符串
     */
    public static String bytesToHexString(byte[] src) {
        StringBuilder stringBuilder = new StringBuilder("");
        if (src == null || src.length <= 0) {
            return null;
        }
        for (int i = 0; i < src.length; i++) {
            int v = src[i] & 0xFF;
            String hv = Integer.toHexString(v);
            if (hv.length() < 2) {
                stringBuilder.append(0);
            }
            stringBuilder.append(hv);
        }
        return stringBuilder.toString();
    }

    /**
     * 获取文件后缀
     *
     * @param path 文件路径
     * @return 文件后缀
     */
    public static String getFileSuffix(String path) {
        if (TextUtils.isEmpty(path)) {
            return "";
        }
        int start = path.lastIndexOf(".");
        if (start != -1) {
            return path.substring(start);
        }
        return "";
    }

    /**
     * 获取文件大小
     *
     * @param path 文件路径
     * @return 文件大小或-1
     */
    public static long getFileSize(String path) {
        if (path == null || path.trim().length() == 0) {
            return -1;
        }

        File file = new File(path);
        return file.exists() && file.isFile() ? file.length() : -1;
    }

    /**
     * 将文件转换为uri字符串返回
     *
     * @param file 被转换的文件
     * @return uri字符串
     */
    public static String toUriString(File file) {
        return Uri.fromFile(file).toString();
    }

    /**
     * 将文件路径转换为uri字符串
     *
     * @param path 被转换的文件路径
     * @return uri字符串
     */
    public static String toUriString(String path) {
        return Uri.fromFile(new File(path)).toString();
    }

}
