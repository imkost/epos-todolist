import { dynamic } from '/lib/epos.js'

export default Object.assign(store, {
  init: initStore
})

let st

function store () {
  return st
}

function initStore (data) {
  st = dynamic(data)
}
