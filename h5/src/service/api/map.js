//1-8 map相关事件和方法

import pubsub from './bridge'
import utils from './utils'
import EventEmitter2 from './EventEmitter2'

function notifyWebviewIdtoMap(e) {
    webviewID = e
}

var mapIds = {},
    mapInfo = {},
    EventEmitter = new EventEmitter2.EventEmitter2,
    webviewID = 0,
    callbackIndex = 0;

ServiceJSBridge.subscribe("mapInsert", function (params, viewId) {
    var domId = params.domId,
        mapId = params.mapId,
        bindregionchange = params.bindregionchange,
        bindtap = params.bindtap,
        showLocation = params.showLocation,
        key = viewId + "_" + domId;
    mapIds[key] = mapIds[key] || mapId

    mapInfo[viewId + "_" + mapId] = {
        bindregionchange: bindregionchange,
        bindtap: bindtap,
        showLocation: showLocation
    }
    EventEmitter.emit("mapInsert")
});


class MapContext {
    constructor(mapId) {
        var that = this;
        if ("string" != typeof mapId) throw new Error("map ID should be a String");
        this.domId = mapId

        ServiceJSBridge.subscribe("doMapActionCallback", function (event, t) {
            var callbackId = event.callbackId;
            "getMapCenterLocation" === event.method && callbackId && "function" == typeof that[callbackId] &&
            (that[callbackId]({
                longitude: event.longitude,
                latitude: event.latitude
            }), delete that[callbackId])
        })
    }

    _invoke(methodName, params) {
        var platform = utils.getPlatform();
        if ("ios" === platform || "android" === platform) {
            var curMapInfo = mapInfo[webviewID + "_" + params.mapId];
            if ("moveToMapLocation" === methodName) {
                return void(curMapInfo && curMapInfo.showLocation ? pubsub.invokeMethod(methodName, params) : console.error("only show-location set to true can invoke moveToLocation"));
            }
            pubsub.invokeMethod(methodName, params)
        } else {
            params.method = methodName;
            var callbackId = "callback" + webviewID + "_" + params.mapId + "_" + callbackIndex++;
            this[callbackId] = params.success
            params.callbackId = callbackId
            pubsub.publish("doMapAction" + params.mapId, params, [webviewID])
        }
    }

    _invokeMethod(name, params) {
        var self = this,
            index = webviewID + "_" + this.domId;
        "number" == typeof mapIds[index] || mapIds[index] ?
            (params.mapId = mapIds[index], this._invoke(name, params)) :
            EventEmitter.on("mapInsert", function () {
                params.mapId = mapIds[index]
                self._invoke(name, params)
            })
    }

    getCenterLocation() {
        var params = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        this._invokeMethod("getMapCenterLocation", params)
    }

    moveToLocation() {
        var params = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        this._invokeMethod("moveToMapLocation", params)
    }

}


export default {
    notifyWebviewIdtoMap: notifyWebviewIdtoMap,
    MapContext: MapContext,//class
    mapInfo: mapInfo
}

