/*
 * Copyright (C) 2008 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * modified by weidian.com
 */

package com.weidian.lib.hera.scancode.ui.view;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.Rect;
import android.graphics.drawable.BitmapDrawable;
import android.util.AttributeSet;
import android.view.View;

import com.weidian.lib.hera.R;
import com.weidian.lib.hera.scancode.camera.CameraManager;

import static android.graphics.PixelFormat.OPAQUE;

/**
 * 自动上下扫描
 */

public class AutoScannerView extends View {

    private static final String TAG = AutoScannerView.class.getSimpleName();
    private Bitmap resultBitmap;
    private Paint maskPaint;
    private Paint linePaint;
    private Paint traAnglePaint;
    private Paint textPaint;
    private CameraManager cameraManager;

    private final int maskColor = Color.parseColor("#60000000");                          //蒙在摄像头上面区域的半透明颜色
    private final int triAngleColor = Color.parseColor("#FF0000");                        //边角的颜色
    private final int lineColor = Color.parseColor("#FF0000");                            //中间线的颜色
    private final int textColor = Color.parseColor("#CCCCCC");                            //文字的颜色
    private final int triAngleLength = dp2px(20);                                         //每个角的点距离
    private final int triAngleWidth = dp2px(4);                                           //每个角的点宽度
    private final int textMarinTop = dp2px(30);                                           //文字距离识别框的距离
    private int lineOffsetCount = 0;

    public AutoScannerView(Context context, AttributeSet attrs) {
        super(context, attrs);
        maskPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        maskPaint.setColor(maskColor);

        traAnglePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        traAnglePaint.setColor(triAngleColor);
        traAnglePaint.setStrokeWidth(triAngleWidth);
        traAnglePaint.setStyle(Paint.Style.STROKE);

        linePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        linePaint.setColor(lineColor);

        textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        textPaint.setColor(textColor);
        textPaint.setTextSize(dp2px(14));
    }

    public void setCameraManager(CameraManager cameraManager) {
        this.cameraManager = cameraManager;
        invalidate();//重新进入可能不刷新，所以调用一次。
    }

    @Override
    protected void onDraw(Canvas canvas) {
        if (cameraManager == null)
            return;
        Rect frame = cameraManager.getFramingRect();
        Rect previewFrame = cameraManager.getFramingRectInPreview();
        if (frame == null || previewFrame == null) {
            return;
        }

        int width = canvas.getWidth();
        int height = canvas.getHeight();
        if (resultBitmap != null) {
            // Draw the opaque result bitmap over the scanning rectangle
            textPaint.setAlpha(OPAQUE);
            canvas.drawBitmap(resultBitmap, frame.left, frame.top, textPaint);
        } else {
            // 除了中间的识别区域，其他区域都将蒙上一层半透明的图层
            canvas.drawRect(0, 0, width, frame.top, maskPaint);
            canvas.drawRect(0, frame.top, frame.left, frame.bottom + 1, maskPaint);
            canvas.drawRect(frame.right + 1, frame.top, width, frame.bottom + 1, maskPaint);
            canvas.drawRect(0, frame.bottom + 1, width, height, maskPaint);

            String text = "将二维码放入框内，即可自动扫描";
            canvas.drawText(text, (width - textPaint.measureText(text)) / 2, frame.bottom + textMarinTop, textPaint);

            // 四个角落的三角
            Path leftTopPath = new Path();
            leftTopPath.moveTo(frame.left + triAngleLength, frame.top + triAngleWidth / 2);
            leftTopPath.lineTo(frame.left + triAngleWidth / 2, frame.top + triAngleWidth / 2);
            leftTopPath.lineTo(frame.left + triAngleWidth / 2, frame.top + triAngleLength);
            canvas.drawPath(leftTopPath, traAnglePaint);

            Path rightTopPath = new Path();
            rightTopPath.moveTo(frame.right - triAngleLength, frame.top + triAngleWidth / 2);
            rightTopPath.lineTo(frame.right - triAngleWidth / 2, frame.top + triAngleWidth / 2);
            rightTopPath.lineTo(frame.right - triAngleWidth / 2, frame.top + triAngleLength);
            canvas.drawPath(rightTopPath, traAnglePaint);

            Path leftBottomPath = new Path();
            leftBottomPath.moveTo(frame.left + triAngleWidth / 2, frame.bottom - triAngleLength);
            leftBottomPath.lineTo(frame.left + triAngleWidth / 2, frame.bottom - triAngleWidth / 2);
            leftBottomPath.lineTo(frame.left + triAngleLength, frame.bottom - triAngleWidth / 2);
            canvas.drawPath(leftBottomPath, traAnglePaint);

            Path rightBottomPath = new Path();
            rightBottomPath.moveTo(frame.right - triAngleLength, frame.bottom - triAngleWidth / 2);
            rightBottomPath.lineTo(frame.right - triAngleWidth / 2, frame.bottom - triAngleWidth / 2);
            rightBottomPath.lineTo(frame.right - triAngleWidth / 2, frame.bottom - triAngleLength);
            canvas.drawPath(rightBottomPath, traAnglePaint);

            //循环划线，从上到下
            if (lineOffsetCount > frame.bottom - frame.top - dp2px(10)) {
                lineOffsetCount = 0;
            } else {
                lineOffsetCount = lineOffsetCount + 6;
//            canvas.drawLine(frame.left, frame.top + lineOffsetCount, frame.right, frame.top + lineOffsetCount, linePaint);    //画一条红色的线
                Rect lineRect = new Rect();
                lineRect.left = frame.left;
                lineRect.top = frame.top + lineOffsetCount;
                lineRect.right = frame.right;
                lineRect.bottom = frame.top + dp2px(10) + lineOffsetCount;
                canvas.drawBitmap(((BitmapDrawable) (getResources().getDrawable(R.drawable.hera_scancode_scanline))).getBitmap(), null, lineRect, linePaint);
            }
            postInvalidateDelayed(10L, frame.left, frame.top, frame.right, frame.bottom);
        }
    }

    private int dp2px(int dp) {
        float density = getContext().getResources().getDisplayMetrics().density;
        return (int) (dp * density + 0.5f);
    }

    public void drawViewfinder() {
        resultBitmap = null;
        invalidate();
    }

    /**
     * Draw a bitmap with the result points highlighted instead of the live
     * scanning display.
     *
     * @param barcode An image of the decoded barcode.
     */
    public void drawResultBitmap(Bitmap barcode) {
        resultBitmap = barcode;
        invalidate();
    }
}
