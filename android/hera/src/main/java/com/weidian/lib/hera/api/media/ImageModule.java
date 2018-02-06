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


package com.weidian.lib.hera.api.media;

import android.app.Activity;
import android.content.Intent;
import android.text.TextUtils;

import com.weidian.lib.hera.api.BaseApi;
import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.interfaces.ICallback;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.Constants;
import com.weidian.lib.hera.utils.FileUtil;
import com.weidian.lib.hera.utils.StorageUtil;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;

import me.iwf.photopicker.PhotoPicker;
import me.iwf.photopicker.PhotoPreview;

import static com.weidian.lib.hera.utils.Constants.REQUEST_CODE_CHOOSE;

/**
 * 选择图片，图片预览api
 */
public class ImageModule extends BaseApi {

    private Activity mActivity;
    private String mMiniAppTempDir;

    public ImageModule(Activity context, AppConfig appConfig) {
        super(context);
        this.mActivity = context;
        this.mMiniAppTempDir = appConfig.getMiniAppTempPath(context);
    }

    @Override
    public String[] apis() {
        return new String[]{"chooseImage", "previewImage"};
    }

    @Override
    public void invoke(String event, JSONObject param, ICallback callback) {
        if ("chooseImage".equals(event)) {
            chooseImage(param, callback);
        } else if ("previewImage".equals(event)) {
            previewImage(param, callback);
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data,
                                 final ICallback callback) {
        if (requestCode != REQUEST_CODE_CHOOSE) {
            return;
        }

        if (resultCode != Activity.RESULT_OK) {
            callback.onCancel();
            return;
        }

        if (data == null) {
            callback.onFail();
            return;
        }

        final ArrayList<String> photos =
                data.getStringArrayListExtra(PhotoPicker.KEY_SELECTED_PHOTOS);
        if (photos == null) {
            callback.onFail();
            return;
        }

        Executors.newSingleThreadExecutor().execute(new Runnable() {
            @Override
            public void run() {
                handleResult(photos, callback);
            }
        });
    }

    private void handleResult(List<String> photos, final ICallback callback) {
        final JSONObject resultData = new JSONObject();
        JSONArray tempFilePaths = new JSONArray();
        JSONArray tempFiles = new JSONArray();
        try {
            for (String photoPath : photos) {
                if (!TextUtils.isEmpty(photoPath)) {
                    JSONObject tempFile = new JSONObject();
                    String saveName = StorageUtil.PREFIX_TMP + FileUtil.getMD5(new File(photoPath))
                            + FileUtil.getFileSuffix(photoPath);
                    File saveFile = new File(mMiniAppTempDir, saveName);
                    boolean b = FileUtil.copyFile(photoPath, saveFile.getAbsolutePath());
                    if (b) {
                        tempFilePaths.put(StorageUtil.SCHEME_WDFILE + saveName);
                        tempFile.put("path", StorageUtil.SCHEME_WDFILE + saveName);
                        tempFile.put("size", FileUtil.getFileSize(saveFile.getAbsolutePath()));
                    } else {
                        tempFilePaths.put(StorageUtil.SCHEME_FILE + photoPath);
                        tempFile.put("path", StorageUtil.SCHEME_FILE + photoPath);
                        tempFile.put("size", FileUtil.getFileSize(photoPath));
                    }
                    tempFiles.put(tempFile);
                }
            }
            resultData.put("tempFilePaths", tempFilePaths);
            resultData.put("tempFiles", tempFiles);
            HANDLER.post(new Runnable() {
                @Override
                public void run() {
                    callback.onSuccess(resultData);
                }
            });
        } catch (Exception e) {
            HeraTrace.e(TAG, "chooseImage assemble result exception!");
            HANDLER.post(new Runnable() {
                @Override
                public void run() {
                    callback.onFail();
                }
            });
        }
    }

    private void chooseImage(JSONObject param, ICallback callback) {
        //params ={"count":3,"sizeType":["original","compressed"],"sourceType":["album","camera"]}
        boolean chooseWithoutCamera = false;// 默认相册加入相机选项

        int chooseCount = param.optInt("count", 9);
        JSONArray sourceType = param.optJSONArray("sourceType");
        if (sourceType != null && sourceType.length() == 1) {
            String type = sourceType.optString(0, "");
            if (!TextUtils.isEmpty(type)) {
                if (type.equals("album")) { // 不加入相机功能
                    chooseWithoutCamera = true;
                }
            }
        }

        PhotoPicker.builder()
                .setPhotoCount(chooseCount)
                .setShowCamera(!chooseWithoutCamera)
                .setShowGif(false)
                .setPreviewEnabled(true)
                .start(mActivity, Constants.REQUEST_CODE_CHOOSE);
    }

    private void previewImage(JSONObject param, ICallback callback) {
        String currentUrl = param.optString("current", "");
        JSONArray urls = param.optJSONArray("urls");

        if (urls == null || urls.length() == 0) {
            HeraTrace.w(TAG, "urls is null");
            callback.onFail();
            return;
        }

        int curIndex = 0;
        int len = urls.length();
        ArrayList<String> imageUrls = new ArrayList<>(len);
        for (int i = 0; i < len; i++) {
            String uriString = urls.optString(i);
            if (TextUtils.isEmpty(uriString)) {
                continue;
            }

            if (uriString.equals(currentUrl)) {
                curIndex = i;
            }

            String imagePath = uriString;
            if (uriString.startsWith(StorageUtil.SCHEME_WDFILE)) {
                imagePath = mMiniAppTempDir + uriString.substring(
                        StorageUtil.SCHEME_WDFILE.length());
            }
            imageUrls.add(imagePath);
        }

        PhotoPreview.builder()
                .setPhotos(imageUrls)
                .setCurrentItem(curIndex)
                .start(mActivity);
    }

}
