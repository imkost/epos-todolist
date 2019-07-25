import { dynamic } from '/lib/epos.js'

export default {
  get: getStore,
  init: initStore
}

let store

function getStore () {
  return store
}

function initStore (data) {
  store = dynamic(data)
}
