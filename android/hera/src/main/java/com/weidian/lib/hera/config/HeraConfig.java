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


package com.weidian.lib.hera.config;

import android.text.TextUtils;

import com.weidian.lib.hera.interfaces.IApi;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Hera框架的配置信息
 */
public class HeraConfig {

    public static final String VERSION = "2.0.0";

    private Map<String, IApi> mExtendsApi;
    private boolean mDebug;

    private HeraConfig(Builder builder) {
        mExtendsApi = builder.extendsApi;
        mDebug = builder.debug;
    }

    public Map<String, IApi> getExtendsApi() {
        return mExtendsApi;
    }

    /**
     * 是否是debug模式
     *
     * @return true：调试模式，否则亦然
     */
    public boolean isDebug() {
        return mDebug;
    }


    public static class Builder {

        private Map<String, IApi> extendsApi;
        private boolean debug;

        /**
         * 添加扩展api
         *
         * @param api 实现特定功能的api实例对象
         * @return Builder对象
         */
        public Builder addExtendsApi(IApi api) {
            if (extendsApi == null) {
                extendsApi = new HashMap<>();
            }
            if (api != null && api.apis() != null && api.apis().length > 0) {
                String[] apiNames = api.apis();
                for (String name : apiNames) {
                    if (!TextUtils.isEmpty(name)) {
                        extendsApi.put(name, api);
                    }
                }
            }
            return this;
        }

        /**
         * 添加扩展api
         *
         * @param apiList 特定功能的一组api列表
         * @return Builder对象
         */
        public Builder addExtendsApi(List<IApi> apiList) {
            if (extendsApi == null) {
                extendsApi = new HashMap<>();
            }
            if (apiList != null && !apiList.isEmpty()) {
                for (IApi api : apiList) {
                    addExtendsApi(api);
                }
            }
            return this;
        }

        /**
         * 设置调试模式
         *
         * @param debug true：调试模式，false：非调试模式
         * @return Builder对象
         */
        public Builder setDebug(boolean debug) {
            this.debug = debug;
            return this;
        }

        public HeraConfig build() {
            return new HeraConfig(this);
        }
    }
}
