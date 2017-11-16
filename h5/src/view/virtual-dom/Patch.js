import DomIndex from './DomIndex'

class Patch {
  constructor (oldTree, patches) {
    this.oldTree = oldTree
    this.patches = patches
    this.patchIndexes = Object.keys(this.patches).map(function (idx) {
      return Number(idx)
    })
  }

  apply (rootNode) {
    let that = this
    if (this.patchIndexes.length === 0) return rootNode

    let doms = DomIndex.getDomIndex(
      rootNode,
      this.oldTree,
      this.patchIndexes
    )

    this.patchIndexes.forEach(function (patchIdx) {
      let dom = doms[patchIdx]
      if (dom) {
        let patches = that.patches[patchIdx]
        patches.forEach(function (vpatch) {
          vpatch.apply(dom)
        })
      }
    })
    return rootNode
  }
}
export default Patch
