import Events from './Events'

const Behavior = function () {
}

Behavior.prototype = Object.create(Object.prototype, {
  constructor: {
    value: Behavior,
    writable: true,
    configurable: true
  }
})

const cycle = ['created', 'attached', 'detached']
let index = 1

// registerBehavior
Behavior.create = function (opt) {
  let id = String(index++)
  let insBehavior = Behavior.list[opt.is || ''] = Object.create(Behavior.prototype, {
    is: {
      value: opt.is || ''
    },
    _id: {
      value: id
    }
  })
  insBehavior.template = opt.template
  insBehavior.properties = Object.create(null)
  insBehavior.methods = Object.create(null)
  insBehavior.listeners = Object.create(null)
  let ancestors = insBehavior.ancestors = [], prop = '', idx = 0
  for (; idx < (opt.behaviors || []).length; idx++) {
    let currBehavior = opt.behaviors[idx]
    typeof currBehavior === 'string' && (currBehavior = Behavior.list[currBehavior])
    for (prop in currBehavior.properties) {
      insBehavior.properties[prop] = currBehavior.properties[prop]
    }
    for (prop in currBehavior.methods) {
      insBehavior.methods[prop] = currBehavior.methods[prop]
    }
    for (let i = 0; i < currBehavior.ancestors.length; i++) {
      if (ancestors.indexOf(currBehavior.ancestors[i]) < 0) {
        ancestors.push(currBehavior.ancestors[i])
      }
    }
  }
  for (prop in opt.properties) {
    insBehavior.properties[prop] = opt.properties[prop]
  }
  for (prop in opt.listeners) {
    insBehavior.listeners[prop] = opt.listeners[prop]
  }
  for (prop in opt) {
    if (typeof opt[prop] === 'function') {
      if (cycle.indexOf(prop) < 0) {
        insBehavior.methods[prop] = opt[prop]
      } else {
        insBehavior[prop] = opt[prop]
      }
    }
  }
  ancestors.push(insBehavior)
  return insBehavior
}

Behavior.list = Object.create(null)

Behavior.prototype.hasBehavior = function (beh) {
  for (let idx = 0; idx < this.ancestors.length; idx++) {
    if (this.ancestors[idx].is === beh) {
      return true
    }
  }
  return false
}

Behavior.prototype.getAllListeners = function () {
  let tempObj = Object.create(null), ancestors = this.ancestors, idx = 0
  for (; idx < ancestors.length; idx++) {
    let ancestor = this.ancestors[idx]
    for (let key in ancestor.listeners) {
      if (tempObj[key]) {
        tempObj[key].push(ancestor.listeners[key])
      } else {
        tempObj[key] = [ancestor.listeners[key]]
      }
    }
  }
  return tempObj
}

Behavior.prototype.getAllLifeTimeFuncs = function () {
  let tempObj = Object.create(null),
    ancestors = this.ancestors
  cycle.forEach(function (key) {
    let lifeTimeFunc = tempObj[key] = Events.create('Lifetime Method'), idx = 0
    for (; idx < ancestors.length; idx++) {
      let ancestor = ancestors[idx]
      ancestor[key] && lifeTimeFunc.add(ancestor[key])
    }
  })
  return tempObj
}

export default Behavior
