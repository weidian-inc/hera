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
import com.weidian.lib.hera.api.BaseApi;
import com.weidian.lib.hera.interfaces.ICallback;
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
public class DialogModule extends BaseApi {

    private ModalDialog mModalDialog;
    private ActionSheetDialog mActionSheetDialog;

    public DialogModule(Context context) {
        super(context);
    }

    @Override
    public String[] apis() {
        return new String[]{"showModal", "showActionSheet"};
    }

    @Override
    public void invoke(String event, JSONObject param, ICallback callback) {
        if ("showModal".equals(event)) {
            showModal(param, callback);
        } else if ("showActionSheet".equals(event)) {
            showActionSheet(param, callback);
        }
    }

    private void showModal(JSONObject param, final ICallback callback) {
        String title = param.optString("title");
        String content = param.optString("content");
        boolean showCancel = param.optBoolean("showCancel", true);
        String cancelText = param.optString("cancelText",
                getContext().getString(R.string.cancel));
        String cancelColor = param.optString("cancelColor", "#000000");
        String confirmText = param.optString("confirmText",
                getContext().getString(R.string.confirm));
        String confirmColor = param.optString("confirmColor", "#3CC51F");

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
                        //ignore
                    }
                    callback.onSuccess(data);
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
                    //ignore
                }
                callback.onSuccess(data);
            }
        });

        mModalDialog.show();
    }

    private void showActionSheet(JSONObject param, final ICallback callback) {
        List<String> itemList = new ArrayList<>();
        String itemColor = param.optString("itemColor", "#000000");
        JSONArray itemArray = param.optJSONArray("itemList");
        if (itemArray != null) {
            int len = itemArray.length();
            for (int i = 0; i < len; i++) {
                String itemText = itemArray.optString(i);
                if (!TextUtils.isEmpty(itemText)) {
                    itemList.add(itemText);
                }
            }
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
                    //ignore
                }
                callback.onSuccess(data);
            }
        });
        mActionSheetDialog.setOnCancelListener(new DialogInterface.OnCancelListener() {
            @Override
            public void onCancel(DialogInterface dialog) {
                callback.onCancel();
            }
        });
        mActionSheetDialog.show();
    }

}
