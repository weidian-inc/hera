import pubsub from './bridge'
import context from './context'
import utils from './utils'
import EventEmitter2 from './EventEmitter2'

function canvasDesString(webviewID, canvasId) {
    return webviewID + "canvas" + canvasId
}

function clearOldWebviewCanvas() {
    for (var key in canvasIDs) {
        if (0 == key.indexOf(webviewID + "canvas")) {
            canvasIDs[key];
            delete canvasIDs[key]
        }
    }
}

function notifyWebviewIdtoCanvas(e) {
    webviewID = e
}

function invokeDrawCanvas(canvasId, actions) {
    var reserve = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
/*
        success = arguments[3],
        fail = arguments[4],
        complte = arguments[5],
        platform = utils.getPlatform();
    "ios" == platform || "android" == platform ?
        ServiceJSBridge.invoke("drawCanvas", {
            canvasId: canvasId,
            reserve: reserve,
            actions: actions
        },
        function (e) {
            e.errMsg && /ok/.test(e.errMsg) ?
            "function" == typeof success && success(e) :
            "function" == typeof fail && fail(e)
            "function" == typeof complte && complte(e)
        }) :
*/
        ServiceJSBridge.publish("canvas" + canvasId + "actionsChanged", { actions: actions, reserve: reserve}, [webviewID])
}

function drawCanvas(params) {
    var canvasId = params.canvasId,
        actions = params.actions,
        reserve = params.reserve,
        success = params.success,
        fail = params.fail,
        complete = params.complete;
    if (canvasId && Array.isArray(actions)) {
        var key = canvasDesString(webviewID, canvasId);
        if ("number" == typeof canvasIDs[key]) {
            var canvasId = canvasIDs[key];
            invokeDrawCanvas(canvasId, actions, reserve, success, fail, complete)
        } else {
            canvasOptions[key] = canvasOptions[key] || []
            canvasOptions[key] = canvasOptions[key].concat({
                actions: actions,
                reserve: reserve,
                success: success,
                fail: fail,
                complete: complete
            })
        }
    }
}

function canvasToTempFilePathImpl(obj) {

        (
            ServiceJSBridge.subscribe("onCanvasToDataUrl_" + obj.canvasId, function (params) {
                var dataUrl = params.dataUrl;
                pubsub.invokeMethod("base64ToTempFilePath",
                    utils.assign({ base64Data: dataUrl}, obj),
                    {
                        beforeAll: function (res) {
                            res.errMsg = res.errMsg.replace("base64ToTempFilePath", "canvasToTempFilePath")
                        }
                    }
                )
            }),
            pubsub.publish("invokeCanvasToDataUrl_" + obj.canvasId, { canvasId: obj.canvasId})
        )
}

function canvasToTempFilePath(obj) {
    if (obj.canvasId) {
        var key = canvasDesString(webviewID, obj.canvasId);
        if ("number" == typeof canvasIDs[key]) {
            obj.canvasId = canvasIDs[key]
            canvasToTempFilePathImpl(obj);
        } else {
            var res = {
                errMsg: "canvasToTempFilePath: fail canvas is empty"
            };
            "function" == typeof obj.fail && obj.fail(res),
            "function" == typeof obj.complete && obj.complete(res)
        }
    }
}


var webviewID = (new EventEmitter2.EventEmitter2, 0),
    canvasInfo = {},
    canvasIDs = {},
    canvasOptions = {};

ServiceJSBridge.subscribe("canvasInsert", function (event, t) {
    var canvasId = event.canvasId,
        canvasNumber = event.canvasNumber,
        data = event.data,
        key = canvasDesString(webviewID, canvasId);

    canvasInfo[canvasNumber] = {
        lastTouches: [],
        data: data
    }

    canvasIDs[key] = canvasIDs[key] || canvasNumber

    Array.isArray(canvasOptions[key]) &&
    (
        canvasOptions[key].forEach(function (e) {
            invokeDrawCanvas(canvasNumber, e.actions, e.reserve, e.success, e.fail, e.complete)
        }),
        delete canvasOptions[key]
    )
})

ServiceJSBridge.subscribe("canvasRemove",
    function (params, t) {
        var canvasId = params.canvasId,
            canvasIndex = canvasDesString(webviewID, canvasId);
        canvasIDs[canvasIndex] && delete canvasIDs[canvasIndex]
    }
);

var createContext = function () {
        return new context.Context
    },
    createCanvasContext = function (e) {
        return new context.Context(e)
    };


export default {
    canvasInfo,
    clearOldWebviewCanvas,
    notifyWebviewIdtoCanvas,
    drawCanvas,
    canvasToTempFilePath,
    createContext,
    createCanvasContext
}
