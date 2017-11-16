function surroundByTryCatchFactory(func, funcName) {//返回函数e
    return function () {
        try {
            return func.apply(func, arguments)
        } catch (e) {
            if ("[object Error]" === Object.prototype.toString.apply(e)) {
                if ("AppServiceSdkKnownError" == e.type) throw e;
                Reporter.errorReport({
                    key: "appServiceSDKScriptError",
                    error: e,
                    extend: funcName
                })
            }
        }
    }
}

function anyTypeToString(data) {//把e转成string并返回一个对象
    var dataType = Object.prototype.toString.call(data).split(" ")[1].split("]")[0];
    if ("Array" == dataType || "Object" == dataType){
        try {
            data = JSON.stringify(data)
        } catch (e) {
            e.type = "AppServiceSdkKnownError"
            throw e
        }
    }else{
        data = "String" == dataType || "Number" == dataType || "Boolean" == dataType ?
            data.toString() :
            "Date" == dataType ?
                data.getTime().toString() :
                "Undefined" == dataType ?
                    "undefined" :
                    "Null" == dataType ? "null" : "";
    }
    return {
        data: data,
        dataType: dataType
    }
}

function stringToAnyType(data, type) {//把e解码回来，和前面a相对应

    return data = "String" == type ?
        data :
        "Array" == type || "Object" == type ?
            JSON.parse(data) :
            "Number" == type ?
                parseFloat(data) :
                "Boolean" == type ?
                    "true" == data :
                    "Date" == type ?
                        new Date(parseInt(data)) :
                        "Undefined" == type ?
                            void 0 : "Null" == type ? null : ""
}

function getDataType(data) {//get data type
    return Object.prototype.toString.call(data).split(" ")[1].split("]")[0]
}

function isObject(e) {
    return "Object" === getDataType(e)
}

function paramCheck(params, paramTpl) {//比较e\t
    var result,
        name = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "parameter",
        tplTpye = getDataType(paramTpl),
        pType = getDataType(params);
    if (pType != tplTpye) return name + " should be " + tplTpye + " instead of " + pType + ";";
    switch (result = "", tplTpye) {
        case "Object":
            for (var i in paramTpl) result += paramCheck(params[i], paramTpl[i], name + "." + i);
            break;
        case "Array":
            if (params.length < paramTpl.length) return name + " should have at least " + paramTpl.length + " item;";
            for (var a = 0; a < paramTpl.length; ++a) result += paramCheck(params[a], paramTpl[a], name + "[" + a + "]")
    }
    return result
}

function getRealRoute(pathname, url) {
    var n = !(arguments.length > 2 && void 0 !== arguments[2]) || arguments[2];
    if (n && (url = addHTMLSuffix(url)), 0 === url.indexOf("/")) return url.substr(1);
    if (0 === url.indexOf("./")) return getRealRoute(pathname, url.substr(2), !1);
    var index, urlArrLength, urlArr = url.split("/");
    for (index = 0, urlArrLength = urlArr.length; index < urlArrLength && ".." === urlArr[index]; index++);
    urlArr.splice(0, index);
    var newUrl = urlArr.join("/"),
        pathArr = pathname.length > 0 ? pathname.split("/") : [];
    pathArr.splice(pathArr.length - index - 1, index + 1);
    var newPathArr = pathArr.concat(urlArr)
    return newPathArr.join("/");
}

function getPlatform() {//return platform
    return "devtools"
}

function urlEncodeFormData(data) {//把对象生成queryString
    var needEncode = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
    if ("object" !== typeof(data)) return data;
    var tmpArr = [];
    for (var o in data) if (data.hasOwnProperty(o)) {
        if (needEncode) {
            try {
                tmpArr.push(encodeURIComponent(o) + "=" + encodeURIComponent(data[o]))
            } catch (t) {
                tmpArr.push(o + "=" + data[o])
            }
        }else tmpArr.push(o + "=" + data[o]);

    }
    return tmpArr.join("&")
}

function addQueryStringToUrl(originalUrl, newParams) {//生成url t:param obj
    if ("string" == typeof originalUrl && "object" === typeof(newParams) && Object.keys(newParams).length > 0) {
        var urlComponents = originalUrl.split("?"),
            host = urlComponents[0],
            oldParams = (urlComponents[1] || "").split("&").reduce(function (res, cur) {
                if ("string" == typeof cur && cur.length > 0) {
                    var curArr = cur.split("="),
                        key = curArr[0],
                        value = curArr[1];
                    res[key] = value
                }
                return res
            }, {}),
            refinedNewParams = Object.keys(newParams).reduce(function (res, cur) {
                "object" === typeof(newParams[cur]) ?
                    res[encodeURIComponent(cur)] = encodeURIComponent(JSON.stringify(newParams[cur])) :
                    res[encodeURIComponent(cur)] = encodeURIComponent(newParams[cur])
                return res
            }, {});
        return host + "?" + urlEncodeFormData(assign(oldParams, refinedNewParams))
    }
    return originalUrl
}

function validateUrl(url) {
    return /^(http|https):\/\/.*/i.test(url)
}

function assign() {//endext 对象合并
    for (var argLeng = arguments.length, args = Array(argLeng), n = 0; n < argLeng; n++) {
        args[n] = arguments[n];
    }
    return args.reduce(function (res, cur) {
        for (var n in cur) {
            res[n] = cur[n];
        }
        return res
    }, {})
}

function encodeUrlQuery(url) {//把url中的参数encode
    if ("string" == typeof url) {
        var urlArr = url.split("?"),
            urlPath = urlArr[0],
            queryParams = (urlArr[1] || "").split("&").reduce(function (res, cur) {
                    if ("string" == typeof cur && cur.length > 0) {
                        var curArr = cur.split("="),
                            key = curArr[0],
                            value = curArr[1];
                        res[key] = value
                    }
                    return res
                }, {}),
            urlQueryArr = [];
        for (var i in queryParams) {
            queryParams.hasOwnProperty(i) && urlQueryArr.push(i + "=" + encodeURIComponent(queryParams[i]));
        }
        return urlQueryArr.length > 0 ? urlPath + "?" + urlQueryArr.join("&") : url
    }
    return url
}

function addHTMLSuffix(url) {//给url加上。html的扩展名
    if ("string" != typeof url) throw new A("wd.redirectTo: invalid url:" + url);
    var urlArr = url.split("?");
    urlArr[0] += ".html"
    return "undefined" != typeof urlArr[1] ? urlArr[0] + "?" + urlArr[1] : urlArr[0]
}

function extend(target, obj) {//t合并到e对象
    for (var n in obj) target[n] = obj[n];
    return target
}

function arrayBufferToBase64(buffer) {
    for (var res = "", arr = new Uint8Array(buffer), arrLeng = arr.byteLength, r = 0; r < arrLeng; r++) {
        res += String.fromCharCode(arr[r]);
    }
    return btoa(res)
}

function base64ToArrayBuffer(str) {
    for (var atobStr = atob(str), leng = atobStr.length, arr = new Uint8Array(leng), r = 0; r < leng; r++) arr[r] = atobStr.charCodeAt(r);
    return arr.buffer
}

function blobToArrayBuffer(blobStr, callback) {//readAsArrayBuffer t:callback
    var fileReader = new FileReader;
    fileReader.onload = function () {
        callback(this.result)
    }
    fileReader.readAsArrayBuffer(blobStr)
}

function convertObjectValueToString(obj) {//把对象元素都转成字符串
    return Object.keys(obj).reduce(function (res, cur) {
        "string" == typeof obj[cur] ?
            res[cur] = obj[cur] :
            "number" == typeof obj[cur] ?
                res[cur] = obj[cur] + "" :
                res[cur] = Object.prototype.toString.apply(obj[cur])
        return res
    }, {})
}
function renameProperty(obj, oldName, newName) {
  isObject(obj) !== !1 && oldName != newName && obj.hasOwnProperty(oldName) && (obj[newName] = obj[oldName], delete obj[oldName])
}

function toArray(arg) { // 把e转成array
    if (Array.isArray(arg)) {
        for (var t = 0, n = Array(arg.length); t < arg.length; t++) n[t] = arg[t]
        return n
    }
    return Array.from(arg)
}

var words = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    btoa = btoa ||
        function (str) {
            for (var curPosFlag, curCodeValue, text = String(str), res = "", i = 0, wordTpl = words; text.charAt(0 | i) || (wordTpl = "=", i % 1); res += wordTpl.charAt(63 & curPosFlag >> 8 - i % 1 * 8)) {
                curCodeValue = text.charCodeAt(i += .75)
                if (curCodeValue > 255) throw new Error('"btoa" failed');
                curPosFlag = curPosFlag << 8 | curCodeValue
            }
            return res
        },
    atob = atob ||
        function (str) {
            var text = String(str).replace(/=+$/, ""),
                res = "";
            if (text.length % 4 === 1) throw new Error('"atob" failed');
            for (var curFlage, curValue, i = 0, a = 0; curValue = text.charAt(a++); ~curValue && (curFlage = i % 4 ? 64 * curFlage + curValue : curValue, i++ % 4) ? res += String.fromCharCode(255 & curFlage >> ( -2 * i & 6)) : 0)
                curValue = words.indexOf(curValue);
            return res
        }

class AppServiceSdkKnownError extends Error {
    constructor(e) {
        super("APP-SERVICE-SDK:" + e);
        this.type = "AppServiceSdkKnownError";
    }
}
var Components = {
    //components
    audio: {"1.0.0": ["id", "src", "loop", "controls", "poster", "name", "author", "binderror", "bindplay", "bindpause", "bindtimeupdate", "bindended"]},
    button: {
        "1.0.0": [{size: ["default", "mini"]}, {type: ["primary", "default", "warn"]}, "plain", "disabled", "loading", {"form-type": ["submit", "reset"]}, "hover-class", "hover-start-time", "hover-stay-time"],
        "1.1.0": [{"open-type": ["contact"]}],
        "1.2.0": [{"open-type": ["share"]}],
        "1.4.0": ["session-from"],
        "1.3.0": [{"open-type": ["getUserInfo"]}]
    },
    canvas: {"1.0.0": ["canvas-id", "disable-scroll", "bindtouchstart", "bindtouchmove", "bindtouchend", "bindtouchcancel", "bindlongtap", "binderror"]},
    "checkbox-group": {"1.0.0": ["bindchange"]},
    checkbox: {"1.0.0": ["value", "disabled", "checked", "color"]},
    "contact-button": {"1.0.0": ["size", {type: ["default-dark", "default-light"]}, "session-from"]},
    "cover-view": {"1.4.0": []},
    "cover-image": {"1.4.0": ["src"]},
    form: {"1.0.0": ["report-submit", "bindsubmit", "bindreset"], "1.2.0": ["bindautofill"]},
    icon: {"1.0.0": [{type: ["success", "success_no_circle", "info", "warn", "waiting", "cancel", "download", "search", "clear"]}, "size", "color"]},
    image: {"1.0.0": ["src", {mode: ["scaleToFill", "aspectFit", "aspectFill", "widthFix", "top", "bottom", "center", "left", "right", "top left", "top right", "bottom left", "bottom right"]}, "binderror", "bindload"]},
    input: {
        "1.0.0": ["value", {type: ["text", "number", "idcard", "digit"]}, "password", "placeholder", "placeholder-style", "placeholder-class", "disabled", "maxlength", "cursor-spacing", "auto-focus", "focus", "bindinput", "bindfocus", "bindblur", "bindconfirm"],
        "1.1.0": [{"confirm-type": ["send", "search", "next", "go", "done"]}, "confirm-hold"],
        "1.2.0": ["auto-fill"]
    },
    label: {"1.0.0": ["for"]},
    map: {
        "1.0.0": ["longitude", "latitude", "scale", {markers: ["id", "latitude", "longitude", "title", "iconPath", "rotate", "alpha", "width", "height"]}, "covers", {polyline: ["points", "color", "width", "dottedLine"]}, {circles: ["latitude", "longitude", "color", "fillColor", "radius", "strokeWidth"]}, {controls: ["id", "position", "iconPath", "clickable"]}, "include-points", "show-location", "bindmarkertap", "bindcontroltap", "bindregionchange", "bindtap"],
        "1.2.0": [{markers: ["callout", "label", "anchor"]}, {polyline: ["arrowLine", "borderColor", "borderWidth"]}, "bindcallouttap"]
    },
    modal: {"1.0.0": []},
    "movable-area": {"1.2.0": []},
    "movable-view": {"1.2.0": ["direction", "inertia", "out-of-bounds", "x", "y", "damping", "friction"]},
    navigator: {
        "1.0.0": ["url", {"open-type": ["navigate", "redirect", "switchTab"]}, "delta", "hover-class", "hover-start-time", "hover-stay-time"],
        "1.1.0": [{"open-type": ["reLaunch", "navigateBack"]}]
    },
    "open-data": {"1.4.0": [{type: ["groupName"]}, "open-gid"]},
    "picker-view": {"1.0.0": ["value", "indicator-style", "bindchange"], "1.1.0": ["indicator-class"]},
    "picker-view-column": {"1.0.0": []},
    picker: {
        "1.0.0": ["range", "range-key", "value", "bindchange", "disabled", "start", "end", {fields: ["year", "month", "day"]}, {mode: ["selector", "date", "time"]}],
        "1.2.0": ["auto-fill"],
        "1.4.0": ["bindcolumnchange", {mode: ["multiSelector", "region"]}]
    },
    progress: {"1.0.0": ["percent", "show-info", "stroke-width", "color", "activeColor", "backgroundColor", "active"]},
    "radio-group": {"1.0.0": ["bindchange"]},
    radio: {"1.0.0": ["value", "checked", "disabled", "color"]},
    "rich-text": {"1.4.0": [{nodes: ["name", "attrs", "children"]}]},
    "scroll-view": {"1.0.0": ["scroll-x", "scroll-y", "upper-threshold", "lower-threshold", "scroll-top", "scroll-left", "scroll-into-view", "scroll-with-animation", "enable-back-to-top", "bindscrolltoupper", "bindscrolltolower", "bindscroll"]},
    slider: {"1.0.0": ["min", "max", "step", "disabled", "value", "color", "selected-color", "activeColor", "backgroundColor", "show-value", "bindchange"]},
    swiper: {
        "1.0.0": ["indicator-dots", "autoplay", "current", "interval", "duration", "circular", "vertical", "bindchange"],
        "1.1.0": ["indicator-color", "indicator-active-color"]
    },
    "swiper-item": {"1.0.0": []},
    "switch": {"1.0.0": ["checked", {type: ["switch", "checkbox"]}, "bindchange", "color"]},
    text: {"1.0.0": [], "1.1.0": ["selectable"], "1.4.0": [{space: ["ensp", "emsp", "nbsp"]}, "decode"]},
    textarea: {
        "1.0.0": ["value", "placeholder", "placeholder-style", "placeholder-class", "disabled", "maxlength", "auto-focus", "focus", "auto-height", "fixed", "cursor-spacing", "bindfocus", "bindblur", "bindlinechange", "bindinput", "bindconfirm"],
        "1.2.0": ["auto-fill"]
    },
    video: {
        "1.0.0": ["src", "controls", "danmu-list", "danmu-btn", "enable-danmu", "autoplay", "bindplay", "bindpause", "bindended", "bindtimeupdate", "objectFit", "poster"],
        "1.1.0": ["duration"],
        "1.4.0": ["loop", "muted", "bindfullscreenchange"]
    },
    view: {"1.0.0": ["hover-class", "hover-start-time", "hover-stay-time"]}
};
var APIs = {
    //APIS
    onAccelerometerChange: {"1.0.0": [{callback: ["x", "y", "z"]}]},
    startAccelerometer: {"1.1.0": []},
    stopAccelerometer: {"1.1.0": []},
    chooseAddress: {"1.1.0": [{success: ["userName", "postalCode", "provinceName", "cityName", "countyName", "detailInfo", "nationalCode", "telNumber"]}]},
    createAnimation: {"1.0.0": [{object: ["duration", {timingFunction: ["linear", "ease", "ease-in", "ease-in-out", "ease-out", "step-start", "step-end"]}, "delay", "transformOrigin"]}]},
    createAudioContext: {"1.0.0": []},
    canIUse: {"1.0.0": []},
    login: {"1.0.0": [{success: ["code"]}]},
    checkSession: {"1.0.0": []},
    createMapContext: {"1.0.0": []},
    requestPayment: {"1.0.0": [{object: ["timeStamp", "nonceStr", "package", "signType", "paySign"]}]},
    showToast: {"1.0.0": [{object: ["title", "icon", "duration", "mask"]}], "1.1.0": [{object: ["image"]}]},
    showLoading: {"1.1.0": [{object: ["title", "mask"]}]},
    hideToast: {"1.0.0": []},
    hideLoading: {"1.1.0": []},
    showModal: {
        "1.0.0": [{object: ["title", "content", "showCancel", "cancelText", "cancelColor", "confirmText", "confirmColor"]}, {success: ["confirm"]}],
        "1.1.0": [{success: ["cancel"]}]
    },
    showActionSheet: {"1.0.0": [{object: ["itemList", "itemColor"]}, {success: ["tapIndex"]}]},
    arrayBufferToBase64: {"1.1.0": []},
    base64ToArrayBuffer: {"1.1.0": []},
    createVideoContext: {"1.0.0": []},
    authorize: {"1.2.0": [{object: ["scope"]}]},
    openBluetoothAdapter: {"1.1.0": []},
    closeBluetoothAdapter: {"1.1.0": []},
    getBluetoothAdapterState: {"1.1.0": [{success: ["discovering", "available"]}]},
    onBluetoothAdapterStateChange: {"1.1.0": [{callback: ["available", "discovering"]}]},
    startBluetoothDevicesDiscovery: {"1.1.0": [{object: ["services", "allowDuplicatesKey", "interval"]}, {success: ["isDiscovering"]}]},
    stopBluetoothDevicesDiscovery: {"1.1.0": []},
    getBluetoothDevices: {"1.1.0": [{success: ["devices"]}]},
    onBluetoothDeviceFound: {"1.1.0": [{callback: ["devices"]}]},
    getConnectedBluetoothDevices: {"1.1.0": [{object: ["services"]}, {success: ["devices"]}]},
    createBLEConnection: {"1.1.0": [{object: ["deviceId"]}]},
    closeBLEConnection: {"1.1.0": [{object: ["deviceId"]}]},
    getBLEDeviceServices: {"1.1.0": [{object: ["deviceId"]}, {success: ["services"]}]},
    getBLEDeviceCharacteristics: {"1.1.0": [{object: ["deviceId", "serviceId"]}, {success: ["characteristics"]}]},
    readBLECharacteristicValue: {"1.1.0": [{object: ["deviceId", "serviceId", "characteristicId"]}, {success: ["characteristic"]}]},
    writeBLECharacteristicValue: {"1.1.0": [{object: ["deviceId", "serviceId", "characteristicId", "value"]}]},
    notifyBLECharacteristicValueChange: {"1.1.1": [{object: ["deviceId", "serviceId", "characteristicId", "state"]}]},
    onBLEConnectionStateChange: {"1.1.1": [{callback: ["deviceId", "connected"]}]},
    onBLECharacteristicValueChange: {"1.1.0": [{callback: ["deviceId", "serviceId", "characteristicId", "value"]}]},
    captureScreen: {"1.4.0": [{success: ["tempFilePath"]}]},
    addCard: {"1.1.0": [{object: ["cardList"]}, {success: ["cardList"]}]},
    openCard: {"1.1.0": [{object: ["cardList"]}]},
    setClipboardData: {"1.1.0": [{object: ["data"]}]},
    getClipboardData: {"1.1.0": [{success: ["data"]}]},
    onCompassChange: {"1.0.0": [{callback: ["direction"]}]},
    startCompass: {"1.1.0": []},
    stopCompass: {"1.1.0": []},
    setStorage: {"1.0.0": [{object: ["key", "data"]}]},
    getStorage: {"1.0.0": [{object: ["key"]}, {success: ["data"]}]},
    getStorageSync: {"1.0.0": []},
    getStorageInfo: {"1.0.0": [{success: ["keys", "currentSize", "limitSize"]}]},
    removeStorage: {"1.0.0": [{object: ["key"]}]},
    removeStorageSync: {"1.0.0": []},
    clearStorage: {"1.0.0": []},
    clearStorageSync: {"1.0.0": []},
    getNetworkType: {"1.0.0": [{success: ["networkType"]}]},
    onNetworkStatusChange: {"1.1.0": [{callback: ["isConnected", {networkType: ["wifi", "2g", "3g", "4g", "none", "unknown"]}]}]},
    setScreenBrightness: {"1.2.0": [{object: ["value"]}]},
    getScreenBrightness: {"1.2.0": [{success: ["value"]}]},
    vibrateLong: {"1.2.0": []},
    vibrateShort: {"1.2.0": []},
    getExtConfig: {"1.1.0": [{success: ["extConfig"]}]},
    getExtConfigSync: {"1.1.0": []},
    saveFile: {"1.0.0": [{object: ["tempFilePath"]}, {success: ["savedFilePath"]}]},
    getSavedFileList: {"1.0.0": [{success: ["fileList"]}]},
    getSavedFileInfo: {"1.0.0": [{object: ["filePath"]}, {success: ["size", "createTime"]}]},
    removeSavedFile: {"1.0.0": [{object: ["filePath"]}]},
    openDocument: {"1.0.0": [{object: ["filePath"]}], "1.4.0": [{object: ["fileType"]}]},
    getBackgroundAudioManager: {"1.2.0": []},
    getFileInfo: {"1.4.0": [{object: ["filePath", {digestAlgorithm: ["md5", "sha1"]}]}, {success: ["size", "digest"]}]},
    startBeaconDiscovery: {"1.2.0": [{object: ["uuids"]}]},
    stopBeaconDiscovery: {"1.2.0": []},
    getBeacons: {"1.2.0": [{success: ["beacons"]}]},
    onBeaconUpdate: {"1.2.0": [{callback: ["beacons"]}]},
    onBeaconServiceChange: {"1.2.0": [{callback: ["available", "discovering"]}]},
    getLocation: {
        "1.0.0": [{object: ["type"]}, {success: ["latitude", "longitude", "speed", "accuracy"]}],
        "1.2.0": [{success: ["altitude", "verticalAccuracy", "horizontalAccuracy"]}]
    },
    chooseLocation: {"1.0.0": [{object: ["cancel"]}, {success: ["name", "address", "latitude", "longitude"]}]},
    openLocation: {"1.0.0": [{object: ["latitude", "longitude", "scale", "name", "address"]}]},
    getBackgroundAudioPlayerState: {"1.0.0": [{success: ["duration", "currentPosition", "status", "downloadPercent", "dataUrl"]}]},
    playBackgroundAudio: {"1.0.0": [{object: ["dataUrl", "title", "coverImgUrl"]}]},
    pauseBackgroundAudio: {"1.0.0": []},
    seekBackgroundAudio: {"1.0.0": [{object: ["position"]}]},
    stopBackgroundAudio: {"1.0.0": []},
    onBackgroundAudioPlay: {"1.0.0": []},
    onBackgroundAudioPause: {"1.0.0": []},
    onBackgroundAudioStop: {"1.0.0": []},
    chooseImage: {
        "1.0.0": [{object: ["count", "sizeType", "sourceType"]}, {success: ["tempFilePaths"]}],
        "1.2.0": [{success: ["tempFiles"]}]
    },
    previewImage: {"1.0.0": [{object: ["current", "urls"]}]},
    getImageInfo: {"1.0.0": [{object: ["src"]}, {success: ["width", "height", "path"]}]},
    saveImageToPhotosAlbum: {"1.2.0": [{object: ["filePath"]}]},
    startRecord: {"1.0.0": [{success: ["tempFilePath"]}]},
    stopRecord: {"1.0.0": []},
    chooseVideo: {"1.0.0": [{object: ["sourceType", "maxDuration", "camera"]}, {success: ["tempFilePath", "duration", "size", "height", "width"]}]},
    saveVideoToPhotosAlbum: {"1.2.0": [{object: ["filePath"]}]},
    playVoice: {"1.0.0": [{object: ["filePath"]}]},
    pauseVoice: {"1.0.0": []},
    stopVoice: {"1.0.0": []},
    navigateBackMiniProgram: {"1.3.0": [{object: ["extraData"]}]},
    navigateToMiniProgram: {"1.3.0": [{object: ["appId", "path", "extraData", "envVersion"]}]},
    uploadFile: {"1.0.0": [{object: ["url", "filePath", "name", "header", "formData"]}, {success: ["data", "statusCode"]}]},
    downloadFile: {"1.0.0": [{object: ["url", "header"]}]},
    request: {
        "1.0.0": [{object: ["url", "data", "header", {method: ["OPTIONS", "GET", "HEAD", "POST", "PUT", "DELETE", "TRACE", "CONNECT"]}, "dataType"]}, {success: ["data", "statusCode"]}],
        "1.2.0": [{success: ["header"]}]
    },
    connectSocket: {
        "1.0.0": [{object: ["url", "data", "header", {method: ["OPTIONS", "GET", "HEAD", "POST", "PUT", "DELETE", "TRACE", "CONNECT"]}]}],
        "1.4.0": [{object: ["protocols"]}]
    },
    onSocketOpen: {"1.0.0": []},
    onSocketError: {"1.0.0": []},
    sendSocketMessage: {"1.0.0": [{object: ["data"]}]},
    onSocketMessage: {"1.0.0": [{callback: ["data"]}]},
    closeSocket: {"1.0.0": [], "1.4.0": [{object: ["code", "reason"]}]},
    onSocketClose: {"1.0.0": []},
    onUserCaptureScreen: {"1.4.0": []},
    chooseContact: {"1.0.0": [{success: ["phoneNumber", "displayName"]}]},
    getUserInfo: {
        "1.0.0": [{success: ["userInfo", "rawData", "signature", "encryptedData", "iv"]}],
        "1.1.0": [{object: ["withCredentials"]}],
        "1.4.0": [{object: ["lang"]}]
    },
    addPhoneContact: {"1.2.0": [{object: ["photoFilePath", "nickName", "lastName", "middleName", "firstName", "remark", "mobilePhoneNumber", "weChatNumber", "addressCountry", "addressState", "addressCity", "addressStreet", "addressPostalCode", "organization", "title", "workFaxNumber", "workPhoneNumber", "hostNumber", "email", "url", "workAddressCountry", "workAddressState", "workAddressCity", "workAddressStreet", "workAddressPostalCode", "homeFaxNumber", "homePhoneNumber", "homeAddressCountry", "homeAddressState", "homeAddressCity", "homeAddressStreet", "homeAddressPostalCode"]}]},
    makePhoneCall: {"1.0.0": [{object: ["phoneNumber"]}]},
    stopPullDownRefresh: {"1.0.0": []},
    scanCode: {
        "1.0.0": [{success: ["result", "scanType", "charSet", "path"]}],
        "1.2.0": [{object: ["onlyFromCamera"]}]
    },
    pageScrollTo: {"1.4.0": [{object: ["scrollTop"]}]},
    setEnableDebug: {"1.4.0": [{object: ["enableDebug"]}]},
    setKeepScreenOn: {"1.4.0": [{object: ["keepScreenOn"]}]},
    setNavigationBarColor: {"1.4.0": [{object: ["frontColor", "backgroundColor", "animation", "animation.duration", {"animation.timingFunc": ["linear", "easeIn", "easeOut", "easeInOut"]}]}]},
    openSetting: {"1.1.0": [{success: ["authSetting"]}]},
    getSetting: {"1.2.0": [{success: ["authSetting"]}]},
    showShareMenu: {"1.1.0": [{object: ["withShareTicket"]}]},
    hideShareMenu: {"1.1.0": []},
    updateShareMenu: {"1.2.0": [{object: ["withShareTicket"]}], "1.4.0": [{object: ["dynamic", "widget"]}]},
    getShareInfo: {"1.1.0": [{object: ["shareTicket"]}, {callback: ["encryptedData", "iv"]}]},
    getSystemInfo: {
        "1.0.0": [{success: ["model", "pixelRatio", "windowWidth", "windowHeight", "language", "version", "system", "platform"]}],
        "1.1.0": [{success: ["screenWidth", "screenHeight", "SDKVersion"]}]
    },
    getSystemInfoSync: {
        "1.0.0": [{return: ["model", "pixelRatio", "windowWidth", "windowHeight", "language", "version", "system", "platform"]}],
        "1.1.0": [{return: ["screenWidth", "screenHeight", "SDKVersion"]}]
    },
    navigateTo: {"1.0.0": [{object: ["url"]}]},
    redirectTo: {"1.0.0": [{object: ["url"]}]},
    reLaunch: {"1.1.0": [{object: ["url"]}]},
    switchTab: {"1.0.0": [{object: ["url"]}]},
    navigateBack: {"1.0.0": [{object: ["delta"]}]},
    setNavigationBarTitle: {"1.0.0": [{object: ["title"]}]},
    showNavigationBarLoading: {"1.0.0": []},
    hideNavigationBarLoading: {"1.0.0": []},
    setTopBarText: {"1.4.2": [{object: ["text"]}]},
    getWeRunData: {"1.2.0": [{success: ["encryptedData", "iv"]}]},
    createSelectorQuery: {"1.4.0": []},
    createCanvasContext: {"1.0.0": []},
    canvasToTempFilePath: {
        "1.0.0": [{object: ["canvasId"]}],
        "1.2.0": [{object: ["x", "y", "width", "height", "destWidth", "destHeight"]}]
    },
    canvasContext: {
        "1.0.0": ["addColorStop", "arc", "beginPath", "bezierCurveTo", "clearActions", "clearRect", "closePath", "createCircularGradient", "createLinearGradient", "drawImage", "draw", "fillRect", "fillText", "fill", "lineTo", "moveTo", "quadraticCurveTo", "rect", "rotate", "save", "scale", "setFillStyle", "setFontSize", "setGlobalAlpha", "setLineCap", "setLineJoin", "setLineWidth", "setMiterLimit", "setShadow", "setStrokeStyle", "strokeRect", "stroke", "translate"],
        "1.1.0": ["setTextAlign"],
        "1.4.0": ["setTextBaseline"]
    },
    animation: {"1.0.0": ["opacity", "backgroundColor", "width", "height", "top", "left", "bottom", "right", "rotate", "rotateX", "rotateY", "rotateZ", "rotate3d", "scale", "scaleX", "scaleY", "scaleZ", "scale3d", "translate", "translateX", "translateY", "translateZ", "translate3d", "skew", "skewX", "skewY", "matrix", "matrix3d"]},
    audioContext: {"1.0.0": ["setSrc", "play", "pause", "seek"]},
    mapContext: {
        "1.0.0": ["getCenterLocation", "moveToLocation"],
        "1.2.0": ["translateMarker", "includePoints"],
        "1.4.0": ["getRegion", "getScale"]
    },
    videoContext: {
        "1.0.0": ["play", "pause", "seek", "sendDanmu"],
        "1.4.0": ["playbackRate", "requestFullScreen", "exitFullScreen"]
    },
    backgroundAudioManager: {"1.2.0": ["play", "pause", "stop", "seek", "onCanplay", "onPlay", "onPause", "onStop", "onEnded", "onTimeUpdate", "onPrev", "onNext", "onError", "onWaiting", "duration", "currentTime", "paused", "src", "startTime", "buffered", "title", "epname", "singer", "coverImgUrl", "webUrl"]},
    uploadTask: {"1.4.0": ["onProgressUpdate", "abort"]},
    downloadTask: {"1.4.0": ["onProgressUpdate", "abort"]},
    requestTask: {"1.4.0": ["abort"]},
    selectorQuery: {"1.4.0": ["select", "selectAll", "selectViewport", "exec"]},
    onBLEConnectionStateChanged: {"1.1.0": [{callback: ["deviceId", "connected"]}]},
    notifyBLECharacteristicValueChanged: {"1.1.0": [{object: ["deviceId", "serviceId", "characteristicId", "state"]}]},
    sendBizRedPacket: {"1.2.0": [{object: ["timeStamp", "nonceStr", "package", "signType", "paySign"]}]}
};
//检测组件相关是否存在
function isComponentExist(params){
    var name = params[0],//组件名
        attribute = params[1],//属性名
        option = params[2],//组件属性可选值
        component = Components[name];
    if(!attribute){
        return true;
    } else{
        for(var key in component){
            for(var i=0;i<component[key].length;i++){
                if("string" == typeof component[key][i] && component[key][i] == attribute) {
                    return true;
                } else if(component[key][i][attribute]){
                    if(!option){
                        return true;
                    } else if(component[key][i][attribute].indexOf(option)>-1){
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

//检测API相关是否存在
function isAPIExist(params){
    var name = params[0],//API名
        method = params[1],//调用方式：有效值为return, success, object, callback
        param = params[2],//组件属性可选值
        options = params[3],
        methods = ["return", "success", "object", "callback"],
        api = APIs[name];
    if(api){
        if(!method){
            return true;
        } else if(methods.indexOf(method)<0){
            return false;
        } else{
            for(var key in api){
                for(var i=0;i<key.length;i++){
                    if("object" == typeof api[key][i] && api[key][i][method]) {
                        if(!param){
                            return true;
                        } else{
                            for(var j= 0;j<api[key][i][method].length;j++){
                                if(typeof api[key][i][method][j] == "string" &&api[key][i][method][j] == param){
                                    return true;
                                } else if (typeof api[key][i][method][j] == "object" && api[key][i][method][j][param]){
                                    if(!options){
                                        return true;
                                    } else if(api[key][i][method][j][param].indexOf(options)>-1){
                                        return true;
                                    } else {
                                        return false;
                                    }
                                }
                            }
                            return true;
                        }
                    }
                }
                return false;
            }
            return false;
        }   
    } else {
        return true;
    }    
}
function canIUse (params,version){
    var name = params[0];//API或组件名
    if(Components[name]){
        return isComponentExist(params);
    } else if(APIs[name]){
        return isAPIExist(params);
    } else{
        return false;
    }

}


function checkParam(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}

var  config= function (){
    function e(e, t) {
        for (var n = 0; n < t.length; n++) {
            var obj = t[n];
            obj.enumerable = obj.enumerable || !1,
                obj.configurable = !0,
            "value"in obj && (obj.writable = !0),
                Object.defineProperty(e, obj.key, obj)
        }
    }
    return function(t, n, obj) {
        return n && e(t.prototype, n),
        obj && e(t, obj),
            t
    }
}();
var setSelect = function() {
    function e(t, n, r) {
        checkParam(this, e),
            this._selectorQuery = t,
            this._selector = n,
            this._single = r
    }
    return config(e, [{
        key: "fields",
        value: function(e, t) {
            return this._selectorQuery._push(this._selector, this._single, e, t),
                this._selectorQuery
        }
    }, {
        key: "boundingClientRect",
        value: function(e) {
            return this._selectorQuery._push(this._selector, this._single, {
                id: !0,
                dataset: !0,
                rect: !0,
                size: !0
            }, e),
                this._selectorQuery
        }
    }, {
        key: "scrollOffset",
        value: function(e) {
            return this._selectorQuery._push(this._selector, this._single, {
                id: !0,
                dataset: !0,
                scrollOffset: !0
            }, e),
                this._selectorQuery
        }
    }]),
        e
}();
var wxQuerySelector = function(){
    function init (t) {
        checkParam(this,init);
        this._webviewId = t;
        this._queue = [];
        this._queueCb = [];
    }
    return config(init,[{
        key: "select", value: function (e) {
            return new setSelect(this, e, !0)
        }
    }, {
        key: "selectAll", value: function (e) {
            return new setSelect(this, e, !1)
        }
    }, {
        key: "selectViewport", value: function () {
            return new setSelect(this, "viewport", !0)
        }
    }, {
        key: "_push", value: function (e, t, n, o) {
            this._queue.push({selector: e, single: t, fields: n}), this._queueCb.push(o || null)
        }
    }, {
        key: "exec", value: function (e) {
            var t = this;
            u(this._webviewId, this._queue, function (n) {
                var o = t._queueCb;
                n.forEach(function (e, n) {
                    "function" == typeof o[n] && o[n].call(t, e)
                }),
                "function" == typeof e && e.call(t, n)
            })
        }
    }]),
    init
}();

function transWxmlToHtml(url) {
    if ("string" != typeof url)return url;
    var urlArr = url.split("?");
    return urlArr[0] += ".html", void 0 !== urlArr[1] ? urlArr[0] + "?" + urlArr[1] : urlArr[0]
}

function removeHtmlSuffixFromUrl(url) {
    return "string" == typeof url ? -1 !== url.indexOf("?") ? url.replace(/\.html\?/, "?") : url.replace(/\.html$/, "") : url
}

export default  {
    surroundByTryCatchFactory: surroundByTryCatchFactory,
    getDataType: getDataType,
    isObject: isObject,
    paramCheck: paramCheck,
    getRealRoute: getRealRoute,
    getPlatform: getPlatform,
    urlEncodeFormData: urlEncodeFormData,
    addQueryStringToUrl: addQueryStringToUrl,
    validateUrl: validateUrl,
    assign: assign,
    encodeUrlQuery: encodeUrlQuery,
    transWxmlToHtml: transWxmlToHtml,
    removeHtmlSuffixFromUrl: removeHtmlSuffixFromUrl,
    extend: extend,
    arrayBufferToBase64: arrayBufferToBase64,
    base64ToArrayBuffer: base64ToArrayBuffer,
    blobToArrayBuffer: blobToArrayBuffer,
    convertObjectValueToString: convertObjectValueToString,
    anyTypeToString: surroundByTryCatchFactory(anyTypeToString, "anyTypeToString"),
    stringToAnyType: surroundByTryCatchFactory(stringToAnyType, "stringToAnyType"),
    AppServiceSdkKnownError: AppServiceSdkKnownError,
    renameProperty: renameProperty,
    defaultRunningStatus : "active",
    toArray: toArray,
    canIUse:canIUse,
    wxQuerySelector:wxQuerySelector
}