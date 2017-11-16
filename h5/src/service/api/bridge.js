import  utils from './utils'


function invoke() {//ServiceJSBridge.invoke
    ServiceJSBridge.invoke.apply(ServiceJSBridge, arguments)
}

function on() {//ServiceJSBridge.on
    ServiceJSBridge.on.apply(ServiceJSBridge, arguments)
}

function publish() {//ServiceJSBridge.publish
    var args = Array.prototype.slice.call(arguments);
    args[1] = {
        data: args[1],
        options: {
            timestamp: Date.now()
        }
    }
    ServiceJSBridge.publish.apply(ServiceJSBridge, args)
}

function subscribe() {//ServiceJSBridge.subscribe
    var args = Array.prototype.slice.call(arguments),
        callback = args[1];
    args[1] = function (params, viewId) {
        var data = params.data,
            options = params.options,
            timeMark = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
            timestamp = options && options.timestamp || 0,
            curTime = Date.now();
        "function" == typeof callback && callback(data, viewId)
        Reporter.speedReport({
            key: "webview2AppService",
            data: data || {},
            timeMark: {
                startTime: timestamp,
                endTime: curTime,
                nativeTime: timeMark.nativeTime || 0
            }
        })
    }
    ServiceJSBridge.subscribe.apply(ServiceJSBridge, args)
}

function invokeMethod(apiName) {
    var options = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
        innerFns = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
        params = {};
    for (var i in options){
        "function" == typeof options[i] && (params[i] = Reporter.surroundThirdByTryCatch(options[i], "at api " + apiName + " " + i + " callback function"), delete options[i]);
    }
    var sysEventFns = {};
    for (var s in innerFns){
        "function" == typeof innerFns[s] && (sysEventFns[s] =  utils.surroundByTryCatchFactory(innerFns[s], "at api " + apiName + " " + s + " callback function"));
    }
    invoke(apiName, options, function (res) {
            res.errMsg = res.errMsg || apiName + ":ok";
            var isOk = 0 === res.errMsg.indexOf(apiName + ":ok"),
                isCancel = 0 === res.errMsg.indexOf(apiName + ":cancel"),
                isFail = 0 === res.errMsg.indexOf(apiName + ":fail");
            if ("function" == typeof sysEventFns.beforeAll && sysEventFns.beforeAll(res), isOk){
                "function" == typeof sysEventFns.beforeSuccess && sysEventFns.beforeSuccess(res),
                "function" == typeof params.success && params.success(res),
                "function" == typeof sysEventFns.afterSuccess && sysEventFns.afterSuccess(res);
            }else if (isCancel) {
                res.errMsg = res.errMsg.replace(apiName + ":cancel", apiName + ":fail cancel"),
                "function" == typeof params.fail && params.fail(res),
                "function" == typeof sysEventFns.beforeCancel && sysEventFns.beforeCancel(res),
                "function" == typeof params.cancel && params.cancel(res),
                "function" == typeof sysEventFns.afterCancel && sysEventFns.afterCancel(res);
            }else if (isFail) {
                "function" == typeof sysEventFns.beforeFail && sysEventFns.beforeFail(res),
                "function" == typeof params.fail && params.fail(res);
                var rt = !0;
                "function" == typeof sysEventFns.afterFail && (rt = sysEventFns.afterFail(res)),
                rt !== !1 && Reporter.reportIDKey({
                    key: apiName + "_fail"
                })
            }
            "function" == typeof params.complete && params.complete(res),
            "function" == typeof sysEventFns.afterAll && sysEventFns.afterAll(res)
        }
    )
    Reporter.reportIDKey({
        key: apiName
    })
}
function noop() {}
function onMethod(apiName, callback) {//onMethod
    on(apiName,  utils.surroundByTryCatchFactory(callback, "at api " + apiName + " callback function"))
}
function beforeInvoke(apiName, params, paramTpl) {
    var res = utils.paramCheck(params, paramTpl);
    return !res || (beforeInvokeFail(apiName, params, "parameter error: " + res), !1)
}

function beforeInvokeFail(apiName) {
    var params = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
        errMsg = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "", 
        err = apiName + ":fail " + errMsg;
    console.error(err);
    var fail = Reporter.surroundThirdByTryCatch(params.fail || noop, "at api " + apiName + " fail callback function"),
        complete = Reporter.surroundThirdByTryCatch(params.complete || noop, "at api " + apiName + " complete callback function");
    fail({errMsg: err})
    complete({errMsg: err})
}

function checkUrlInConfig(apiName, url, params) {
    var path = url.replace(/\.html\?.*|\.html$/, "");
    return -1 !== __wxConfig.pages.indexOf(path) || (beforeInvokeFail(apiName, params, 'url "' + utils.removeHtmlSuffixFromUrl(url) + '" is not in app.json'), !1)
}


export default {
    invoke: invoke,
    on: on,
    publish: publish,
    subscribe: subscribe,
    invokeMethod: invokeMethod,
    onMethod: onMethod,
    noop: noop,
    beforeInvoke: beforeInvoke,
    beforeInvokeFail: beforeInvokeFail,
    checkUrlInConfig: checkUrlInConfig
}