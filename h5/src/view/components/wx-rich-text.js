let textParser = (function () {
  var parserCreator = (function () {
    var creator = function () {}
    creator.prototype = Object.create(Object.prototype, {
      constructor: { value: creator, writable: !0, configurable: !0 }
    })
    var t = function (e, t) {
      var n = t - 30 + 1
      n < 0 && (n = 0)
      return (
        'L' +
        ((e.slice(0, t).match(/(\r|\n|\r\n)/g) || []).length + 1) +
        ': ' +
        e.slice(n, t + 1)
      )
    }
    creator.create = function (t, n) {
      var i = Object.create(creator.prototype)
      i._cbs = n
      var o = (i._stateTable = {}),
        r = (i._stateRecTable = {}),
        a = {},
        s = {},
        l = function (e, n, i, o, r) {
          if (Object.prototype.hasOwnProperty.call(t, i)) {
            if (r[i]) {
              if (!r[i].overwrite) {
                throw new Error(
                  'State "' +
                    e +
                    '" has multiple possible rules on symbol "' +
                    i +
                    '".'
                )
              }
            } else r[i] = n
          } else if (i !== 'ALL' && i !== 'NULL' && i.length > 1) {
            if (o[i]) {
              if (!o[i].overwrite) {
                throw new Error(
                  'State "' +
                    e +
                    '" has multiple possible rules on symbol "' +
                    i +
                    '".'
                )
              }
            } else {
              for (var a = 0; a < i.length; a++) {
                if (i[a + 1] === '-' && i[a + 2]) {
                  for (
                    var s = i.charCodeAt(a + 2), l = i.charCodeAt(a);
                    l <= s;
                    l++
                  ) {
                    o[String.fromCharCode(l)] = n
                  }
                  a += 2
                } else o[i[a]] = n
              }
            }
          } else if (o[i]) {
            if (!o[i].overwrite) {
              throw new Error(
                'State "' +
                  e +
                  '" has multiple possible rules on symbol "' +
                  i +
                  '".'
              )
            }
          } else o[i] = n
        },
        c = ''
      for (c in t) {
        for (
          var d = t[c],
            u = (o[c] = {}),
            h = (r[c] = {}),
            p = (a[c] = {}),
            f = (s[c] = {}),
            A = 0;
          A < d.length;
          A++
        ) {
          var g = d[A],
            _ = g.states[0]
          _ === c ? ((_ = g.states[1]), l(c, g, _, h, f)) : l(c, g, _, u, p)
        }
      }
      var v = null,
        w = function e (t, n, i) {
          if (v[t] !== 2) {
            if (v[t] === 1) {
              throw new Error(
                'State "' + t + '" has illegal recursive rule definition.'
              )
            }
            v[t] = 1
            var r = n[t],
              a = i[t]
            for (var s in r) {
              e(s, n, i)
              var l = o[s]
              for (var c in l) {
                if (a[c]) {
                  if (!a[c].overwrite) {
                    throw new Error(
                      'State "' +
                        t +
                        '" has multiple possible rules on symbol "' +
                        c +
                        '".'
                    )
                  }
                } else a[c] = r[s]
              }
            }
            v[t] = 2
          }
        }
      v = {}
      for (c in a) {
        w(c, a, o)
      }
      v = {}
      for (c in s) {
        w(c, s, r)
      }
      return i
    }
    creator.prototype.parse = function (e, i, o) {
      let r = { str: i, pos: 0 }
      let a = n(this._stateTable, this._stateRecTable, e, r, this._cbs, o)
      if (r.str.length > r.pos) {
        throw new Error(
          'Unexpected character "' +
            r.str[r.pos] +
            '" in position ' +
            t(r.str, r.pos) +
            r.pos +
            ', near '
        )
      }
      return a
    }
    var n = function e (n, i, o, r, a, s) {
      var l = n[o],
        c = null
      r.str.length > r.pos && (c = l[r.str[r.pos]])
      if (!c && (r.str.length > r.pos && (c = l.ALL), !c)) {
        if (!(c = l.NULL)) {
          throw new Error(
            'Unexpected character "' +
              r.str[r.pos] +
              '" in position ' +
              r.pos +
              ' (in state "' +
              o +
              '"), near ' +
              t(r.str, r.pos)
          )
        }
        if (c.states[0] === 'NULL') {
          return a[c.id] ? a[c.id]([], s) : { r: c.id, c: [] }
        }
      }
      var d = function (l, c, d) {
        var u = l.states,
          h = []
        c && h.push(d)
        for (var p = c ? 1 : 0; p < u.length; p++) {
          var f = u[p]
          if (Object.prototype.hasOwnProperty.call(n, f)) {
            h.push(e(n, i, f, r, a, s))
          } else if (f === 'ALL') h.push(r.str[r.pos]), r.pos++
          else {
            for (
              var A = r.str[r.pos], g = r.str.charCodeAt(r.pos), _ = 0;
              _ < f.length;
              _++
            ) {
              if (f[_ + 1] === '-' && f[_ + 2]) {
                var v = f.charCodeAt(_),
                  w = f.charCodeAt(_ + 2)
                if (v <= g && g <= w) break
                _ += 2
              } else if (A === f[_]) break
            }
            if (_ === f.length) {
              throw new Error(
                'Unexpected character "' +
                  A +
                  '" in position ' +
                  r.pos +
                  ' (expect "' +
                  f +
                  '" in state "' +
                  o +
                  '"), near ' +
                  t(r.str, r.pos)
              )
            }
            h.push(A), r.pos++
          }
        }
        return a[l.id] ? a[l.id](h, s) : { r: l.id, c: h }
      }
      for (
        u = d(c);
        r.str.length > r.pos && ((c = i[o][r.str[r.pos]]) || (c = i[o].ALL));

      ) {
        u = d(c, !0, u)
      }
      return u
    }
    return creator
  })()
  const t = { TAG_START: 1, TAG_END: -1, TEXT: 3, COMMENT: 8 }
  const entities = {
    amp: '&',
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
    apos: "'"
  }
  const decodeEntities = function (text) {
    return text.replace(/&([a-zA-Z]*?);/g, function (match, p1) {
      if (entities.hasOwnProperty(p1) && entities[p1]) return entities[p1]
      if (/^#[0-9]{1,4}$/.test(p1)) return String.fromCharCode(p1.slice(1))
      if (/^#x[0-9a-f]{1,4}$/i.test(p1)) {
        return String.fromCharCode('0' + p1.slice(1))
      }
      throw new Error('HTML Entity "' + match + '" is not supported.')
    })
  }
  const o = function (e) {
    switch (e) {
      case 'area':
      case 'base':
      case 'basefont':
      case 'br':
      case 'col':
      case 'frame':
      case 'hr':
      case 'img':
      case 'input':
      case 'keygen':
      case 'link':
      case 'meta':
      case 'param':
      case 'source':
      case 'track':
        return !0
      default:
        return !1
    }
  }
  let parser = null
  const init = function () {
    const tags = {
      TEXT: [
        { id: 'tag', states: ['TEXT', 'TAG'] },
        { id: 'text', states: ['TEXT', 'ALL'] },
        { id: 'tag1', states: ['TAG'] },
        { id: 'text1', states: ['ALL'] },
        { id: '_null', states: ['NULL'], overwrite: !0 }
      ],
      TAG: [{ id: '_blank', states: ['<', 'TAG_START'] }],
      TAG_END: [
        { id: '_concat', states: ['/', '>'] },
        { id: '_jump', states: ['>'] }
      ],
      TAG_START: [
        { id: 'comment', states: ['!', '-', '-', 'COMMENT_CONTENT'] },
        { id: 'endTag', states: ['/', 'TAG_NAME', '>'] },
        { id: 'startTag', states: ['TAG_NAME', 'ATTRS', 'TAG_END'] }
      ],
      TAG_NAME: [
        { id: '_concat', states: ['TAG_NAME', '-_a-zA-Z0-9.:'] },
        { id: '_jump', states: ['a-zA-Z'] }
      ],
      ATTRS: [
        { id: '_blank', states: [' \n\r\t\f', 'ATTRS'] },
        { id: '_jump', states: ['ATTRS', ' \n\r\t\f'] },
        { id: 'attrs', states: ['ATTR', 'ATTRS'] },
        { id: '_null', states: ['NULL'], overwrite: !0 }
      ],
      ATTR: [{ id: 'attr', states: ['ATTR_NAME', 'ATTR_NAME_AFTER'] }],
      ATTR_NAME: [
        { id: '_concat', states: ['ATTR_NAME', '-_a-zA-Z0-9.:$&'] },
        { id: '_jump', states: ['-_a-zA-Z0-9.:$&'] }
      ],
      ATTR_NAME_AFTER: [
        { id: '_blank', states: ['=', 'ATTR_VALUE'] },
        { id: '_empty', states: ['NULL'] }
      ],
      ATTR_VALUE: [
        { id: '_blank', states: ['"', 'ATTR_VALUE_INNER_1'] },
        { id: '_blank', states: ["'", 'ATTR_VALUE_INNER_2'] }
      ],
      ATTR_VALUE_INNER_1: [
        { id: '_empty', states: ['"'] },
        { id: '_concat', states: ['ALL', 'ATTR_VALUE_INNER_1'] }
      ],
      ATTR_VALUE_INNER_2: [
        { id: '_empty', states: ["'"] },
        { id: '_concat', states: ['ALL', 'ATTR_VALUE_INNER_2'] }
      ],
      COMMENT_CONTENT: [
        { id: '_concat', states: ['ALL', 'COMMENT_CONTENT'] },
        { id: '_concat', states: ['-', 'COMMENT_CONTENT_DASH_1'] }
      ],
      COMMENT_CONTENT_DASH_1: [
        { id: '_concat', states: ['ALL', 'COMMENT_CONTENT'] },
        { id: '_concat', states: ['-', 'COMMENT_CONTENT_DASH_2'] }
      ],
      COMMENT_CONTENT_DASH_2: [
        { id: '_concat', states: ['ALL', 'COMMENT_CONTENT'] },
        { id: '_concat', states: ['-', 'COMMENT_CONTENT_DASH_2'] },
        { id: '_jump', states: ['>'] }
      ]
    }
    const tagPoints = {
      _null: function () {},
      _empty: function () {
        return ''
      },
      _jump: function (e) {
        return e[0]
      },
      _concat: function (e) {
        return e[0] + e[1]
      },
      _blank: function (e) {
        return e[1]
      },
      attr: function (e) {
        return { n: e[0], v: e[1] }
      },
      attrs: function (e) {
        var t = e[1] || {}
        t[e[0].n] = e[0].v
        return t
      },
      startTag: function (e) {
        var n = e[0].toLowerCase()
        return {
          t: t.TAG_START,
          n: n,
          a: e[1] || {},
          selfClose: e[2] === '/>' || o(n)
        }
      },
      endTag: function (e) {
        return { t: t.TAG_END, n: e[1].toLowerCase() }
      },
      comment: function (e) {
        return { t: t.COMMENT, c: e[3].slice(0, -3) }
      },
      tag1: function (e) {
        return [e[0]]
      },
      text1: function (e) {
        return [{ t: t.TEXT, c: e[0] }]
      },
      tag: function (e) {
        return e[0].push(e[1]), e[0]
      },
      text: function (e) {
        var n = e[0]
        return (
          n[n.length - 1].t === t.TEXT
            ? (n[n.length - 1].c += e[1])
            : n.push({ t: t.TEXT, c: e[1] }),
          n
        )
      }
    }
    parser = parserCreator.create(tags, tagPoints)
  }
  const s = function (e) {
    let rootNode = { children: [] },
      i = rootNode,
      o = [],
      r = null
    for (let a = 0; a < e.length; a++) {
      var s = e[a]
      r = { name: s.n, attrs: s.a, children: [] }
      i.children.push(r)
      if (s.t === t.TAG_START) {
        s.selfClose || (o.push(i), (i = r))
      } else if (s.t === t.TAG_END) {
        for (; s.n !== i.name;) {
          if (!(i = o.pop())) {
            throw new Error('No matching start tag found for "</' + s.n + '>"')
          }
        }
        i = o.pop()
      } else {
        s.t === t.TEXT && s.c && i.children.push({ type: 'text', text: s.c })
      }
    }
    return rootNode
  }
  return {
    parse: function (txt) {
      parser || init()
      var t = parser.parse('TEXT', txt) || []
      return s(t).children
    },
    decodeEntities: decodeEntities
  }
})()

let nodeParser = {
  rules: {
    a: 'nA',
    abbr: 'nA',
    b: 'nA',
    blockquote: 'nA',
    br: 'nA',
    code: 'nA',
    col: 'fA',
    colgroup: 'fA',
    dd: 'nA',
    del: 'nA',
    div: 'nA',
    dl: 'nA',
    dt: 'nA',
    em: 'nA',
    fieldset: 'nA',
    h1: 'nA',
    h2: 'nA',
    h3: 'nA',
    h4: 'nA',
    h5: 'nA',
    h6: 'nA',
    hr: 'nA',
    i: 'nA',
    img: 'fA',
    ins: 'nA',
    label: 'nA',
    legend: 'nA',
    li: 'nA',
    ol: 'fA',
    p: 'nA',
    q: 'nA',
    span: 'nA',
    strong: 'nA',
    sub: 'nA',
    sup: 'nA',
    table: 'fA',
    tbody: 'nA',
    td: 'fA',
    tfoot: 'nA',
    th: 'fA',
    thead: 'nA',
    tr: 'nA',
    ul: 'nA'
  },
  fA: function (t, n, i, o) {
    var r = {
      col: { span: 'nF', width: 'nF' },
      colgroup: { span: 'nF', width: 'nF' },
      img: { alt: 'nF', src: 'fL', height: 'nF', width: 'nF' },
      ol: { start: 'nF', type: 'nF' },
      table: { width: 'nF' },
      td: { colspan: 'nF', height: 'nF', rowspan: 'nF', width: 'nF' },
      th: { colspan: 'nF', height: 'nF', rowspan: 'nF', width: 'nF' }
    }
    var a = r[i][t]
    if (r.hasOwnProperty(i) && r[i].hasOwnProperty(t)) {
      switch (a) {
        case void 0:
          break
        case 'nF':
          o.setAttribute(t, n)
          break
        default:
          return nodeParser[a] && nodeParser[a](t, n, i, o)
      }
    }
  },
  fL: function (e, t, n, i) {
    i.setAttribute(e, t)
  },
  parse: function (nodes, i, o) {
    nodes.map(function (node) {
      if ((void 0 === node ? 'undefined' : typeof node) === 'object') {
        if (void 0 === node.type || node.type === 'node' || node.type === '') {
          if (typeof node.name === 'string' && node.name !== '') {
            var r = node.name.toLowerCase()
            if (nodeParser.rules.hasOwnProperty(r)) {
              var a = nodeParser.rules[r],
                s = document.createElement(r)
              if (s) {
                if (typeof node.attrs === 'object') {
                  for (var l in node.attrs) {
                    var c = l.toLowerCase(),
                      d = textParser.decodeEntities(node.attrs[l])
                    if (c === 'class') {
                      var u = o
                        ? d.replace(/\S+/g, function (e) {
                          return o + e
                        })
                        : d
                      s.setAttribute('class', u)
                    } else {
                      c === 'style'
                        ? s.setAttribute('style', d)
                        : a !== 'nA' &&
                          nodeParser[a] &&
                          nodeParser[a](c, d, r, s)
                    }
                  }
                }
                typeof node.children === 'object' &&
                  node.children instanceof Array &&
                  node.children.length &&
                  nodeParser.parse(node.children, s, o),
                  i.appendChild(s)
              }
            }
          }
        } else {
          node.type === 'text' &&
            typeof node.text === 'string' &&
            node.text !== '' &&
            i.appendChild(
              document.createTextNode(textParser.decodeEntities(node.text))
            )
        }
      }
    })
    return i
  }
}

window.exparser.registerElement({
  is: 'wx-rich-text',
  template: '<div id="rich-text"><slot></slot></div>',
  // template: function (e, t, n) {
  //   return [
  //     {
  //       t: 1,
  //       n: 'div',
  //       id: 'rich-text',
  //       a: [],
  //       c: [{ t: 1, n: 'slot', v: !0, sn: '', a: [], c: [] }]
  //     }
  //   ]
  // },
  behaviors: ['wx-base'],
  properties: {
    nodes: { value: [], public: !0, observer: '_nodesObserver' }
  },
  created: function () {
    this._ready = !1
    this._cachedVal = null
  },
  attached: function () {
    this._classPrefix = ''
    if (this.ownerShadowRoot) {
      var e = this.classList._prefix
      e && (this._classPrefix = e + '--')
    }
    this._ready = !0
    if (this._cachedVal) {
      var t = this._cachedVal
      this._cachedVal = null
      this._nodesObserver(t)
    }
  },
  _nodesObserver: function (nodes) {
    if (!this._ready) return void (this._cachedVal = nodes)
    this.$['rich-text'].innerHTML = ''
    if (Array.isArray(nodes)) {
      this.$['rich-text'].appendChild(
        nodeParser.parse(
          nodes,
          document.createDocumentFragment(),
          this._classPrefix
        )
      )
    } else if (typeof nodes === 'string') {
      // nodes = textParser.parse(nodes)
      // if (Array.isArray(nodes)) {
      //   this.$['rich-text'].appendChild(
      //     nodeParser.parse(
      //       nodes,
      //       document.createDocumentFragment(),
      //       this._classPrefix
      //     )
      //   )
      // }
      this.$['rich-text'].innerHTML = nodes
    } else {
      console.group(new Date() + ' nodes属性只支持 String 和 Array 类型')
      console.warn('nodes属性只支持 String 和 Array 类型，请检查输入的值。')
      console.groupEnd()
    }
  }
})
