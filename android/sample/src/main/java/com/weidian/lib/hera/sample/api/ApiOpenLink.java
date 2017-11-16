package com.weidian.lib.hera.sample.api;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.text.TextUtils;

import com.weidian.lib.hera.api.HeraApi;
import com.weidian.lib.hera.remote.IHostApiCallback;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * 调用扩展api示例，打开链接
 */
@HeraApi(names = {"openLink"})
public class ApiOpenLink implements IHostApi {

    private Context mContext;

    public ApiOpenLink(Context context) {
        mContext = context;
    }

    @Override
    public void invoke(String event, String params, IHostApiCallback callback) {
        JSONObject paramJson;
        try {
            paramJson = new JSONObject(params);
        } catch (JSONException e) {
            paramJson = new JSONObject();
        }

        if ("openLink".equals(event)) {
            String url = paramJson.optString("url");
            if (!TextUtils.isEmpty(url)) {
                Intent intent = new Intent();
                intent.setAction(Intent.ACTION_VIEW);
                Uri content_url = Uri.parse(url);
                intent.setData(content_url);
                mContext.startActivity(intent);
                callback.onResult(IHostApiCallback.SUCCEED, null);
            } else {
                callback.onResult(IHostApiCallback.FAILED, null);
            }
        }
    }
}
