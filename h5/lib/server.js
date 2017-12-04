require('babel-polyfill')
const koa = require('koa')
const http = require('http')
const path = require('path')
// const watcher = require('./watcher')
const router = require('./router')
const util = require('./util')
const send = require('koa-send')
const logger = require('koa-logger')
const compress = require('koa-compress')
const app = koa()
const proxy = require('./proxy')
// require('./init')

// try to find file in current directory
function * staticFallback (next) {
  yield next
  if (this.status == 404) {
    // let p = path.resolve(process.cwd(), this.request.path)
    let p = this.request.path.replace(/^\//, '')
    if (p) {
      let exists = util.exists(p)
      if (exists) yield send(this, p)
    }
  }
}
module.exports = function (rootPath) {
  app.use(logger())
  app.use(
    compress({
      threshold: 2048,
      flush: require('zlib').Z_SYNC_FLUSH
    })
  )
  app.use(staticFallback)
  app.use(function * (next) {
    let path = this.request.path
    if (/^\/remoteProxy$/.test(path)) {
      yield proxy(this)
      // this.body = this.request.body
    } else {
      yield next
    }
  })
  app.use(router.routes())
  app.use(router.allowedMethods())
  app.use(
    require('koa-static')(rootPath, {
      // 15 day
      maxage: 0 // module.parent? 1296000000: 0
    })
  )

  return http.createServer(app.callback())
}
