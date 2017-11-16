import Utils from './Utils'

// a for old, b for new
const listDiff = function (aChildren, bChildren) {
  function remove (arr, index, key) {
    arr.splice(index, 1)
    return {
      index: index,
      key: key
    }
  }

  let aChildIndex = makeKeyAndFreeIndexes(aChildren)
  let aKeys = aChildIndex.keyIndexes

  // remove original child if it has no keyed child
  if (Utils.isEmptyObject(aKeys)) {
    return {
      children: bChildren,
      moves: null
    }
  }

  let bChildIndex = makeKeyAndFreeIndexes(bChildren)
  let bKeys = bChildIndex.keyIndexes
  let bFree = bChildIndex.freeIndexes

  // remove original child if newChild has no keyed child
  if (Utils.isEmptyObject(bKeys)) {
    return {
      children: bChildren,
      moves: null
    }
  }

  let newChildren = []
  let freeIndex = 0
  let deletedItems = 0

  // Iterate through oldChs and match oldChs node in newChs
  // O(N) time
  for (let idx = 0; idx < aChildren.length; ++idx) {
    let aItem = aChildren[idx]
    let aItemKey = getItemKey(aItem)
    if (aItemKey) {
      if (bKeys.hasOwnProperty(aItemKey)) {
        // Match up the old keys
        let itemIndex = bKeys[aItemKey]
        newChildren.push(bChildren[itemIndex])
      } else {
        // Remove old keyed items
        ++deletedItems
        newChildren.push(null)
      }
    } else if (freeIndex < bFree.length) {
      // Match the item in a with the next free item in b
      let itemIndex = bFree[freeIndex]
      newChildren.push(bChildren[itemIndex])
      ++freeIndex
    } else {
      // There are no free items in b to match with
      // the free items in a, so the extra free nodes
      // are deleted.
      ++deletedItems
      newChildren.push(null)
    }
  }

  let lastFreeIndex = bFree[freeIndex] || bChildren.length

  // Iterate through b and append any new keys
  // O(M) time
  for (let idx = 0; idx < bChildren.length; ++idx) {
    let newItem = bChildren[idx],bItemKey = getItemKey(newItem)
    if (bItemKey) {
      aKeys.hasOwnProperty(bItemKey) || newChildren.push(newItem)
    } else if (idx >= lastFreeIndex) {
      newChildren.push(newItem)
    }
  }

  let simulate = newChildren.slice(0)
  let simulateIndex = 0
  let removes = []
  let inserts = []

  for (let idx = 0; idx < bChildren.length;) {
    let itemNode = bChildren[idx]
    let itemKey = getItemKey(itemNode)

    let simulateItem = simulate[simulateIndex]
    let newItemKey = getItemKey(simulateItem)

    // remove items
    for (; simulateItem === null;) {
      // if null remove it
      removes.push(remove(simulate, simulateIndex, newItemKey))

      // update simulateItem info
      simulateItem = simulate[simulateIndex]
      newItemKey = getItemKey(simulateItem)
    }

    if (newItemKey === itemKey) {
      ++simulateIndex
      ++idx
    } else {
      // if we need a key in this position...
      if (itemKey) {
        if (newItemKey) {
          if (bKeys[newItemKey] === idx + 1) {
            inserts.push({
              key: itemKey,
              index: idx
            })
          } else {
            // if an insert doesn't put this key in place, it needs to move
            removes.push(
              remove(simulate, simulateIndex, newItemKey)
            )
            simulateItem = simulate[simulateIndex]

            // items are matching, so skip ahead
            if (
              simulateItem && getItemKey(simulateItem) === itemKey
            ) {
              ++simulateIndex
            } else {
              // if the remove didn't put the wanted item in place, we need to insert it
              inserts.push({
                key: itemKey,
                index: idx
              })
            }
          }
        } else {
          // insert a keyed wanted item
          inserts.push({
            key: itemKey,
            index: idx
          })
          ++idx
        }
      } else {
        // a key in simulate has no matching wanted key, remove it
        removes.push(remove(simulate, simulateIndex, newItemKey))

        // simulateItem will update at the beginning of  next iteration
      }
    }
  }

  // remove all the remaining nodes from simulate
  for (; simulateIndex < simulate.length;) {
    let simulateItem = simulate[simulateIndex]
    let itemKey = getItemKey(simulateItem)
    removes.push(remove(simulate, simulateIndex, itemKey))
  }

  if (removes.length === deletedItems && inserts.length == 0) {
    return {
      children: newChildren,
      moves: null
    }
  } else {
    return {
      children: newChildren,
      moves: {
        removes: removes,
        inserts: inserts
      }
    }
  }
}

const makeKeyAndFreeIndexes = function (children) {
  let keyIndexes = {}, freeIndexes = []
  for (let idx = 0; idx < children.length; ++idx) {
    let child = children[idx]
    let wxKey = getItemKey(child)
    wxKey ? (keyIndexes[wxKey] = idx) : freeIndexes.push(idx)
  }
  return {
    keyIndexes: keyIndexes,
    freeIndexes: freeIndexes
  }
}

const getItemKey = function (ele) {
  if (ele) return ele.wxKey
}

export default {
  listDiff,
  makeKeyAndFreeIndexes,
  getItemKey
}
