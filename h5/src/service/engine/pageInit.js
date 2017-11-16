import utils from './utils';
import parsePage from './parsePage';
import * as eventDefine from './constants';
import * as reportRealtimeAction from './logReport';



var getRouteToPage;
var getWebviewIdToPage;
var setWxRouteBegin;
var setWxRoute;
var setWxConfig;
var reset;
var pageHolder;
var getCurrentPages;
var getCurrentPage;


var pageStack = [];
var tabBars = [];//tab栏url列表
var currentPage;
__wxConfig__.tabBar &&
__wxConfig__.tabBar.list &&
"object" === typeof(__wxConfig__.tabBar.list) &&
"function" == typeof __wxConfig__.tabBar.list.forEach &&
__wxConfig__.tabBar.list.forEach(function(item) {
    tabBars.push(item.pagePath);
});

var app = {
    appRouteTime: 0,
    newPageTime: 0,
    pageReadyTime: 0
};

var speedReport = function(key, startTime, endTime) {
    Reporter.speedReport({
        key: key,
        timeMark: {
            startTime: startTime,
            endTime: endTime
        }
    });
};

var pageStackObjs = {};
var pageRegObjs = {};//key:pathname
var pageIndex = 0;

getCurrentPage = function() {
    return currentPage
};
getCurrentPages = function() {
    var pageArr = [];
    pageStack.forEach(function(pageObj) {
        pageArr.push(pageObj.page);
    });
    return pageArr;
};
pageHolder = function(pageObj) {//Page 接口
    if (!__wxRouteBegin) {
        throw utils.error("Page 注册错误", "Please do not register multiple Pages in " + __wxRoute + ".js");
        new utils.AppServiceEngineKnownError("Please do not register multiple Pages in " + __wxRoute + ".js");
    }

    __wxRouteBegin = !1;
    var pages = __wxConfig__.pages,
        pagePath = pages[pageIndex];
    pageIndex++;
    if ("Object" !== utils.getDataType(pageObj)) {
        throw utils.error("Page 注册错误", "Options is not object: " + JSON.stringify(pageObj) + " in " + __wxRoute + ".js")
        new utils.AppServiceEngineKnownError("Options is not object: " + JSON.stringify(pageObj) + " in " + __wxRoute + ".js");
    }
    utils.info("Register Page: " + pagePath);
    pageRegObjs[pagePath] = pageObj;
};
var pageInitData = utils.surroundByTryCatch(
    function(pageObj, webviewId) {
        utils.info("Update view with init data");
        var ext = {};
        ext.webviewId = webviewId,
        ext.enablePullUpRefresh = pageObj.hasOwnProperty("onReachBottom");
        var params = {
            data: {
                data: pageObj.data,
                ext: ext,
                options: {
                    firstRender: !0
                }
            }
        };
        utils.publish("appDataChange", params, [webviewId]);
    }
);
var pageParse = function(routePath, webviewId, params) {//解析page e:pagepath t:webviewId params:
    var curPageObj = undefined;
    routePath = routePath.replace(/\.htm[^\.]*$/,'');
    if (pageRegObjs.hasOwnProperty(routePath)) {
        curPageObj = pageRegObjs[routePath];
    } else {
        utils.warn("Page route 错误", "Page[" + routePath + "] not found. May be caused by: 1. Forgot to add page route in app.json. 2. Invoking Page() in async task.");
        curPageObj = {};
    }
    app.newPageTime = Date.now()
    var page = new parsePage(curPageObj, webviewId, routePath)
    pageInitData(page, webviewId)
    if(utils.isDevTools()){
        __wxAppData[routePath] = page.data
        __wxAppData[routePath].__webviewId__ = webviewId
        utils.publish(eventDefine.UPDATE_APP_DATA)
    }
    currentPage = {
        page: page,
        webviewId: webviewId,
        route: routePath
    };
    pageStack.push(currentPage);
    page.onLoad(params);
    page.onShow();
    pageStackObjs[webviewId] = {
        page: page,
        route: routePath
    };
    reportRealtimeAction.triggerAnalytics("enterPage", page);
    speedReport("appRoute2newPage", app.appRouteTime, app.newPageTime);
};

var pageHide = function(pageItem) {//执行page hide event
    pageItem.page.onHide();
    reportRealtimeAction.triggerAnalytics("leavePage", pageItem.page);
};

var pageUnload = function(pageItem) {//do page unload
    pageItem.page.onUnload();
    utils.isDevTools() && (delete __wxAppData[pageItem.route], utils.publish(eventDefine.UPDATE_APP_DATA));
    delete pageStackObjs[pageItem.webviewId];
    pageStack = pageStack.slice(0, pageStack.length - 1);
    reportRealtimeAction.triggerAnalytics("leavePage", pageItem.page);
};

var isTabBarsPage = function(pageItem) {//
    return tabBars.indexOf(pageItem.route) !== -1 || tabBars.indexOf(pageItem.route + ".html") !== -1;
};

var skipPage = function(routePath, pWebViewId, pageParams, pApiKey) {//打开、跳转页面
    utils.info("On app route: " + routePath)
    app.appRouteTime = Date.now()
    if ("navigateTo" === pApiKey) {
        currentPage && pageHide(currentPage);
        pageStackObjs.hasOwnProperty(pWebViewId) ?
            utils.error("Page route 错误(system error)", "navigateTo with an already exist webviewId " + pWebViewId) :
            pageParse(routePath, pWebViewId, pageParams);
    } else if ("redirectTo" === pApiKey) {
        currentPage && pageUnload(currentPage);
        pageStackObjs.hasOwnProperty(pWebViewId) ?
            utils.error("Page route 错误(system error)", "redirectTo with an already exist webviewId " + pWebViewId) :
            pageParse(routePath, pWebViewId, pageParams);
    }else if ("navigateBack" === pApiKey) {
        for (var isExist = !1,i = pageStack.length - 1; i >= 0; i--) {
            var pageItem = pageStack[i];
            if (pageItem.webviewId === pWebViewId) {
                isExist = !0;
                currentPage = pageItem;
                pageItem.page.onShow();
                reportRealtimeAction.triggerAnalytics("enterPage", pageItem);
                break;
            }
            pageUnload(pageItem);
        }
        isExist || utils.error("Page route 错误(system error)", "navigateBack with an unexist webviewId " + pWebViewId);
    }else if ("reLaunch" === pApiKey) {
        currentPage && pageUnload(currentPage);
        pageStackObjs.hasOwnProperty(pWebViewId) ?
          utils.error("Page route 错误(system error)", "redirectTo with an already exist webviewId " + pWebViewId) :
         pageParse(routePath, pWebViewId, pageParams);
    } else if ("switchTab" === pApiKey) {
        for (var onlyOnePage = !0; pageStack.length > 1;) {
            pageUnload(pageStack[pageStack.length - 1]);
            onlyOnePage = !1;
        }
        if (pageStack[0].webviewId === pWebViewId) {
            currentPage = pageStack[0];
            onlyOnePage || currentPage.page.onShow();
        } else if (isTabBarsPage(pageStack[0]) ? onlyOnePage && pageHide(pageStack[0]) : pageUnload(pageStack[0]), pageStackObjs.hasOwnProperty(pWebViewId)) {
            var pageObj = pageStackObjs[pWebViewId].page;
            currentPage = {
                webviewId: pWebViewId,
                route: routePath,
                page: pageObj
            }
            pageStack = [currentPage];
            pageObj.onShow();
            reportRealtimeAction.triggerAnalytics("enterPage", pageObj);
        } else {
            pageStack = [];
            pageParse(routePath, pWebViewId, pageParams);
        }
    } else {
        "appLaunch" === pApiKey ?
            pageStackObjs.hasOwnProperty(pWebViewId) ?
                utils.error("Page route 错误(system error)", "appLaunch with an already exist webviewId " + pWebViewId) :
                pageParse(routePath, pWebViewId, pageParams)
            : utils.error("Page route 错误(system error)", "Illegal open type: " + pApiKey);
    }
};

var doWebviewEvent = function(pWebviewId, pEvent, params) {//do dom ready
    if (!pageStackObjs.hasOwnProperty(pWebviewId)) {
        return utils.warn("事件警告", "OnWebviewEvent: " + pEvent + ", WebviewId: " + pWebviewId + " not found");
    }
    var pageItem = pageStackObjs[pWebviewId],
        pageObj = pageItem.page;
    return pEvent === eventDefine.DOM_READY_EVENT ?
        (
            app.pageReadyTime = Date.now(),
            utils.info("Invoke event onReady in page: " + pageItem.route),
            pageObj.onReady(),reportRealtimeAction.triggerAnalytics("pageReady", pageObj),
            void speedReport("newPage2pageReady", app.newPageTime, app.pageReadyTime)
        ) :
        (
            utils.info("Invoke event " + pEvent + " in page: " + pageItem.route),
            pageObj.hasOwnProperty(pEvent) ?
                utils.safeInvoke.call(pageObj, pEvent, params) :
                utils.warn("事件警告", "Do not have " + pEvent + " handler in current page: " + pageItem.route + ". Please make sure that " + pEvent + " handler has been defined in " + pageItem.route + ", or " + pageItem.route + " has been added into app.json")
        );
};

var pullDownRefresh = function(pWebviewId) {//do pulldownrefresh
    pageStackObjs.hasOwnProperty(pWebviewId) ||
    utils.warn("事件警告", "onPullDownRefresh WebviewId: " + pWebviewId + " not found");
    var pageItem = pageStackObjs[pWebviewId],
        pageObj = pageItem.page;
    if(pageObj.hasOwnProperty("onPullDownRefresh")){
        utils.info("Invoke event onPullDownRefresh in page: " + pageItem.route)
        utils.safeInvoke.call(pageObj, "onPullDownRefresh")
        reportRealtimeAction.triggerAnalytics("pullDownRefresh", pageObj)
    }
}

var invokeShareAppMessage = function(params, pWebviewId) {//invoke event onShareAppMessage
    var shareParams = params,
        pageItem = pageStackObjs[pWebviewId],
        pageObj = pageItem.page,
        eventName = "onShareAppMessage";
    if (pageObj.hasOwnProperty(eventName)) {
        utils.info("Invoke event onShareAppMessage in page: " + pageItem.route);
        var shareObj = utils.safeInvoke.call(pageObj, eventName) || {};
        shareParams.title = shareObj.title || params.title
        shareParams.desc = shareObj.desc || params.desc
        shareParams.path = shareObj.path ? utils.addHtmlSuffixToUrl(shareObj.path) : params.path
        shareParams.path.length > 0 && "/" === shareParams.path[0] && (shareParams.path = shareParams.path.substr(1))
        shareParams.success = shareObj.success
        shareParams.cancel = shareObj.cancel
        shareParams.fail = shareObj.fail
        shareParams.complete = shareObj.complete
    }
    return shareParams;
};
wd.onAppRoute(utils.surroundByTryCatch(function(params) {
    var path = params.path,
        webviewId = params.webviewId,
        query = params.query || {},
        openType = params.openType;
    skipPage(path, webviewId, query, openType);
}), "onAppRoute");

wd.onWebviewEvent(utils.surroundByTryCatch(function(params) {
    var webviewId = params.webviewId,
        eventName = params.eventName,
        data = params.data;
    return doWebviewEvent(webviewId, eventName, data);
},"onWebviewEvent"));

ServiceJSBridge.on("onPullDownRefresh", utils.surroundByTryCatch(function(e, pWebViewId) {
    pullDownRefresh(pWebViewId);
},"onPullDownRefresh"));

var shareAppMessage = function(params, webviewId) {
    var shareInfo = invokeShareAppMessage(params, webviewId);
    ServiceJSBridge.invoke("shareAppMessage", shareInfo, function(res) {
        / ^shareAppMessage: ok /.test(res.errMsg) &&
        "function" == typeof shareInfo.success ?
            shareInfo.success(res) :
            /^shareAppMessage:cancel/.test(res.errMsg) && "function" == typeof shareInfo.cancel ?
                shareInfo.cancel(res) :
                /^shareAppMessage:fail/.test(res.errMsg) && "function" == typeof shareInfo.fail && shareInfo.fail(res),//bug?? 原代码：shareInfo.fail && shareInfo.cancel(res)
        "function" == typeof shareInfo.complete && shareInfo.complete(res)
    });
};

ServiceJSBridge.on("onShareAppMessage", utils.surroundByTryCatch(shareAppMessage, "onShareAppMessage"));
reset = function() {
    currentPage = undefined;
    pageStackObjs = {};
    pageRegObjs = {};
    pageStack = [];
    pageIndex = 0;
};
setWxConfig = function(e) {
    __wxConfig__ = e;
};
setWxRoute = function(e) {
    __wxRoute = e;
};
setWxRouteBegin = function(e) {
    __wxRouteBegin = e;
};
getWebviewIdToPage = function() {
    return pageStackObjs;
};
getRouteToPage = function() {
    return pageRegObjs;
};

export default {
    getRouteToPage,
    getWebviewIdToPage,
    setWxRouteBegin,
    setWxRoute,
    setWxConfig,
    reset,
    pageHolder,
    getCurrentPages,
    getCurrentPage
}