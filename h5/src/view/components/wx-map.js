// add map sdk
export default !(function () {
  window.addEventListener('DOMContentLoaded', function () {
    var script = document.createElement('script')
    script.async = true
    script.type = 'text/javascript'
    script.src = 'https://map.qq.com/api/js?v=2.exp&callback=__map_jssdk_init'
    document.body.appendChild(script)
  })
  window.__map_jssdk_id = 0
  window.__map_jssdk_ready = !1
  window.__map_jssdk_callback = []
  window.__map_jssdk_init = function () {
    for (__map_jssdk_ready = !0; __map_jssdk_callback.length;) {
      var e = __map_jssdk_callback.pop()
      e()
    }
  }
})()

// wx-map
window.exparser.registerElement({
  is: 'wx-map',
  behaviors: ['wx-base', 'wx-native'],
  template: '<div id="map" style="width: 100%; height: 100%;"></div>',
  properties: {
    latitude: {
      type: Number,
      public: !0,
      observer: 'latitudeChanged',
      value: 39.92
    },
    longitude: {
      type: Number,
      public: !0,
      observer: 'longitudeChanged',
      value: 116.46
    },
    scale: {
      type: Number,
      public: !0,
      observer: 'scaleChanged',
      scale: 16
    },
    markers: {
      type: Array,
      value: [],
      public: !0,
      observer: 'markersChanged'
    },
    covers: {
      type: Array,
      value: [],
      public: !0,
      observer: 'coversChanged'
    },
    includePoints: {
      type: Array,
      value: [],
      public: !0,
      observer: 'pointsChanged'
    },
    polyline: {
      type: Array,
      value: [],
      public: !0,
      observer: 'linesChanged'
    },
    circles: {
      type: Array,
      value: [],
      public: !0,
      observer: 'circlesChanged'
    },
    controls: {
      type: Array,
      value: [],
      public: !0,
      observer: 'controlsChanged'
    },
    showLocation: {
      type: Boolean,
      value: !1,
      public: !0,
      observer: 'showLocationChanged'
    },
    bindmarkertap: {
      type: String,
      value: '',
      public: !0
    },
    bindcontroltap: {
      type: String,
      value: '',
      public: !0
    },
    bindregionchange: {
      type: String,
      value: '',
      public: !0
    },
    bindtap: {
      type: String,
      value: '',
      public: !0
    },
    _mapId: {
      type: Number
    }
  },
  _delay: function (cb, t, n) {
    this._deferred.push({
      callback: cb,
      args: [t, n]
    })
  },
  _update: function (opt, t) {
    ;(opt.mapId = this._mapId),
      (opt.hide = this.hidden),
      HeraJSBridge.invoke('updateMap', opt, function (e) {})
  },
  _updatePosition: function () {
    this._isMobile() &&
      (this._isiOS() &&
        ((this._box.width = this._box.width || 1),
        (this._box.height = this._box.height || 1)),
      HeraJSBridge.invoke(
        'updateMap',
        {
          mapId: this._mapId,
          position: this._box,
          covers: this.covers || []
        },
        function (e) {}
      ))
  },
  _transformPath: function (path, t) {
    return path.map(function (item) {
      var tempObj = {}
      return item.iconPath
        ? (Object.keys(item).forEach(function (itemName) {
          tempObj[itemName] = item[itemName]
        }),
          (tempObj.iconPath = wx.getRealRoute(t, tempObj.iconPath)),
          tempObj)
        : item
    })
  },
  _hiddenChanged: function (hide, t) {
    this._isMobile()
      ? ((this.$$.style.display = hide ? 'none' : ''),
        HeraJSBridge.invoke(
          'updateMap',
          {
            mapId: this._mapId,
            hide: hide
          },
          function (e) {}
        ))
      : (this.$$.style.display = hide ? 'none' : '')
  },
  _transformMarkers: function (markers) {
    var selof = this
    return (markers || []).map(function (marker) {
      var tempObj = {}
      return marker
        ? (Object.keys(marker).forEach(function (t) {
          tempObj[t] = marker[t]
        }),
          marker.name && (tempObj.title = tempObj.title || tempObj.name),
          typeof marker.id !== 'undefined' &&
            selof.bindmarkertap &&
            (tempObj.data = JSON.stringify({
              markerId: marker.id,
              bindmarkertap: selof.bindmarkertap
            })),
          tempObj)
        : tempObj
    })
  },
  _transformControls: function (ctrls) {
    var self = this
    return ctrls.map(function (ctrl) {
      var tempObj = {}
      Object.keys(ctrl).forEach(function (t) {
        tempObj[t] = ctrl[t]
      })
      typeof ctrl.id !== 'undefined' &&
        self.bindcontroltap &&
        ctrl.clickable &&
        (tempObj.data = JSON.stringify({
          controlId: ctrl.id,
          bindcontroltap: self.bindcontroltap
        }))
      return tempObj
    })
  },
  _transformColor: function (hexColor) {
    hexColor.indexOf('#') === 0 && (hexColor = hexColor.substr(1))
    var r = Number('0x' + hexColor.substr(0, 2)),
      g = Number('0x' + hexColor.substr(2, 2)),
      b = Number('0x' + hexColor.substr(4, 2)),
      a = hexColor.substr(6, 2) ? Number('0x' + hexColor.substr(6, 2)) / 255 : 1
    return new qq.maps.Color(r, g, b, a)
  },
  _initFeatures: function () {
    this._mapId &&
      (((this.markers && this.markers.length > 0) ||
        (this.covers && this.covers.length > 0)) &&
        HeraJSBridge.invoke(
          'addMapMarkers',
          {
            mapId: this._mapId,
            markers: this._transformMarkers(this.markers).concat(this.covers)
          },
          function (e) {}
        ),
      this.includePoints &&
        this.includePoints.length > 0 &&
        HeraJSBridge.invoke(
          'includeMapPoints',
          {
            mapId: this._mapId,
            points: this.includePoints
          },
          function (e) {}
        ),
      this.polyline &&
        this.polyline.length > 0 &&
        HeraJSBridge.invoke(
          'addMapLines',
          {
            mapId: this._mapId,
            lines: this.polyline
          },
          function (e) {}
        ),
      this.circles &&
        this.circles.length > 0 &&
        HeraJSBridge.invoke(
          'addMapCircles',
          {
            mapId: this._mapId,
            circles: this.circles
          },
          function (e) {}
        ),
      this.controls &&
        this.controls.length > 0 &&
        HeraJSBridge.invoke(
          'addMapControls',
          {
            mapId: this._mapId,
            controls: this._transformControls(this.controls)
          },
          function (e) {}
        ))
  },
  _insertNativeMap: function () {
    var self = this
    ;(this._box.width = this._box.width || 1),
      (this._box.height = this._box.height || 1)
    var opt = {
      position: this._box,
      centerLongitude: this.longitude,
      centerLatitude: this.latitude,
      scale: this.scale,
      covers: this.covers || [],
      hide: this.hidden,
      showLocation: this.showLocation
    }
    this._canInvokeNewFeature || (opt.markers = this.markers || [])
    HeraJSBridge.invoke('insertMap', opt, function (res) {
      ;/ok/.test(res.errMsg)
        ? ((self._mapId = res.mapId),
          self._ready(),
          self._canInvokeNewFeature &&
            HeraJSBridge.publish('mapInsert', {
              domId: self.id,
              mapId: self._mapId,
              showLocation: self.showLocation,
              bindregionchange: self.bindregionchange,
              bindtap: self.bindtap
            }),
          (self.__pageReRenderCallback = self._pageReRenderCallback.bind(self)),
          document.addEventListener(
            'pageReRender',
            self.__pageReRenderCallback
          ))
        : self.triggerEvent('error', {
          errMsg: res.errMsg
        })
    })
  },
  _insertIframeMap: function () {
    var self = this,
      map = (this._map = new qq.maps.Map(this.$.map, {
        zoom: this.scale,
        center: new qq.maps.LatLng(this.latitude, this.longitude),
        mapTypeId: qq.maps.MapTypeId.ROADMAP,
        zoomControl: !1,
        mapTypeControl: !1
      })),
      isDragging = !1,
      stopedDragging = !1
    qq.maps.event.addListener(map, 'click', function () {
      self.bindtap && wx.publishPageEvent(self.bindtap, {})
    })
    qq.maps.event.addListener(map, 'drag', function () {
      self.bindregionchange &&
        !isDragging &&
        (wx.publishPageEvent(self.bindregionchange, {
          type: 'begin'
        }),
        (isDragging = !0),
        (stopedDragging = !1))
    })
    qq.maps.event.addListener(map, 'dragend', function () {
      isDragging && ((isDragging = !1), (stopedDragging = !0))
    })
    qq.maps.event.addListener(map, 'bounds_changed', function () {
      self.bindregionchange &&
        stopedDragging &&
        (wx.publishPageEvent(self.bindregionchange, {
          type: 'end'
        }),
        (stopedDragging = !1))
    })
    var mapTitlesLoadedEvent = qq.maps.event.addListener(
      map,
      'tilesloaded',
      function () {
        self._mapId = __map_jssdk_id++
        self._ready()
        HeraJSBridge.subscribe('doMapAction' + self._mapId, function (res) {
          if (self._map && self._mapId === res.data.mapId) {
            if (res.data.method === 'getMapCenterLocation') {
              var center = self._map.getCenter()
              HeraJSBridge.publish('doMapActionCallback', {
                mapId: self._mapId,
                callbackId: res.data.callbackId,
                method: res.data.method,
                latitude: center.getLat(),
                longitude: center.getLng()
              })
            } else {
              res.data.method === 'moveToMapLocation' &&
                self.showLocation &&
                HeraJSBridge.invoke('private_geolocation', {}, function (res) {
                  try {
                    res = JSON.parse(res)
                  } catch (e) {
                    res = {}
                  }
                  if (res.result && res.result.location) {
                    var loc = res.result.location
                    self._posOverlay && self._posOverlay.setMap(null)
                    self._posOverlay = new self.CustomOverlay(
                      new qq.maps.LatLng(loc.lat, loc.lng)
                    )
                    self._posOverlay.setMap(self._map)
                    self._map.panTo(new qq.maps.LatLng(loc.lat, loc.lng))
                  }
                })
            }
          }
        })
        HeraJSBridge.publish('mapInsert', {
          domId: self.id,
          mapId: self._mapId,
          showLocation: self.showLocation,
          bindregionchange: self.bindregionchange,
          bindtap: self.bindtap
        })
        qq.maps.event.removeListener(mapTitlesLoadedEvent)
        mapTitlesLoadedEvent = null
      }
    )
    var CustomOverlay = (this.CustomOverlay = function (pos, idx) {
      this.index = idx
      this.position = pos
    })
    CustomOverlay.prototype = new qq.maps.Overlay()
    CustomOverlay.prototype.construct = function () {
      var div = (this.div = document.createElement('div'))
      div.setAttribute(
        'style',
        'width: 32px;height: 32px;background: rgba(31, 154, 228,.3);border-radius: 20px;position: absolute;'
      )
      var div2 = document.createElement('div')
      div2.setAttribute(
        'style',
        'position: absolute;width: 16px;height: 16px;background: white;border-radius: 8px;top: 8px;left: 8px;'
      )
      div.appendChild(div2)
      var div3 = document.createElement('div')
      div3.setAttribute(
        'style',
        'position: absolute;width: 12px;height: 12px;background: rgb(31, 154, 228);border-radius: 6px;top: 2px;left: 2px;'
      )
      div2.appendChild(div3)
      var panes = this.getPanes()
      panes.overlayMouseTarget.appendChild(div)
    }
    CustomOverlay.prototype.draw = function () {
      var projection = this.getProjection(),
        pixInfo = projection.fromLatLngToDivPixel(this.position),
        style = this.div.style
        ;(style.left = pixInfo.x - 16 + 'px'), (style.top = pixInfo.y - 16 + 'px')
    }
    CustomOverlay.prototype.destroy = function () {
      ;(this.div.onclick = null),
        this.div.parentNode.removeChild(this.div),
        (this.div = null)
    }
  },
  latitudeChanged: function (centerLatitude, t) {
    if (centerLatitude) {
      return this._isReady
        ? void (this._isMobile()
            ? this._update(
              {
                centerLatitude: centerLatitude,
                centerLongitude: this.longitude
              },
                '纬度'
              )
            : this._map.setCenter(
                new qq.maps.LatLng(centerLatitude, this.longitude)
              ))
        : void this._delay('latitudeChanged', centerLatitude, t)
    }
  },
  longitudeChanged: function (centerLongitude, t) {
    if (centerLongitude) {
      return this._isReady
        ? void (this._isMobile()
            ? this._update(
              {
                centerLatitude: this.latitude,
                centerLongitude: centerLongitude
              },
                '经度'
              )
            : this._map.setCenter(
                new qq.maps.LatLng(this.latitude, centerLongitude)
              ))
        : void this._delay('longitudeChanged', centerLongitude, t)
    }
  },
  scaleChanged: function () {
    var scale =
        arguments.length <= 0 || void 0 === arguments[0] ? 16 : arguments[0],
      arg2 = arguments[1]
    if (scale) {
      return this._isReady
        ? void (this._isMobile()
            ? this._update(
              {
                centerLatitude: this.latitude,
                centerLongitude: this.longitude,
                scale: scale
              },
                '缩放'
              )
            : this._map.zoomTo(scale))
        : void this._delay('scaleChanged', scale, arg2)
    }
  },
  coversChanged: function () {
    var self = this,
      arg1 =
        arguments.length <= 0 || void 0 === arguments[0] ? [] : arguments[0],
      arg2 = arguments[1]
    return this._isReady
      ? void (this._isMobile()
          ? wx.getCurrentRoute({
            success: function (n) {
              self._update(
                {
                  centerLatitude: self.latitude,
                  centerLongitude: self.longitude,
                  covers: self._transformPath(arg1, n.route)
                },
                  '覆盖物'
                )
            }
          })
          : ((this._covers || []).forEach(function (e) {
            e.setMap(null)
          }),
            (this._covers = arg1.map(function (t) {
              var n = new qq.maps.Marker({
                position: new qq.maps.LatLng(t.latitude, t.longitude),
                map: self._map
              })
              return (
                t.iconPath && n.setIcon(new qq.maps.MarkerImage(t.iconPath)), n
              )
            }))))
      : void this._delay('coversChanged', arg1, arg2)
  },
  markersChanged: function () {
    var self = this,
      markerArg =
        arguments.length <= 0 || void 0 === arguments[0] ? [] : arguments[0],
      arg2 = arguments[1]
    return this._isReady
      ? void (this._isMobile()
          ? wx.getCurrentRoute({
            success: function (res) {
              var markers = self._transformPath(
                  self._transformMarkers(markerArg),
                  res.route
                )
              self._canInvokeNewFeature
                  ? HeraJSBridge.invoke(
                      'addMapMarkers',
                    {
                      mapId: self._mapId,
                      markers: markers
                    },
                      function (e) {}
                    )
                  : self._update({
                    centerLatitude: self.latitude,
                    centerLongitude: self.longitude,
                    markers: markers
                  })
            }
          })
          : ((this._markers || []).forEach(function (e) {
            e.setMap(null)
          }),
            (this._markers = markerArg.map(function (markerItem) {
              var markerIns = new qq.maps.Marker({
                position: new qq.maps.LatLng(
                  markerItem.latitude,
                  markerItem.longitude
                ),
                map: self._map
              })
              return (
                markerItem.iconPath &&
                  (Number(markerItem.width) && Number(markerItem.height)
                    ? markerIns.setIcon(
                        new qq.maps.MarkerImage(
                          markerItem.iconPath,
                          new qq.maps.Size(markerItem.width, markerItem.height),
                          new qq.maps.Point(0, 0),
                          new qq.maps.Point(
                            markerItem.width / 2,
                            markerItem.height
                          ),
                          new qq.maps.Size(markerItem.width, markerItem.height)
                        )
                      )
                    : markerIns.setIcon(
                        new qq.maps.MarkerImage(markerItem.iconPath)
                      )),
                (markerItem.title || markerItem.name) &&
                  markerIns.setTitle(markerItem.title || markerItem.name),
                self.bindmarkertap &&
                  typeof markerItem.id !== 'undefined' &&
                  qq.maps.event.addListener(markerIns, 'click', function (n) {
                    var event = n.event
                    event instanceof TouchEvent
                      ? event.type === 'touchend' &&
                        wx.publishPageEvent(self.bindmarkertap, {
                          markerId: markerItem.id
                        })
                      : wx.publishPageEvent(self.bindmarkertap, {
                        markerId: markerItem.id
                      })
                  }),
                markerIns
              )
            }))))
      : void this._delay('markersChanged', markerArg, arg2)
  },
  linesChanged: function () {
    var self = this,
      lines =
        arguments.length <= 0 || void 0 === arguments[0] ? [] : arguments[0],
      arg2 = arguments[1]
    return this._isReady
      ? void (this._isMobile()
          ? this._canInvokeNewFeature &&
            HeraJSBridge.invoke(
              'addMapLines',
              {
                mapId: this._mapId,
                lines: lines
              },
              function (e) {}
            )
          : ((this._lines || []).forEach(function (e) {
            e.setMap(null)
          }),
            (this._lines = lines.map(function (line) {
              var path = line.points.map(function (point) {
                return new qq.maps.LatLng(point.latitude, point.longitude)
              })
              return new qq.maps.Polyline({
                map: self._map,
                path: path,
                strokeColor: self._transformColor(line.color) || '',
                strokeWidth: line.width,
                strokeDashStyle: line.dottedLine ? 'dash' : 'solid'
              })
            }))))
      : void this._delay('linesChanged', lines, arg2)
  },
  circlesChanged: function () {
    var self = this,
      circles =
        arguments.length <= 0 || void 0 === arguments[0] ? [] : arguments[0],
      arg2 = arguments[1]
    return this._isReady
      ? void (this._isMobile()
          ? this._canInvokeNewFeature &&
            HeraJSBridge.invoke(
              'addMapCircles',
              {
                mapId: this._mapId,
                circles: circles
              },
              function (e) {}
            )
          : ((this._circles || []).forEach(function (circle) {
            circle.setMap(null)
          }),
            (this._circles = circles.map(function (circle) {
              return new qq.maps.Circle({
                map: self._map,
                center: new qq.maps.LatLng(circle.latitude, circle.longitude),
                radius: circle.radius,
                fillColor: self._transformColor(circle.fillColor) || '',
                strokeColor: self._transformColor(circle.color) || '',
                strokeWidth: circle.strokeWidth
              })
            }))))
      : void this._delay('circlesChanged', circles, arg2)
  },
  pointsChanged: function () {
    var self = this,
      points =
        arguments.length <= 0 || void 0 === arguments[0] ? [] : arguments[0],
      n = arguments[1]
    if (!this._isReady) return void this._delay('pointsChanged', points, n)
    if (this._isMobile()) {
      this._canInvokeNewFeature &&
        HeraJSBridge.invoke(
          'includeMapPoints',
          {
            mapId: this._mapId,
            points: points
          },
          function (e) {}
        )
    } else {
      var i = (function () {
        if (points.length <= 0) {
          return {
            v: void 0
          }
        }
        var LatLngBounds = new qq.maps.LatLngBounds()
        points.forEach(function (point) {
          LatLngBounds.extend(
            new qq.maps.LatLng(point.latitude, point.longitude)
          )
        })
        self._map.fitBounds(LatLngBounds)
      })()
      if (typeof i === 'object') return i.v
    }
  },
  controlsChanged: function () {
    var self = this,
      nCtrl =
        arguments.length <= 0 || void 0 === arguments[0] ? [] : arguments[0],
      n = arguments[1]
    return this._isReady
      ? void (this._isMobile()
          ? this._canInvokeNewFeature &&
            wx.getCurrentRoute({
              success: function (res) {
                var controls = self._transformPath(
                  self._transformControls(nCtrl),
                  res.route
                )
                HeraJSBridge.invoke(
                  'addMapControls',
                  {
                    mapId: self._mapId,
                    controls: controls
                  },
                  function (e) {}
                )
              }
            })
          : !(function () {
            for (
                var ctrs = (self._controls = self._controls || []);
                ctrs.length;

              ) {
              var ctr = ctrs.pop()
              ctr.onclick = null
              ctr.parentNode.removeChild(ctr)
            }
            nCtrl.forEach(function (ctr) {
              var img = document.createElement('img')
              img.style.position = 'absolute'
              img.style.left =
                  ((ctr.position && ctr.position.left) || 0) + 'px'
              img.style.top = ((ctr.position && ctr.position.top) || 0) + 'px'
              img.style.width =
                  ((ctr.position && ctr.position.width) || '') + 'px'
              img.style.height =
                  ((ctr.position && ctr.position.height) || '') + 'px'
              img.style.zIndex = 9999
              img.src = ctr.iconPath
              ctr.clickable &&
                  typeof ctr.id !== 'undefined' &&
                  (img.onclick = function () {
                    wx.publishPageEvent(self.bindcontroltap, {
                      controlId: ctr.id
                    })
                  })
              ctrs.push(img)
              self.$.map.appendChild(img)
            })
          })())
      : void this._delay('controlsChanged', nCtrl, n)
  },
  showLocationChanged: function () {
    var self = this,
      location =
        !(arguments.length <= 0 || void 0 === arguments[0]) && arguments[0],
      arg2 = arguments[1]
    return this._isReady
      ? void (this._isMobile()
          ? this._update({
            showLocation: location
          })
          : (this._posOverlay &&
              (this._posOverlay.setMap(null), (this._posOverlay = null)),
            location &&
              HeraJSBridge.invoke('private_geolocation', {}, function (res) {
                try {
                  res = JSON.parse(res)
                } catch (e) {
                  res = {}
                }
                if (res.result && res.result.location) {
                  var loc = res.result.location
                  ;(self._posOverlay = new self.CustomOverlay(
                    new qq.maps.LatLng(loc.lat, loc.lng)
                  )),
                    self._posOverlay.setMap(self._map)
                }
              })))
      : void this._delay('showLocationChanged', location, arg2)
  },
  attached: function () {
    return this.latitude > 90 || this.latitude < -90
      ? (console.group(new Date() + ' latitude 字段取值有误'),
        console.warn('纬度范围 -90 ~ 90'),
        void console.groupEnd())
      : this.longitude > 180 || this.longitude < -180
        ? (console.group(new Date() + ' longitude 字段取值有误'),
          console.warn('经度范围 -180 ~ 180'),
          void console.groupEnd())
        : ((this._canInvokeNewFeature = !0),
          (this._box = this._getBox()),
          void (this._isMobile()
            ? this._insertNativeMap()
            : __map_jssdk_ready
              ? this._insertIframeMap()
              : __map_jssdk_callback.push(this._insertIframeMap.bind(this))))
  },
  detached: function () {
    this._isMobile() &&
      (HeraJSBridge.invoke(
        'removeMap',
        {
          mapId: this._mapId
        },
        function (e) {}
      ),
      this.__pageReRenderCallback &&
        document.removeEventListener(
          'pageReRender',
          this.__pageReRenderCallback
        ))
  }
})
