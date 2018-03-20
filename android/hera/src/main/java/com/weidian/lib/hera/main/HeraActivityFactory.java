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


package com.weidian.lib.hera.main;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by libai on 2018/3/19.
 */

/**
 * 小程序进程工厂 最多支持同时开启五个小程序
 */
public class HeraActivityFactory {

    private final int MAX_CACHE_SIZE = 5;
    private final float DEFAULT_LOAD_FACTORY = 0.75f;

    private LinkedHashMap<String, Class<?>> mActivityMap;


    public HeraActivityFactory() {
        int capacity = (int) Math.ceil(MAX_CACHE_SIZE / DEFAULT_LOAD_FACTORY) + 1;
        mActivityMap = new LinkedHashMap<String, Class<?>>(capacity, DEFAULT_LOAD_FACTORY, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, Class<?>> eldest) {
                return size() > MAX_CACHE_SIZE;
            }
        };
        mActivityMap.put(HeraActivity.class.getName(), HeraActivity.class);
        mActivityMap.put(HeraActivity1.class.getName(), HeraActivity1.class);
        mActivityMap.put(HeraActivity2.class.getName(), HeraActivity2.class);
        mActivityMap.put(HeraActivity3.class.getName(), HeraActivity3.class);
        mActivityMap.put(HeraActivity4.class.getName(), HeraActivity4.class);
    }

    public synchronized Class<?> get(String appId) {
        Class<?> clz;
        if ((clz = mActivityMap.get(appId)) == null) {
            List<Class<?>> activityList = new ArrayList<>(mActivityMap.values());
            clz = activityList.get(0);
            mActivityMap.put(appId, clz);
        }
        return clz;
    }

    public synchronized void remove(String appId) {
        Class<?> clz = mActivityMap.get(appId);
        if (clz != null) {
            mActivityMap.remove(appId);
            LinkedHashMap<String, Class<?>> newMap = new LinkedHashMap<>();
            newMap.put(clz.getName(), clz);
            newMap.putAll(mActivityMap);
            mActivityMap = newMap;
        }
    }

}
