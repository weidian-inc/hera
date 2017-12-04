const fs = require('fs')
const merge = require('merge')
const Parallel = require('node-parallel')
let scopeConfig = null
let default_config = {
  debug: false,
  babel: true,
  appname: 'debug',
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  userInfo: {
    headUrl:
      'https://s-media-cache-ak0.pinimg.com/136x136/7f/f7/b9/7ff7b921190bc4c05a1f3c11ff2ce086.jpg',
    city: 'Chaoyang',
    gender: 1,
    nickName: '测试帐号',
    province: 'Beijing'
  }
}

module.exports = function (opt) {
  return new Promise(function (resolve, reject) {
    if(!scopeConfig){
      let p = new Parallel()
      p.add(done => {
        fs.readFile('./app.json', 'utf8', (err, data) => {
          if (err) return done(err)
          try {
            let config = JSON.parse(data)
            if (!config.pages || !config.pages.length) {
              return done(new Error('No pages found'))
            }
            config.root = config.root || config.pages[0]
            done(null, config)
          } catch (e) {
            return done(e)
          }
        })
      })
      if (fs.existsSync('./ext.json')) {
        p.add(done => {
          fs.readFile('./ext.json', 'utf8', (err, data) => {
            if (err) return done(null, {})
            try {
              let config = JSON.parse(data)
              done(null, config)
            } catch (e) {
              return done(e)
            }
          })
        })
      }

      p.done((err, results) => {
        if (err) return reject(err)
        let appConfig = results[0]
        let extConfig = results[1]
        // console.log('---ext----',extConfig)
        let config = merge.recursive(true, default_config, appConfig)
        config = merge.recursive(true, config, extConfig)
        config.appid = config.appid || 'touristappid'
        config.isTourist = config.appid == 'touristappid'
        if(opt && opt.babel!==undefined){
          config.babel = opt.babel
        }
        scopeConfig = config
        resolve(scopeConfig)
      })
    }else{
      resolve(scopeConfig)
    }
  })
}
