var e = 1
window.exparser.registerBehavior({
  is: 'wx-positioning-target',
  created: function () {
    this._positioningId = e++
    this._parentPositioningContainer = null
    this._positioningSyncing = !1
  },
  detached: function () {
    this._positioningId = e++
  },
  _requestPositioningContainer: function () {
    this.triggerEvent(
      'wxAddPositionTracker',
      { element: this },
      { bubbles: !0, composed: !0 }
    )
  },
  trackPositionInDocument: function () {
    this._positioningSyncing ||
      ((this._positioningSyncing = !0),
      (this._parentPositioningContainer = document))
  },
  trackPositionInContainer: function (e) {
    this._positioningSyncing ||
      ((this._positioningSyncing = !0), (this._parentPositioningContainer = e))
  },
  getPositioningOffset: function () {
    var e = this.$$.getBoundingClientRect()
    if (this._parentPositioningContainer === document) {
      return {
        left: e.left + window.scrollX,
        top: e.top + window.scrollY,
        width: this.$$.offsetWidth,
        height: this.$$.offsetHeight
      }
    }
    var t = this._parentPositioningContainer.$$.getBoundingClientRect()
    return {
      left: e.left - t.left,
      top: e.top - t.top,
      width: this.$$.offsetWidth,
      height: this.$$.offsetHeight
    }
  },
  fetchPositioningParentId: function () {
    return 0
  },
  getPositioningId: function () {
    return this._positioningId
  }
})

// window.exparser.registerBehavior({
//   is: 'wx-positioning-container',
//   behaviors: ['wx-positioning-target'],
//   attached: function () {
//     var e = this
//     document.addEventListener('pageReRender', function () {
//       if (e._positioningSyncing) {
//         var t = e.getPositioningOffset(),
//           n = e.getScrollPosition(),
//           i = n.scrollLeft,
//           o = n.scrollTop
//         e._sendContainerUpdate(i, o, t)
//       }
//     })
//   },
//   detached: function () {
//     this._positioningSyncing && this._sendContainerRemoval()
//   },
//   listeners: { 'this.wxAddPositionTracker': '_addPositionTracker' },
//   methods: {
//     _addPositionTracker: function (e) {
//       if (e.target !== this) {
//         return this._positioningSyncing ||
//           (this._requestPositioningContainer(), this._positioningSyncing ||
//             this.trackPositionInDocument()), e.detail.element.trackPositionInContainer(
//           this
//         ), !1
//       }
//     },
//     trackPositionInDocument: function () {
//       this._positioningSyncing ||
//         ((this._positioningSyncing = !0), (this._parentPositioningContainer = document), this._initPositioningContainer())
//     },
//     trackPositionInContainer: function (e) {
//       this._positioningSyncing ||
//         ((this._positioningSyncing = !0), (this._parentPositioningContainer = e), this._initPositioningContainer())
//     },
//     _initPositioningContainer: function () {
//       var e = this.getPositioningOffset(),
//         t = this.getScrollPosition(),
//         n = t.scrollLeft,
//         i = t.scrollTop
//       this._sendContainerCreation(n, i, e)
//     },
//     _sendContainerCreation: function (e, t, n) {
//       this._positioningId, this._parentPositioningContainer === document ||
//         this._parentPositioningContainer._positioningId
//     },
//     _sendContainerUpdate: function (e, t, n) {
//       this._positioningId
//     },
//     _sendContainerRemoval: function () {},
//     getScrollPosition: function () {
//       return { scrollLeft: 0, scrollTop: 0 }
//     },
//     updateScrollPosition: function (e) {
//       if (this._positioningSyncing) {
//         var t = this.getScrollPosition(), n = t.scrollLeft, i = t.scrollTop
//         return (
//           !(!e && this._prevScrollLeft === n && this._prevScrollTop === i) &&
//           ((this._prevScrollLeft = n), (this._prevScrollTop = i), this._sendContainerUpdate(
//             n,
//             i,
//             e
//           ), !0)
//         )
//       }
//     }
//   }
// })
