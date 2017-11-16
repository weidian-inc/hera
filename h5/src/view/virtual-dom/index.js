import WxVirtualNode from './WxVirtualNode'
import Utils from './Utils'
import WxVirtualText from './WxVirtualText'
import AppData from './AppData'
import ErrorCatcher from './ErrorCatcher'
import TouchEvents from './TouchEvents'
import Init from './Init'

Init.init()

window.__mergeData__ = AppData.mergeData
window.__DOMTree__ = void 0//虚拟dom生成的domtree
//window.firstRender = 0;
let domReady = '__DOMReady'
let rootNode = void 0

const STATE_FLAGS = {
        funcReady: !1,
        dataReady: !1,
        firstRender: !1
}
const dataChangeEventQueue = []
let webViewInfo = {
    webviewStartTime: Date.now(),
    funcReady: 0
}

function speedReport (key, startTime, endTime, data) {
    Reporter.speedReport({
        key: key,
        timeMark: {
            startTime: startTime,
            endTime: endTime
        },
        force: key !== 'reRenderTime',
        data: data
    })
}


const createWXVirtualNode = function (
    tagName,
    props,
    newProps,
    wxkey,
    wxVkey,
    children
) {
    return new WxVirtualNode(tagName, props, newProps, wxkey, wxVkey, children)
}
const createWxVirtualText = function (txt) {
    return new WxVirtualText(txt)
}
const createWXVirtualNodeRec = function (opt) {
    // Recursively
    if (Utils.isString(opt) || Number(opt) === opt && Number(opt) % 1 === 0) {
        return createWxVirtualText(String(opt))
    }
    let children = []
    opt.children.forEach(function (child) {
        children.push(createWXVirtualNodeRec(child))
    })
    return createWXVirtualNode(
        opt.tag,
        opt.attr,
        opt.n,
        opt.wxKey,
        opt.wxVkey,
        children
    )
}
const createBodyNode = function (e) {
        var t = window.__generateFunc__(AppData.getAppData(), e);
        t.tag = "body"
        return createWXVirtualNodeRec(t)
    };


const firstTimeRender = function (event) {
    if (event.ext) {
        "undefined" != typeof event.ext.webviewId && (window.__webviewId__ = event.ext.webviewId)
        event.ext.enablePullUpRefresh && (window.__enablePullUpRefresh__ = !0)
    }
    rootNode = createBodyNode(event.data)
    window.__DOMTree__ = rootNode.render()
    exparser.Element.replaceDocumentElement(window.__DOMTree__, document.body)
    setTimeout(
        function () {
            wx.publishPageEvent(domReady, {})
            wx.initReady()
            TouchEvents.enablePullUpRefresh()
        },
        0
    )
}

const reRender = function (event) {
    var t = createBodyNode(event.data),
        n = rootNode.diff(t);
    n.apply(window.__DOMTree__)
    rootNode = t
};


var renderOnDataChange = function (event) {
    if (STATE_FLAGS.firstRender) {
        setTimeout(
            function () {
                let timeStamp = Date.now()
                reRender(event)
                speedReport('reRenderTime', timeStamp, Date.now())
                document.dispatchEvent(new CustomEvent('pageReRender', {}))
            },
            0
        )
    } else {
        let timeStamp = Date.now()
        speedReport('firstGetData', webViewInfo.funcReady, Date.now())
        firstTimeRender(event)
        speedReport('firstRenderTime', timeStamp, Date.now())
        if (!(event.options && event.options.firstRender)) {
            console.error('firstRender not the data from Page.data')
            Reporter.errorReport({
                key: 'webviewScriptError',
                error: new Error('firstRender not the data from Page.data'),
                extend: 'firstRender not the data from Page.data'
            })
        }
        STATE_FLAGS.firstRender = !0
        document.dispatchEvent(new CustomEvent('pageReRender', {}))
    }
}

window.onerror = function (e, t, n, i, o) {
    console.error(o.stack)
    Reporter.errorReport({
        key: "webviewScriptError",
        error: o
    })
    if ("ios" === wx.getPlatform()) {
        webkit.messageHandlers.publishHandler.postMessage("wawebview sdk error:" + o.msg)
    }
}
wx.onAppDataChange(
    ErrorCatcher.catchError(function (event) {
        STATE_FLAGS.dataReady = !0
        STATE_FLAGS.funcReady ? renderOnDataChange(event) : dataChangeEventQueue.push(event)
    })
)

document.addEventListener(
    'generateFuncReady',
    ErrorCatcher.catchError(function (event) {

        webViewInfo.funcReady = Date.now()
        speedReport(
            'funcReady',
            webViewInfo.webviewStartTime,
            webViewInfo.funcReady
        )
        window.__pageFrameStartTime__ &&
        window.__pageFrameEndTime__ &&
        speedReport(
            'pageframe',
            window.__pageFrameStartTime__,
            window.__pageFrameEndTime__
        )
        window.__WAWebviewStartTime__ &&
        window.__WAWebviewEndTime__ &&
        speedReport(
            'WAWebview',
            window.__WAWebviewStartTime__,
            window.__WAWebviewEndTime__
        )
        window.__generateFunc__ = event.detail.generateFunc
        STATE_FLAGS.funcReady = !0

        if (STATE_FLAGS.dataReady) {
            for (let eventName in dataChangeEventQueue) {
                let event = dataChangeEventQueue[eventName]
                renderOnDataChange(event)
            }
        }
    })
)

export default {
    reset: function () {
        rootNode = void 0
        window.__DOMTree__ = void 0
        // nonsenselet = {}
    }
}