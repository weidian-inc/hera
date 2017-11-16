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


package com.weidian.lib.hera.interfaces;

/**
 * 事件监听接口
 */
public interface OnEventListener {

    /**
     * Service层触发，表示Service已准备完毕，且已获取应用的配置信息
     */
    void onServiceReady();

    /**
     * Service层触发，通知View层的订阅处理器处理
     *
     * @param event   事件名称
     * @param params  参数
     * @param viewIds 视图id数组
     */
    void notifyPageSubscribeHandler(String event, String params, int[] viewIds);

    /**
     * Page层触发，通知Service层的订阅处理器处理
     *
     * @param event  事件名称
     * @param params 参数
     * @param viewId 视图id
     */
    void notifyServiceSubscribeHandler(String event, String params, int viewId);

    /**
     * Service层触发，通知Page层处理页面相关api事件
     *
     * @param event  事件名称
     * @param params 参数
     * @return true：事件处理成功，否则亦然
     */
    boolean onPageEvent(String event, String params);
}
