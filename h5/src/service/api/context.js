// Canvas Context API
import utils from './utils'
import canvas from './canvas'
import {predefinedColor} from './predefinedColor'


function notifyCurrentRoutetoContext(url) {
    curUrl = url
}

function isNum(e) {
    return "number" == typeof e
}

function parseColorValue(colorStr) {
    var matchArr = null;
    if (null != (matchArr = /^#([0-9|A-F|a-f]{6})$/.exec(colorStr))) {
        var red = parseInt(matchArr[1].slice(0, 2), 16),
            green = parseInt(matchArr[1].slice(2, 4), 16),
            blue = parseInt(matchArr[1].slice(4), 16);
        return [red, green, blue, 255]
    }

    if (null != (matchArr = /^rgb\((.+)\)$/.exec(colorStr))) {
        return matchArr[1].split(",").map(function (e) { return parseInt(e.trim()) }).concat(255);
    }

    if (null != (matchArr = /^rgba\((.+)\)$/.exec(colorStr))) {
        return matchArr[1].split(",").map(function (e, t) { return 3 == t ? Math.floor(255 * parseFloat(e.trim())) : parseInt(e.trim()) });
    }

    var color = colorStr.toLowerCase();

    if (predefinedColor.hasOwnProperty(color)) {
        matchArr = /^#([0-9|A-F|a-f]{6})$/.exec(predefinedColor[color]);
        var red = parseInt(matchArr[1].slice(0, 2), 16),
            green = parseInt(matchArr[1].slice(2, 4), 16),
            blue = parseInt(matchArr[1].slice(4), 16);
        return [red, green, blue, 255]
    }

    console.group("非法颜色: " + colorStr)
    console.error("不支持颜色：" + colorStr)
    console.groupEnd()
}

function deepCopy(obj) {//复制对象
    if (Array.isArray(obj)) {
        var res = [];
        obj.forEach(function (e) {
            res.push(deepCopy(e))
        })
        return res
    }
    if ("object" == typeof(obj)) {
        var res = {};
        for (var n in obj) res[n] = deepCopy(obj[n]);
        return res
    }
    return obj
}


var transformAndOthersAPI = ["scale", "rotate", "translate", "save", "restore"],
    drawingAPI = ["drawImage", "fillText", "fill", "stroke", "fillRect", "strokeRect", "clearRect"],
    drawPathAPI = ["beginPath", "moveTo", "lineTo", "rect", "arc", "quadraticCurveTo", "bezierCurveTo", "closePath"],
    styleAPI = ["setFillStyle", "setStrokeStyle", "setGlobalAlpha", "setShadow", "setFontSize", "setLineCap", "setLineJoin", "setLineWidth", "setMiterLimit"],
    curUrl = ""

class ColorStop {
    constructor(type, data) {
        this.type = type
        this.data = data
        this.colorStop = []
    }

    addColorStop(e, t) {
        this.colorStop.push([e, parseColorValue(t)])
    }

}


class Context {
    constructor(t) {
        this.actions = []
        this.path = []
        this.canvasId = t
    }

    getActions() {
        var actions = deepCopy(this.actions);
        this.actions = []
        this.path = []
        return actions
    }

    clearActions() {
        this.actions = []
        this.path = []
    }

    draw() {
        var reserve = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
            canvasId = this.canvasId,
            actions = deepCopy(this.actions);
        this.actions = []
        this.path = []
        canvas.drawCanvas({
            canvasId: canvasId,
            actions: actions,
            reserve: reserve
        })
    }

    createLinearGradient(e, t, n, o) {
        return new ColorStop("linear", [e, t, n, o])
    }

    createCircularGradient(e, t, n) {
        return new ColorStop("radial", [e, t, n])
    }
}


[].concat(transformAndOthersAPI, drawingAPI).forEach(
    function (apiName) {
        "fill" == apiName || "stroke" == apiName ?
            Context.prototype[apiName] = function () {
                this.actions.push({
                    method: apiName + "Path",
                    data: deepCopy(this.path)
                })
            } : "fillRect" === apiName ?
                Context.prototype[apiName] = function (e, t, n, o) {
                    this.actions.push({
                        method: "fillPath",
                        data: [{
                            method: "rect",
                            data: [e, t, n, o]
                        }]
                    })
                } :
                "strokeRect" === apiName ?
                    Context.prototype[apiName] = function (e, t, n, o) {
                        this.actions.push({
                            method: "strokePath",
                            data: [{
                                method: "rect",
                                data: [e, t, n, o]
                            }]
                        })
                    } :
                    "fillText" == apiName ?
                        Context.prototype[apiName] = function (t, n, o) {
                            this.actions.push({
                                method: apiName,
                                data: [t.toString(), n, o]
                            })
                        } :
                        "drawImage" == apiName ?
                            Context.prototype[apiName] = function (t, n, o, r, a) {
                                //"devtools" == utils.getPlatform() || /wdfile:\/\//.test(t) || (t = utils.getRealRoute(curUrl, t).replace(/.html$/, "")),
                                    isNum(r) && isNum(a) ? data = [t, n, o, r, a] : data = [t, n, o],
                                    this.actions.push({
                                        method: apiName,
                                        data: data
                                    })
                            } : Context.prototype[apiName] = function () {
                                this.actions.push({
                                    method: apiName,
                                    data: [].slice.apply(arguments)
                                })
                            }
    }
)
drawPathAPI.forEach(function (apiName) {
    "beginPath" == apiName ?
        Context.prototype[apiName] = function () {
            this.path = []
        } :
        "lineTo" == apiName ?
            Context.prototype.lineTo = function () {
                0 == this.path.length ?
                    this.path.push({
                        method: "moveTo",
                        data: [].slice.apply(arguments)
                    }) : this.path.push({
                        method: "lineTo",
                        data: [].slice.apply(arguments)
                    })
            } : Context.prototype[apiName] = function () {
                this.path.push({
                    method: apiName,
                    data: [].slice.apply(arguments)
                })
            }
    }
)
styleAPI.forEach(function (apiName) {
    "setFillStyle" == apiName || "setStrokeStyle" == apiName ?
        Context.prototype[apiName] = function () {
            var params = arguments[0];
            "string" == typeof params ?
                this.actions.push({
                    method: apiName,
                    data: ["normal", parseColorValue(params)]
                }) :
                "object" == typeof(params) && params instanceof ColorStop && this.actions.push({
                    method: apiName,
                    data: [params.type, params.data, params.colorStop]
                })
        } :
        "setGlobalAlpha" === apiName ?
            Context.prototype[apiName] = function () {
                var data = [].slice.apply(arguments, [0, 1]);
                data[0] = Math.floor(255 * parseFloat(data[0]))
                this.actions.push({
                    method: apiName,
                    data: data
                })
            } :
            "setShadow" == apiName ?
                Context.prototype[apiName] = function () {
                    var data = [].slice.apply(arguments, [0, 4]);
                    data[3] = parseColorValue(data[3])
                    this.actions.push({
                        method: apiName,
                        data: data
                    })
                } :
                Context.prototype[apiName] = function () {
                    this.actions.push({
                        method: apiName,
                        data: [].slice.apply(arguments, [0, 1])
                    })
                }
    }
)

export default {
    notifyCurrentRoutetoContext: notifyCurrentRoutetoContext,
    Context: Context
}

