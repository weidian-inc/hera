
import utils from './utils';
import * as parsePath from './parsePath';
import toAppView from './toAppView';
import organize from './iteratorHandle';


var sysEventKeys = ["onLoad", "onReady", "onShow", "onRouteEnd", "onHide", "onUnload"];
var isSysAttr = function(key) {//校验e是否为系统事件或属性
    for (var i = 0; i < sysEventKeys.length; ++i) {
        if (sysEventKeys[i] === key) {
            return true;
        }
    }
    return "data" === key;
};
var baseAttrs = ["__wxWebviewId__", "__route__"];

var isBaseAttr = function(name) {
    return baseAttrs.indexOf(name) !== -1;
};
class parsePage{
    constructor() {
        var pageObj = arguments.length <= 0 || void 0 === arguments[0] ? {}: arguments[0],
            curPage = this,
            webviewId = arguments[1],
            routePath = arguments[2];

        var pageBaseAttr = {
            __wxWebviewId__: webviewId,
            __route__: routePath
        };
        baseAttrs.forEach(function(key) {
            curPage.__defineSetter__(key, function () {
                utils.warn("关键字保护", "should not change the protected attribute " + key);
            })
            curPage.__defineGetter__(key, function () {
                return pageBaseAttr[key];
            });
        });
        pageObj.data = pageObj.data || {};
        utils.isPlainObject(pageObj.data) ||
        utils.error("Page data error", "data must be an object, your data is " + JSON.stringify(pageObj.data));
        this.data = JSON.parse(JSON.stringify(pageObj.data));
        sysEventKeys.forEach(function(eventName) {//定义页面事件
            curPage[eventName] = function() {
                var eventFun = (pageObj[eventName] || utils.noop).bind(this),
                    res;
                utils.info(this.__route__ + ": " + eventName + " have been invoked");
                try {
                    var startTime = Date.now();
                    res = eventFun.apply(this, arguments);
                    var runTime = Date.now() - startTime;
                    runTime > 1e3 && Reporter.slowReport({
                        key: "pageInvoke",
                        cost: runTime,
                        extend: 'at "' + this.__route__ + '" page lifeCycleMethod ' + eventName + " function"
                    });
                } catch(err) {
                    Reporter.thirdErrorReport({
                        error: err,
                        extend: 'at "' + this.__route__ + '" page lifeCycleMethod ' + eventName + " function"
                    });
                }
                return res;
            }.bind(curPage);
        });
        var copyPageObjByKey = function(attrName) {//定义页面其它方法与属性
            isBaseAttr(attrName) ?
                utils.warn("关键字保护", "Page's " + attrName + " is write-protected") :
                isSysAttr(attrName) ||
                ("Function" === utils.getDataType(pageObj[attrName]) ?
                    curPage[attrName] = function() {
                        var res ;
                        try {
                            var startTime = Date.now();
                            res = pageObj[attrName].apply(this, arguments);
                            var runTime = Date.now() - startTime;
                            runTime > 1e3 && Reporter.slowReport({
                                key: "pageInvoke",
                                cost: runTime,
                                extend: "at " + this.__route__ + " page " + attrName + " function"
                            });
                        } catch(err) {
                            Reporter.thirdErrorReport({
                                error: err,
                                extend: 'at "' + this.__route__ + '" page ' + attrName + " function"
                            });
                        }
                        return res;
                    }.bind(curPage) : curPage[attrName] = organize(pageObj[attrName])
                );
        };
        for (var key in pageObj) {
            copyPageObjByKey(key);
        }
        "function" == typeof pageObj.onShareAppMessage &&
        ServiceJSBridge.invoke("showShareMenu", {}, utils.info);
    }
    update () {
        utils.warn("将被废弃", "Page.update is deprecated, setData updates the view implicitly. [It will be removed in 2016.11]");
    }
    forceUpdate() {
        utils.warn("将被废弃", "Page.forceUpdate is deprecated, setData updates the view implicitly. [It will be removed in 2016.11]");
    }
    setData(dataObj) {
        try {
            var type = utils.getDataType(dataObj);
            "Object" !== type && utils.error("类型错误", "setData accepts an Object rather than some " + type);
            for (var key in dataObj) {
                var curValue = parsePath.getObjectByPath(this.data, key),
                    curObj = curValue.obj,
                    curKey = curValue.key;
                curObj && (curObj[curKey] = organize(dataObj[key]));
            }
            toAppView.emit(dataObj, this.__wxWebviewId__);
        } catch(e) {
            utils.errorReport(e);
        }
    }
}
export default parsePage;