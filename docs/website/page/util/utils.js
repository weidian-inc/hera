export function highlightInit(hljs) {
  document.querySelectorAll('pre code').forEach(e => {
    hljs.highlightBlock(e)
  })
}

export function capitalize(word) {
  return word.replace(/^([a-z])([a-z]+)/, (match, p1, p2) => {
    return `${p1.toUpperCase()}${p2}`
  })
}
