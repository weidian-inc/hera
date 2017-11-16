import pubsub from './bridge'

var foregroundCallbacks = [],
    backgroundCallbacks = [],
    onAppEnterForeground = function (fn) {
      foregroundCallbacks.push(fn)
    },
    onAppEnterBackground = function (fn) {
      backgroundCallbacks.push(fn)
    };
pubsub.subscribe("onAppEnterForeground", function (e) {
  foregroundCallbacks.forEach(function (fn) {
    fn(e)
  })
});
pubsub.subscribe("onAppEnterBackground", function (e) {
  backgroundCallbacks.forEach(function (fn) {
    fn(e)
  })
});

export default  {
  onAppEnterForeground,
  onAppEnterBackground
}
