/*
 * Copyright (C) 2009 ZXing authors
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

import com.google.zxing.ResultPoint;
import com.google.zxing.ResultPointCallback;

public class ViewfinderResultPointCallback implements ResultPointCallback {

  private final AutoScannerView viewfinderView;

  public ViewfinderResultPointCallback(AutoScannerView viewfinderView) {
    this.viewfinderView = viewfinderView;
  }

  @Override
  public void foundPossibleResultPoint(ResultPoint point) {
    if(viewfinderView == null)
      return;
//    viewfinderView.addPossibleResultPoint(point);
  }

}
