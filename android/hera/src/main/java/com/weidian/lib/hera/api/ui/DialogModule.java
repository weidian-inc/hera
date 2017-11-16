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


package com.weidian.lib.hera.api.ui;

import android.content.Context;
import android.content.DialogInterface;
import android.text.TextUtils;
import android.view.View;

import com.weidian.lib.hera.R;
import com.weidian.lib.hera.api.AbsModule;
import com.weidian.lib.hera.api.HeraApi;
import com.weidian.lib.hera.interfaces.IApiCallback;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.ColorUtil;
import com.weidian.lib.hera.widget.ActionSheetDialog;
import com.weidian.lib.hera.widget.ModalDialog;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * 模态对话框，ActionSheet对话框
 */
@HeraApi(names = {"showModal", "showActionSheet"})
public class DialogModule extends AbsModule {

    private ModalDialog mModalDialog;
    private ActionSheetDialog mActionSheetDialog;

    public DialogModule(Context context) {
        super(context);
    }

    @Override
    public void invoke(String event, String params, IApiCallback callback) {
        if ("showModal".equals(event)) {
            showModal(event, params, callback);
        } else if ("showActionSheet".equals(event)) {
            showActionSheet(event, params, callback);
        }
    }

    private void showModal(final String event, String params, final IApiCallback callback) {
        String title = null;
        String content = null;
        boolean showCancel = true;
        String cancelText = getContext().getString(R.string.cancel);
        String cancelColor = "#000000";
        String confirmText = getContext().getString(R.string.confirm);
        String confirmColor = "#3CC51F";
        try {
            JSONObject json = new JSONObject(params);
            title = json.optString("title");
            content = json.optString("content");
            showCancel = json.optBoolean("showCancel", true);
            cancelText = json.optString("cancelText", cancelText);
            cancelColor = json.optString("cancelColor", cancelColor);
            confirmText = json.optString("confirmText", confirmText);
            confirmColor = json.optString("confirmColor", confirmColor);
        } catch (Exception e) {
            HeraTrace.e(TAG, "showModal parse params exception!");
        }

        if (mModalDialog == null) {
            mModalDialog = new ModalDialog(getContext());
            mModalDialog.setCancelable(false);
            mModalDialog.setCanceledOnTouchOutside(false);
        }

        mModalDialog.setTitle(title);
        mModalDialog.setMessage(content);
        if (showCancel) {
            mModalDialog.setLeftButtonTextColor(cancelColor);
            mModalDialog.setLeftButton(cancelText, new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    JSONObject data = new JSONObject();
                    try {
                        data.put("cancel", true);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    callback.onResult(packageResultData(event, RESULT_OK, data));
                }
            });
        }

        mModalDialog.setRightButtonTextColor(confirmColor);
        mModalDialog.setRightButton(confirmText, new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                JSONObject data = new JSONObject();
                try {
                    data.put("confirm", true);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                callback.onResult(packageResultData(event, RESULT_OK, data));
            }
        });

        mModalDialog.show();
    }

    private void showActionSheet(final String event, String params, final IApiCallback callback) {
        String itemColor = "#000000";
        List<String> itemList = null;
        try {
            JSONObject json = new JSONObject(params);
            itemColor = json.optString("itemColor", itemColor);
            JSONArray itemArray = json.optJSONArray("itemList");
            if (itemArray != null) {
                itemList = new ArrayList<>();
                int len = itemArray.length();
                for (int i = 0; i < len; i++) {
                    String itemText = itemArray.optString(i);
                    if (!TextUtils.isEmpty(itemText)) {
                        itemList.add(itemText);
                    }
                }
            }
        } catch (Exception e) {
            HeraTrace.e(TAG, "showModal parse params exception!");
        }

        if (mActionSheetDialog == null) {
            mActionSheetDialog = new ActionSheetDialog(getContext());
        }

        mActionSheetDialog.setItemList(itemList, ColorUtil.parseColor(itemColor));
        mActionSheetDialog.setOnItemClickListener(new ActionSheetDialog.OnItemClickListener() {
            @Override
            public void onItemClick(int index, View view) {
                JSONObject data = new JSONObject();
                try {
                    data.put("tapIndex", index);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                callback.onResult(packageResultData(event, RESULT_OK, data));
            }
        });
        mActionSheetDialog.setOnCancelListener(new DialogInterface.OnCancelListener() {
            @Override
            public void onCancel(DialogInterface dialog) {
                JSONObject data = new JSONObject();
                try {
                    data.put("errMsg", "showActionSheet:fail cancel");
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                callback.onResult(data.toString());
            }
        });
        mActionSheetDialog.show();
    }
}
