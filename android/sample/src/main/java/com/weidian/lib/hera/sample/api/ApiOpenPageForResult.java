package com.weidian.lib.hera.sample.api;

import com.weidian.lib.hera.api.HeraApi;
import com.weidian.lib.hera.remote.IHostApiCallback;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * 调用扩展api示例，打开某个可返回结果的Activity
 */
@HeraApi(names = {"openPageForResult"})
public class ApiOpenPageForResult implements IHostApi {

    @Override
    public void invoke(String event, String params, IHostApiCallback callback) {
        //根据params参数打开指定页面，由小程序业务定义
        JSONObject resultJson = new JSONObject();
        try {//示例
            resultJson.put("package", "com.weidian.lib.hera.sample");
            resultJson.put("name", "com.weidian.lib.hera.sample.ForResultActivity");
            resultJson.put("params", params);
            callback.onResult(IHostApiCallback.PENDING, resultJson);
        } catch (JSONException e) {
            callback.onResult(IHostApiCallback.FAILED, null);
            return;
        }
        callback.onResult(IHostApiCallback.SUCCEED, resultJson);
    }
}
