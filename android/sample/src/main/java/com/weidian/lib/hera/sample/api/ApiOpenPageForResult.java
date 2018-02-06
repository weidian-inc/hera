package com.weidian.lib.hera.sample.api;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;

import com.weidian.lib.hera.api.AbsApi;
import com.weidian.lib.hera.interfaces.ICallback;
import com.weidian.lib.hera.utils.JsonUtil;

import org.json.JSONObject;

/**
 * 调用扩展api示例，打开某个可返回结果的Activity
 */
public class ApiOpenPageForResult extends AbsApi {

    private static final int REQUEST_CODE = 0x11;

    @Override
    public String[] apis() {
        return new String[]{"openPageForResult"};
    }

    @Override
    public void invoke(String event, JSONObject param, ICallback callback) {
        Intent intent = new Intent();
        intent.setComponent(new ComponentName("com.weidian.lib.hera.sample",
                "com.weidian.lib.hera.sample.ForResultActivity"));
        callback.startActivityForResult(intent, REQUEST_CODE);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data, ICallback callback) {
        if (requestCode != REQUEST_CODE) {
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

        callback.onSuccess(JsonUtil.parseToJson(data.getExtras()));
    }

}