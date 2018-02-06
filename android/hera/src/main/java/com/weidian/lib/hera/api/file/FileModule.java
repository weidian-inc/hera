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


package com.weidian.lib.hera.api.file;

import android.content.Context;
import android.support.annotation.NonNull;
import android.text.TextUtils;

import com.weidian.lib.hera.api.BaseApi;
import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.interfaces.ICallback;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.FileSizeUtil;
import com.weidian.lib.hera.utils.FileUtil;
import com.weidian.lib.hera.utils.SharePreferencesUtil;
import com.weidian.lib.hera.utils.StorageUtil;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;

public class FileModule extends BaseApi {

    private static final double MAX_SIZE = 10;//10M 最大10m
    private static final String WD_FILE_SPLIT = "//";

    private String mTempPath;
    private String mStorePath;

    public FileModule(Context context, AppConfig appConfig) {
        super(context);
        mTempPath = appConfig.getMiniAppTempPath(context);
        mStorePath = appConfig.getMiniAppStorePath(context);
    }

    @Override
    public String[] apis() {
        return new String[]{"saveFile", "getFileInfo",
                "getSavedFileList", "getSavedFileInfo", "removeSavedFile"};
    }

    @Override
    public void invoke(String event, JSONObject param, ICallback callback) {
        switch (event) {
            case "saveFile":
                saveFile(param, callback);
                break;
            case "removeSavedFile":
                removeSavedFile(param, callback);
                break;
            case "getFileInfo":
                getFileInfo(param, callback);
                break;
            case "getSavedFileList":
                getSavedFileList(callback);
                break;
            case "getSavedFileInfo":
                getSavedFileInfo(param, callback);
                break;
        }
    }

    private void saveFile(JSONObject param, ICallback callback) {
        String tempFilePath = param.optString("tempFilePath");
        if (TextUtils.isEmpty(tempFilePath)) {
            callback.onFail();
            return;
        }

        if (tempFilePath.startsWith(StorageUtil.SCHEME_WDFILE)) {
            String tempFileName = tempFilePath.substring(StorageUtil.SCHEME_WDFILE.length());
            tempFilePath = new File(mTempPath, tempFileName).getAbsolutePath();
        } else if (tempFilePath.startsWith(StorageUtil.SCHEME_FILE)) {
            tempFilePath = tempFilePath.substring(StorageUtil.SCHEME_FILE.length());
        }

        File tempFile = new File(tempFilePath);
        if (TextUtils.isEmpty(tempFilePath) && !tempFile.exists() && !tempFile.isFile()) {
            callback.onFail();
            return;
        }
        String rootDir = checkRootDir();
        if (checkDirSize(rootDir, tempFilePath)) {
            String saveName = StorageUtil.PREFIX_STORE + FileUtil.getMD5(tempFile)
                    + FileUtil.getFileSuffix(tempFilePath);
            String saveFilePath = rootDir + File.separator + saveName;
            if (FileUtil.copyFile(tempFilePath, saveFilePath)) {
                File saveFile = new File(saveFilePath);
                SharePreferencesUtil.saveLong(getContext(), saveName, System.currentTimeMillis());
                if (saveFile.exists()) {
                    try {
                        JSONObject jsonObject = new JSONObject();
                        jsonObject.put("savedFilePath", StorageUtil.SCHEME_WDFILE + saveName);
                        callback.onSuccess(jsonObject);
                        return;
                    } catch (Exception e) {
                        HeraTrace.e(TAG, "saveFile assemble result exception!");
                    }
                }
            }
        }

        callback.onFail();
    }

    private void removeSavedFile(JSONObject param, ICallback callback) {
        String filepath = param.optString("filePath");
        if (!TextUtils.isEmpty(filepath) && filepath.startsWith(StorageUtil.SCHEME_WDFILE)) {
            String path = getLocalFilePath(filepath);
            File file = new File(path);
            if (file.exists()) {
                file.delete();
            }
        }
        callback.onSuccess(null);
    }

    @NonNull
    private String getLocalFilePath(String filepath) {
        int index = filepath.indexOf(WD_FILE_SPLIT);
        String name = filepath.substring(index + WD_FILE_SPLIT.length());
        HeraTrace.e(getClass().getSimpleName(), "name = " + name);
        String rootDir = checkRootDir();
        return rootDir + File.separator + name;
    }

    private void getFileInfo(JSONObject param, ICallback callback) {
        String filePath = param.optString("filePath");
        String digestAlgorithm = param.optString("digestAlgorithm");

        if (TextUtils.isEmpty(digestAlgorithm)) {
            digestAlgorithm = "md5";
        }

        if (!TextUtils.isEmpty(filePath)) {
            String localPath = getLocalFilePath(filePath);
            if (new File(localPath).exists()) {
                try {
                    long size = FileSizeUtil.getFileSize(new File(localPath));
                    JSONObject result = new JSONObject();
                    result.put("size", size);
                    if ("md5".equals(digestAlgorithm)) {
                        result.put("digest", FileUtil.getMD5(new File(localPath)));
                    } else {
                        result.put("sha1", FileUtil.getSHA1(localPath));
                    }

                    callback.onSuccess(result);
                    return;
                } catch (Exception e) {
                    HeraTrace.e(TAG, "getFileInfo assemble result exception!");
                }
            }
        }
        callback.onFail();
    }

    private void getSavedFileList(ICallback callback) {
        String rootDir = checkRootDir();
        File fileDir = new File(rootDir);
        JSONObject result = new JSONObject();
        JSONArray fileList = new JSONArray();
        for (File file : fileDir.listFiles()) {
            fileList.put(convertToWDFile(file));
        }
        try {
            result.put("fileList", fileList);
            callback.onSuccess(result);
        } catch (JSONException e) {
            HeraTrace.e(TAG, "getSavedFileList assemble result exception!");
            callback.onFail();
        }
    }

    private void getSavedFileInfo(JSONObject param, ICallback callback) {
        String filePath = param.optString("filePath");;
        if (!TextUtils.isEmpty(filePath)) {
            String localPath = getLocalFilePath(filePath);
            try {
                long size = FileSizeUtil.getFileSize(new File(localPath));
                long createTime = SharePreferencesUtil.loadLong(getContext(), new File(localPath).getName(), -1);
                JSONObject result = new JSONObject();
                result.put("size", size);
                result.put("createTime", createTime);
                callback.onSuccess(result);
                return;
            } catch (Exception e) {
                HeraTrace.e(TAG, "getSavedFileInfo assemble result exception!");
            }
        }
        callback.onFail();
    }

    private String convertToWDFile(File file) {
        return StorageUtil.SCHEME_WDFILE + file.getName();
    }


    private String checkRootDir() {
        File rootDir = new File(mStorePath);
        if (!rootDir.exists()) {
            rootDir.mkdirs();
        }
        return rootDir.getAbsolutePath();
    }

    private boolean checkDirSize(String dir, String tempFile) {
        double size = FileSizeUtil.getFileOrFilesSize(dir, FileSizeUtil.SIZETYPE_MB);
        double tempSize = FileSizeUtil.getFileOrFilesSize(tempFile, FileSizeUtil.SIZETYPE_MB);
        if (size + tempSize > MAX_SIZE) {
            HeraTrace.e(getClass().getSimpleName(), "storage dir > 10M");
            return false;
        }
        return true;
    }

}
