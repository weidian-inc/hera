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


package com.weidian.lib.hera.page.view;

import android.content.Context;
import android.util.TypedValue;
import android.view.Gravity;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.bumptech.glide.Glide;
import com.weidian.lib.hera.R;
import com.weidian.lib.hera.config.AppConfig;
import com.weidian.lib.hera.model.TabItemInfo;
import com.weidian.lib.hera.utils.ColorUtil;


/**
 * Tab项视图
 */
public class TabItemView extends LinearLayout {

    private ImageView mIcon;
    private TextView mName;
    private TabItemInfo mInfo;
    private String mSourcePath;

    public TabItemView(Context context, AppConfig appConfig) {
        super(context);
        init(context);
        mSourcePath = appConfig.getMiniAppSourcePath(context);
    }

    private void init(Context context) {
        setOrientation(VERTICAL);
        setGravity(Gravity.CENTER);
        inflate(context, R.layout.hera_tab_item, this);
        mIcon = (ImageView) findViewById(R.id.item_icon);
        mName = (TextView) findViewById(R.id.item_name);
    }

    public void setInfo(TabItemInfo info) {
        mInfo = info;
    }

    public TabItemInfo getInfo() {
        return mInfo;
    }

    public String getPagePath() {
        return mInfo != null ? mInfo.pagePath : "";
    }

    public void setTop(boolean isTop) {
        int textSize;
        int padding;
        if (isTop) {
            padding = getResources().getDimensionPixelSize(R.dimen.tab_bar_padding_l);
            textSize = getResources().getDimensionPixelSize(R.dimen.tab_bar_text_size_l);
            mIcon.setVisibility(GONE);
        } else {
            padding = getResources().getDimensionPixelSize(R.dimen.tab_bar_padding_s);
            textSize = getResources().getDimensionPixelSize(R.dimen.tab_bar_text_size_s);
            mIcon.setVisibility(VISIBLE);
        }
        setPadding(0, padding, 0, padding);
        mName.setTextSize(TypedValue.COMPLEX_UNIT_PX, textSize);
    }

    @Override
    public void setSelected(boolean selected) {
        super.setSelected(selected);
        if (mInfo == null) {
            return;
        }
        String color;
        String icon;
        if (selected) {
            color = mInfo.selectedColor;
            icon = mInfo.selectedIconPath;
        } else {
            color = mInfo.color;
            icon = mInfo.iconPath;
        }
        mName.setTextColor(ColorUtil.parseColor(color));
        mName.setText(mInfo.text);
        String iconUrl = mSourcePath + icon;
        if (mIcon.getVisibility() == VISIBLE) {

            Glide.with(getContext())
                    .load(iconUrl)
                    .into(mIcon);

        }
    }
}
