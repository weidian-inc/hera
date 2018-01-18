package com.weidian.lib.hera.utils;

import android.content.Context;
import android.content.Intent;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationManager;
import android.provider.Settings;

import java.util.List;

/**
 * Created by giraffe on 2018/1/18.
 */

public class LocationUtils {
    private LocationUtils(){}

    /**
     * 当前GPS定位服务是否可用
     * @param context
     * @return
     */
    public static boolean isLocationEnabled(Context context) {
        LocationManager lm = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        return lm != null && (lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER) || lm.isProviderEnabled(LocationManager.GPS_PROVIDER));
    }


    /**
     * 打开Gps设置界面
     */
    public static void openGpsSettings(Context context) {
        Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }

    public static Location getLocation(Context context,boolean needAltitude){
        Location location=null;
        LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        if (locationManager!=null){

            Criteria criteria = new Criteria();
            //设置定位精确度 Criteria.ACCURACY_COARSE比较粗略，Criteria.ACCURACY_FINE则比较精细
            criteria.setAccuracy(Criteria.ACCURACY_FINE);
            criteria.setAltitudeRequired(needAltitude);
            criteria.setBearingRequired(false);
            criteria.setCostAllowed(true);
            criteria.setSpeedRequired(false);
            criteria.setPowerRequirement(Criteria.POWER_HIGH);
            // 获得当前的位置提供者
            String provider = locationManager.getBestProvider(criteria, true);
            if (provider!=null){
                location = locationManager.getLastKnownLocation(provider);
            }
            if (location==null){
                location=locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
            }
            if (location==null){
                location = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
            }
        }

        return location;
    }

    private static Location getLastKnownLocation(Context context) {
        LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        List<String> providers = locationManager.getProviders(true);
        Location bestLocation = null;
        for (String provider : providers) {
            Location l = locationManager.getLastKnownLocation(provider);
            if (l == null) {
                continue;
            }
            if (bestLocation == null || l.getAccuracy() < bestLocation.getAccuracy()) {
                // Found best last known location: %s", l);
                bestLocation = l;
            }
        }
        return bestLocation;
    }
}
