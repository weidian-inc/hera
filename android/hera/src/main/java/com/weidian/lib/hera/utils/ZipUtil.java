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

import android.text.TextUtils;
import android.util.Log;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class ZipUtil {

    private static final String TAG = "ZipUtil";

    private ZipUtil() {
    }

    /**
     * 解压zip文件
     *
     * @param inputPath zip文件路径
     * @param outputDir 解压输出路径
     * @return true：解压成功，否则亦然
     */
    public static boolean unzipFile(String inputPath, String outputDir) {
        if (TextUtils.isEmpty(inputPath) || TextUtils.isEmpty(outputDir)) {
            return false;
        }
        try {
            return unzipFile(new FileInputStream(inputPath), outputDir);
        } catch (FileNotFoundException e) {
            Log.e("Hera", "unzip from file exception, " + e.getMessage());
            return false;
        }
    }

    /**
     * 解压zip文件
     *
     * @param inputStream zip文件输入流
     * @param outputDir   解压输出路径
     * @return true：解压成功，否则亦然
     */
    public static boolean unzipFile(InputStream inputStream, String outputDir) {
        if (inputStream == null || TextUtils.isEmpty(outputDir)) {
            return false;
        }

        ZipInputStream zis = null;
        FileOutputStream fos = null;
        try {
            zis = new ZipInputStream(inputStream);
            ZipEntry zipEntry = zis.getNextEntry();
            byte[] buffer = new byte[4096];
            while (zipEntry != null) {
                String fileName = zipEntry.getName();
                if (zipEntry.isDirectory()) {
                    File newDir = new File(outputDir, fileName);
                    Log.d(TAG, "unzip Dir: " + newDir.getAbsolutePath());
                    newDir.mkdirs();
                } else {
                    File newFile = new File(outputDir, fileName);
                    Log.d(TAG, "unzip File: " + newFile.getCanonicalPath());
                    fos = new FileOutputStream(newFile);
                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        fos.write(buffer, 0, len);
                    }
                    fos.flush();
                    fos.close();
                }
                zipEntry = zis.getNextEntry();
            }
            Log.d(TAG, "unzip done");
        } catch (IOException e) {
            Log.e("Hera", "unzip from inputStream exception, " + e.getMessage());
            return false;
        } finally {
            IOUtil.closeAll(zis, fos);
        }

        return true;
    }
}
