import utils from './utils';
import pageInit from './pageInit';
import * as reportRealtimeAction from './logReport'

var events = ["onLaunch", "onShow", "onHide", "onUnlaunch"];

var firstRender =true;

var isSysEvent = function(key) {//判断是否为app 事件
    for (var index = 0; index < events.length; ++index) {
        if (events[index] === key) {
            return true;
        }
    }
    return false;
}
var isGetCurrentPage = function(key) {
    return "getCurrentPage" === key;
}

class appClass{
    constructor(appObj) {//t:app
        var self = this;
        events.forEach(function(eventKey) {//给app绑定事件
            var tempFun = function() {
                var eventFun = (appObj[eventKey] || utils.noop).bind(this);
                utils.info("App: " + eventKey + " have been invoked");
                try {
                    eventFun.apply(this, arguments);
                } catch(t) {
                    Reporter.thirdErrorReport({
                        error: t,
                        extend: "App catch error in lifeCycleMethod " + eventKey + " function"
                    });
                }
            };
            self[eventKey] = tempFun.bind(self);
        });
        var bindApp = function(attrKey) {//给app绑定其它方法与属性
            isGetCurrentPage(attrKey) ?
                utils.warn("关键字保护", "App's " + attrKey + " is write-protected") :
                isSysEvent(attrKey) ||
                (
                    "[object Function]" === Object.prototype.toString.call(appObj[attrKey]) ?
                        self[attrKey] = function() {
                            var method;
                            try {
                                method = appObj[attrKey].apply(this, arguments);
                            } catch(t) {
                                Reporter.thirdErrorReport({
                                    error: t,
                                    extend: "App catch error in  " + attrKey + " function"
                                });
                            }
                            return method;
                        }.bind(self) : self[attrKey] = appObj[attrKey]
                );
        };
        for (var attrKey in appObj) {
            bindApp(attrKey);
        }
        this.onError && Reporter.registerErrorListener(this.onError);
        this.onLaunch();
        reportRealtimeAction.triggerAnalytics("launch",null, '小程序启动');
        var hide = function() {//hide
            var pages = pageInit.getCurrentPages();
            pages.length && pages[pages.length - 1].onHide();
            this.onHide();
            reportRealtimeAction.triggerAnalytics("background",null, '小程序转到后台');
        };
        var show = function() {//show
            this.onShow();
            if (firstRender) {
                firstRender = false;
            } else {
                var pages = pageInit.getCurrentPages();
                pages.length &&
                (
                    pages[pages.length - 1].onShow(),
                    reportRealtimeAction.triggerAnalytics("foreground",null, '小程序转到前台')
                );
            }
        };
        wd.onAppEnterBackground(hide.bind(this));
        wd.onAppEnterForeground(show.bind(this));
    }
    getCurrentPage () {
        utils.warn("将被废弃", "App.getCurrentPage is deprecated, please use getCurrentPages. [It will be removed in 2016.11]");
        var currentPage = pageInit.getCurrentPage();
        if (currentPage) {
            return currentPage.page;
        }
    }

}

var tempObj ;

var appHolder = utils.surroundByTryCatch(function(appObj) {
    tempObj = new appClass(appObj);
}, "create app instance");
var getApp = function() {
    return tempObj;
};

export default {appHolder,getApp};
