import './bridge'
import './utils'
import EventEmitter2 from  './EventEmitter2'
import configFlags from './configFlags'


function createAudio(e, t) {
    var self = this,
        audioObj = new Audio(e, t);
    audioObj._getAppStatus = function () {
        return self.appStatus
    }
    audioObj._getHanged = function () {
        return self.hanged
    }
    this.onAppEnterBackground(function () {
        audioObj.pause()
    })
    return audioObj
}

var audioFlags = {},
    eventEmitter2 = new EventEmitter2.EventEmitter2;

ServiceJSBridge.subscribe("audioInsert", function (params, webviewId) {
    var audioId = params.audioId
    audioFlags[webviewId + "_" + audioId] = !0
    eventEmitter2.emit("audioInsert_" + webviewId + "_" + audioId)
});

class Audio {
    constructor(audioId, webviewId) {
        if ("string" != typeof audioId) throw new Error("audioId should be a String");
        this.audioId = audioId
        this.webviewId = webviewId
    }


    setSrc(data) {
        this._sendAction({
            method: "setSrc",
            data: data
        })
    }

    play() {
        var status = this._getAppStatus();
        this._getHanged();
        status === configFlags.AppStatus.BACK_GROUND || this._sendAction({
            method: "play"
        })
    }

    pause() {
        this._sendAction({
            method: "pause"
        })
    }

    seek(data) {
        this._sendAction({
            method: "setCurrentTime",
            data: data
        })
    }


    _ready(fn) {
        audioFlags[this.webviewId + "_" + this.audioId] ?
            fn() : eventEmitter2.on("audioInsert_" + this.webviewId + "_" + this.audioId, function () { fn() })
    }


    _sendAction(params) {
        var self = this;
        this._ready(function () {
            ServiceJSBridge.publish("audio_" + self.audioId + "_actionChanged", params, [self.webviewId])
        })
    }

}


export default createAudio;