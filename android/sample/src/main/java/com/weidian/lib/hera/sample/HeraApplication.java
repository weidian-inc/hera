package com.weidian.lib.hera.sample;

import android.app.Application;

import com.weidian.lib.hera.config.HeraConfig;
import com.weidian.lib.hera.main.HeraService;
import com.weidian.lib.hera.sample.api.ApiOpenLink;
import com.weidian.lib.hera.sample.api.ApiOpenPageForResult;
import com.weidian.lib.hera.trace.HeraTrace;

public class HeraApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();

        //在主进程中初始化框架配置，启动框架服务进程
        if (HeraTrace.isMainProcess(this)){
            HeraConfig config = new HeraConfig.Builder()
                    .addExtendsApi(new ApiOpenLink(getApplicationContext()))
                    .addExtendsApi(new ApiOpenPageForResult())
                    .setDebug(true)
                    .build();
            HeraService.start(this.getApplicationContext(), config);
        }
    }
}
