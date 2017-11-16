//1-15 绑定AppEnterForeground与AppEnterBackground

import pubsub from './bridge'
import EventEmitter2 from './EventEmitter2'
import configFlags from './configFlags'
import utils from './utils'


var eventEmitter = new EventEmitter2();
pubsub.onMethod("onAppEnterForeground",
  function () {
    var params = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    eventEmitter.emit("onAppEnterForeground", params)
  }
);
pubsub.onMethod("onAppEnterBackground",
  function () {
    var params = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    eventEmitter.emit("onAppEnterBackground", params)
  }
);
pubsub.onMethod("onAppRunningStatusChange",
  function () {
    var params = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    utils.defaultRunningStatus = params.status;
    eventEmitter.emit("onAppRunningStatusChange", params)
  }
);

var onAppEnterForeground = function (fn) {
  var self = this;
  "function" == typeof fn && setTimeout(fn, 0);
  eventEmitter.on("onAppEnterForeground",
      function (params) {
        pubsub.publish("onAppEnterForeground", params),
        self.appStatus = configFlags.AppStatus.FORE_GROUND,
        "function" == typeof fn && fn(params)
      }
  )
}

var onAppEnterBackground = function (fn) {
  var self = this;
  eventEmitter.on("onAppEnterBackground", function (params) {
    params = params || {}
    pubsub.publish("onAppEnterBackground", params)
    "hide" === params.mode ?
        self.appStatus = configFlags.AppStatus.LOCK :
        self.appStatus = configFlags.AppStatus.BACK_GROUND,
    "close" === params.mode ?
        self.hanged = !1 :
        "hang" === params.mode && (self.hanged = !0),
    "function" == typeof fn && fn(params)
  })
};
var onAppRunningStatusChange = function (fn) {
  eventEmitter.on("onAppRunningStatusChange",function (params) {
    "function"  == typeof fn && fn(params)
  })
};

export default {
  onAppEnterForeground: onAppEnterForeground,
  onAppEnterBackground: onAppEnterBackground,
  onAppRunningStatusChange: onAppRunningStatusChange
}

