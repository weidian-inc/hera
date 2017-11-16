/**
 * Returns "touchAction", "msTouchAction", or null.
 */

function touchActionProperty (doc) {
  if (!doc) doc = document
  var div = doc.createElement('div')
  var prop = null
  if ('touchAction' in div.style) prop = 'touchAction'
  else if ('msTouchAction' in div.style) prop = 'msTouchAction'
  div = null
  return prop
}

let transform = transform
;(function detectTransform () {
  var styles = [
    'webkitTransform',
    'MozTransform',
    'msTransform',
    'OTransform',
    'transform'
  ]

  var el = document.createElement('p')

  for (var i = 0; i < styles.length; i++) {
    if (el.style[styles[i]] != null) {
      transform = styles[i]
      break
    }
  }
})()

/**
 * Module exports.
 */
exports.transform = transform
exports.touchAction = touchActionProperty()
