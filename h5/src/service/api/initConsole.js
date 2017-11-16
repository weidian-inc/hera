//1-11 线上针对debug相关函数做处理

import pubsub from './bridge'
import utils from './utils'
import configFlags from './configFlags'

"undefined" != typeof __wxConfig__ &&
__wxConfig__.debug &&
"devtools" !==  utils.getPlatform() &&
!function () {
    var logQueue = [],
        viewIds = [],
        consoleMethods = ["log", "warn", "error", "info", "debug"];
    consoleMethods.forEach(function (key) {
        var consoleMethod = console[key];
        console[key] = function () {
            logQueue.length > configFlags.LOG_LIMIT && logQueue.shift();
            var logArr = Array.prototype.slice.call(arguments);

            logQueue.push({
                method: key,
                log: logArr
            })

            consoleMethod.apply(console, arguments),
            viewIds.length > 0 &&  pubsub.publish(key, { log: logArr}, viewIds)
        }
    })
    pubsub.subscribe("DOMContentLoaded", function (n, viewId) {
        viewIds.push(viewId)
        pubsub.publish("initLogs", { logs: logQueue}, [viewId])
    })
}(),
"undefined" == typeof console.group && (console.group = function () { }),
"undefined" == typeof console.groupEnd && (console.groupEnd = function () { })
