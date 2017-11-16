export function range (n, start = 0, suffix = '') {
  const arr = []
  for (let i = start; i <= n; i++) {
    arr.push(i < 10 ? `0${i}${suffix}` : `${i}${suffix}`)
  }
  return arr
}
