package com.weidian.lib.hera.api.location;

import android.content.Context;
import android.location.Location;
import android.widget.Toast;

import com.weidian.lib.hera.api.AbsModule;
import com.weidian.lib.hera.api.HeraApi;
import com.weidian.lib.hera.interfaces.IApiCallback;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.LocationUtils;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by giraffe on 2018/1/18.
 */
@HeraApi(names = {"getLocation"})
public class RequestLocationModule extends AbsModule {
    private final static String TYPE_WGS84 = "wgs84";
    private final static String TYPE_GCJ02 = "gcj02";

    public RequestLocationModule(Context context) {
        super(context);
    }

    @Override
    public void invoke(String event, String params, IApiCallback callback) {
        if ("getLocation".equals(event)) {
            getLocation(event, params, callback);
        }
    }


    public void getLocation(String event, String params, IApiCallback callback) {
        String type = TYPE_WGS84;
        boolean altitude = false;

        try {
            JSONObject paramsJson = new JSONObject(params);
            type = paramsJson.optString("type", TYPE_WGS84);
            altitude = paramsJson.optBoolean("altitude", false);
        } catch (JSONException e) {
            callback.onResult(packageResultData(event, RESULT_FAIL, null));
            return;
        }

        if (!LocationUtils.isLocationEnabled(getContext())){
            Toast.makeText(getContext(),"请打开定位服务",Toast.LENGTH_SHORT).show();
            callback.onResult(packageResultData(event, RESULT_FAIL, null));
            return;
        }else {
            Location location=LocationUtils.getLocation(getContext(),altitude);
            if (location==null){
                callback.onResult(packageResultData(event, RESULT_FAIL, null));
                return;
            }else {
                JSONObject data=new JSONObject();
                try {
                    data.put("latitude",location.getLatitude());
                    data.put("longitude",location.getLongitude());
                    data.put("speed",location.getSpeed());
                    data.put("accuracy",location.getAccuracy());
                    data.put("altitude",location.getAltitude());
                    data.put("verticalAccuracy",0);
                    data.put("horizontalAccuracy",0);
                } catch (JSONException e) {
                    HeraTrace.w(TAG, "request success, assemble data to json error!");
                    callback.onResult(packageResultData(event, RESULT_FAIL, null));
                    return;
                }
                callback.onResult(packageResultData(event, RESULT_OK, data));

            }
        }


    }
}
