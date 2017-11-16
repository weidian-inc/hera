import pubsub from './bridge'
import utils from './utils'
import EventEmitter2 from './EventEmitter2'
import configFlags from './configFlags'


function createVideo(videoId, t) {
    var self = this,
        videoObj = new VideoControl(videoId, t);
    videoObj._getAppStatus = function () {
        return self.appStatus
    }
    videoObj._getHanged = function () {
        return self.hanged
    }
    this.onAppEnterBackground(function () {
        videoObj.pause()
    })
    return videoObj
}

var notIOS = "ios" !== utils.getPlatform(),
    videoPlayerIds = {},
    EventEmitter = new EventEmitter2.EventEmitter2;

ServiceJSBridge.subscribe("videoPlayerInsert", function (params, t) {
    var domId = params.domId,
        videoPlayerId = params.videoPlayerId;
    videoPlayerIds[domId] = videoPlayerIds[domId] || videoPlayerId
    EventEmitter.emit("videoPlayerInsert", domId)
})

ServiceJSBridge.subscribe("videoPlayerRemoved", function (params, t) {
    var domId = params.domId;
    params.videoPlayerId;
    delete videoPlayerIds[domId]
});

class VideoControl {
    constructor(videoId) {
        if ("string" != typeof videoId) throw new Error("video ID should be a String");
        this.domId = videoId
    }

    play() {
        var appStatus = this._getAppStatus();
        appStatus === configFlags.AppStatus.BACK_GROUND || appStatus === configFlags.AppStatus.LOCK || this._invokeMethod("play");
    }

    pause() {
        this._invokeMethod("pause")
    }

    seek(e) {
        this._invokeMethod("seek", [e])
    }

    sendDanmu(params) {
        var text = params.text,
            color = params.color;
        this._invokeMethod("sendDanmu", [text, color])
    }

    _invokeMethod(type, data) {
        function invoke() {
            notIOS ? (this.action = { method: type, data: data}, this._sendAction()) : pubsub.invokeMethod("operateVideoPlayer", {
                data: data,
                videoPlayerId: videoPlayerIds[this.domId],
                type: type
            })
        }

        var self = this;
        "number" == typeof videoPlayerIds[this.domId] ?
            invoke.apply(this) :
            EventEmitter.on("videoPlayerInsert", function (e) { invoke.apply(self) })
    }

    _sendAction() {
        ServiceJSBridge.publish("video_" + this.domId + "_actionChanged", this.action)
    }
}

export default  createVideo;