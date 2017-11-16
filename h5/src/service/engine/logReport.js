
export var triggerAnalytics = function(eventName, pageObj, desc) {
    let data = {};
    if (pageObj) {
        data.pageRoute = pageObj.__route__;
    }
    if(desc){
        data.desc = desc;
    }
    ServiceJSBridge.publish("H5_LOG_MSG", {event:eventName,desc:data}, [pageObj && pageObj.__wxWebviewId__ || '']);
};
