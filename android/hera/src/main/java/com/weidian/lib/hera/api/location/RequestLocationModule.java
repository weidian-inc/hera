//
// Copyright (c) 2018, weidian.com
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


package com.weidian.lib.hera.api.location;

import android.content.Context;
import android.location.Location;
import android.widget.Toast;

import com.weidian.lib.hera.api.BaseApi;
import com.weidian.lib.hera.interfaces.ICallback;
import com.weidian.lib.hera.trace.HeraTrace;
import com.weidian.lib.hera.utils.LocationUtils;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * 获取定位信息
 */
public class RequestLocationModule extends BaseApi {
    private final static String TYPE_WGS84 = "wgs84";
    private final static String TYPE_GCJ02 = "gcj02";

    public RequestLocationModule(Context context) {
        super(context);
    }

    @Override
    public String[] apis() {
        return new String[]{"getLocation"};
    }

    @Override
    public void invoke(String event, JSONObject param, ICallback callback) {
        String type = param.optString("type", TYPE_WGS84);
        boolean altitude = param.optBoolean("altitude", false);

        if (!LocationUtils.isLocationEnabled(getContext())) {
            Toast.makeText(getContext(), "请打开定位服务", Toast.LENGTH_SHORT).show();
            callback.onFail();
            return;
        }

        Location location = LocationUtils.getLocation(getContext(), altitude);
        if (location != null) {
            try {
                JSONObject data = new JSONObject();
                data.put("latitude", location.getLatitude());
                data.put("longitude", location.getLongitude());
                data.put("speed", location.getSpeed());
                data.put("accuracy", location.getAccuracy());
                data.put("altitude", location.getAltitude());
                data.put("verticalAccuracy", 0);
                data.put("horizontalAccuracy", 0);
                callback.onSuccess(data);
                return;
            } catch (JSONException e) {
                HeraTrace.e(TAG, "getLocation assemble result exception!");
            }
        }
        callback.onFail();
    }

}
