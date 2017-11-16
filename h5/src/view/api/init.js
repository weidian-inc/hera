// 20 log 相关

import bridge from './bridge'



function execOnReady(callback) {
  "loading" !== document.readyState ? callback() : document.addEventListener("DOMContentLoaded", callback)
}


var hasInitLogs = !1,
    consoleMethods = ["log", "warn", "error", "info", "debug"];

consoleMethods.forEach(function (method) {
  bridge.subscribe(method, function (params) {
    var log = params.log;
    console[method].apply(console, log)
  })
});
bridge.subscribe("initLogs", function (params) {
  var logs = params.logs;
  if(hasInitLogs === !1){
    hasInitLogs = !0
    logs.forEach(function (args) {
      var method = args.method,
          log = args.log;
      console[method].apply(console, log);
    })
    hasInitLogs = !0
  }
});

execOnReady(function () {
  setTimeout(function () {
      bridge.publish("DOMContentLoaded", {})
      if(__bridgeVersion=='2.0'){
          bridge.publish('getConfig', __wxConfig);
      }
  }, 1e2)
})
