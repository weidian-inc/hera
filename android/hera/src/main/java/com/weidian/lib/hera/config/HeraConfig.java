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

import com.weidian.lib.hera.remote.IHostApiDispatcher;

/**
 * Hera框架的配置信息
 */
public class HeraConfig {

    public static final String VERSION = "1.0.0";

    private IHostApiDispatcher mDispatcher;
    private boolean mDebug;

    private HeraConfig(Builder builder) {
        mDispatcher = builder.dispatcher;
        mDebug = builder.debug;
    }

    public IHostApiDispatcher hostApiDispatcher() {
        return mDispatcher;
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

        private IHostApiDispatcher dispatcher;
        private boolean debug;

        /**
         * 设置宿主的api派发处理器
         *
         * @param dispatcher 扩展api的分发器
         * @return Builder对象
         */
        public Builder setHostApiDispatcher(IHostApiDispatcher dispatcher) {
            this.dispatcher = dispatcher;
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
