package com.weidian.lib.hera.sample.api;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.text.TextUtils;

import com.weidian.lib.hera.api.AbsApi;
import com.weidian.lib.hera.interfaces.ICallback;

import org.json.JSONObject;

/**
 * 调用扩展api示例，打开链接
 */
public class ApiOpenLink extends AbsApi {

    private Context mContext;

    public ApiOpenLink(Context context) {
        mContext = context;
    }

    @Override
    public String[] apis() {
        return new String[]{"openLink"};
    }

    @Override
    public void invoke(String event, JSONObject param, ICallback callback) {
        String url = param.optString("url");
        if (!TextUtils.isEmpty(url)) {
            Intent intent = new Intent();
            intent.setAction(Intent.ACTION_VIEW);
            Uri uri = Uri.parse(url);
            intent.setData(uri);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            mContext.startActivity(intent);
            callback.onSuccess(null);
        } else {
            callback.onFail();
        }
    }
}
