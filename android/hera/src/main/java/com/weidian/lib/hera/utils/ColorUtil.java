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


package com.weidian.lib.hera.utils;

import android.graphics.Color;
import android.text.TextUtils;

/**
 * 颜色操作工具类
 */
public class ColorUtil {

    private ColorUtil() {
    }

    /**
     * 解析颜色值，支持"#rrggbb"和"#rgb"格式
     *
     * @param colorString 颜色字符串
     * @return 颜色值
     */
    public static int parseColor(String colorString) {
        return parseColor(colorString, Color.TRANSPARENT);
    }

    /**
     * 解析颜色值，支持"#rrggbb"和"#rgb"格式
     *
     * @param colorString  颜色字符串
     * @param defaultColor 默认颜色值，解析失败时返回
     * @return 颜色值
     */
    public static int parseColor(String colorString, int defaultColor) {
        if (TextUtils.isEmpty(colorString)) {
            return defaultColor;
        }

        if (colorString.charAt(0) == '#' && colorString.length() == 4) {
            char r = colorString.charAt(1);
            char g = colorString.charAt(2);
            char b = colorString.charAt(3);
            String rrggbb = new StringBuilder()
                    .append("#")
                    .append(r).append(r)
                    .append(g).append(g)
                    .append(b).append(b)
                    .toString();
            return Color.parseColor(rrggbb);
        }

        try {
            return Color.parseColor(colorString);
        } catch (Exception e) {
            return defaultColor;
        }
    }
}
