import './Utils'

let bottomCheckDistance = 20,
  windowScrollY = 0,
  stopedTouch = !1,
  refreshFinish = !0

const getWindowHeight = function () {
  return document.compatMode === 'CSS1Compat'
    ? document.documentElement.clientHeight
    : document.body.clientHeight
}

const getScrollHeight = function () {
  let bodyScrollHeight = 0, documentElementScrollHeight = 0
  document.body && (bodyScrollHeight = document.body.scrollHeight)
  document.documentElement &&
    (documentElementScrollHeight = document.documentElement.scrollHeight)
  return Math.max(bodyScrollHeight, documentElementScrollHeight)
}

const checkScrollBottom = function () {
  let isGoingBottom = windowScrollY - window.scrollY <= 0
  windowScrollY = window.scrollY
  let ref = window.scrollY + getWindowHeight() + bottomCheckDistance
  return !!(ref >= getScrollHeight() && isGoingBottom)
}

const triggerPullUpRefresh = function () {
  if (refreshFinish && !stopedTouch) {
    wx.publishPageEvent('onReachBottom', {})
    refreshFinish = !1
    setTimeout(
      function () {
        refreshFinish = !0
      },
      350
    )
  }
}

const enablePullUpRefresh = function () {
  if (window.__enablePullUpRefresh__) {
    !(function () {
      window.onscroll = function () {
        checkScrollBottom() && triggerPullUpRefresh()
      }
      let startPoint = 0
      window.__DOMTree__.addListener('touchstart', function (event) {
        startPoint = event.touches[0].pageY
        stopedTouch = !1
      })
      window.__DOMTree__.addListener('touchmove', function (event) {
        if (!stopedTouch) {
          let currentPoint = event.touches[0].pageY
          if (currentPoint < startPoint && checkScrollBottom()) {
            triggerPullUpRefresh()
            stopedTouch = !0
          }
        }
      })
      window.__DOMTree__.addListener('touchend', function (event) {
        stopedTouch = !1
      })
    })()
  }
}

export default {
  getScrollHeight,
  getWindowHeight,
  checkScrollBottom,
  triggerPullUpRefresh,
  enablePullUpRefresh
}
