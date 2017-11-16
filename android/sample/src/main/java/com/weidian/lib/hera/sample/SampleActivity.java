package com.weidian.lib.hera.sample;

import android.app.Activity;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.view.View;

import com.weidian.lib.hera.main.HeraService;

public class SampleActivity extends Activity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.sample_activity);

        final String userId = "123";//标识宿主App业务用户id
        final String appId = "demoapp";//小程序的id
        final String appPath = "";//小程序的本地存储路径
        //sdk内部会首先读取并解压appPath下的小程序包，若appPath为空，则读取并解压assets下以appId命名的zip文件
        //小程序解压后将存储在以appId命名的文件夹下
        findViewById(R.id.enter_hera).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                HeraService.launchHome(getApplicationContext(), userId, appId, appPath);
            }
        });
    }

}
