import { render } from '/lib/epos.js'
import pluginClassArray from '/lib/epos-plugin-class-array.js'
import pluginOnCreate from '/lib/epos-plugin-on-create.js'
import pluginMountUnmount from '/lib/epos-plugin-mount-unmount.js'
import Store from '/store.js'
import App from '/ui/app.js'

;(function main () {
  render.addPlugin(pluginClassArray)
  render.addPlugin(pluginOnCreate)
  render.addPlugin(pluginMountUnmount)

  Store.init({
    todos: [
      { text: 'Learn epos', done: false },
      { text: 'Write todolist', done: false }
    ]
  })

  const $app = render(App())
  document.body.appendChild($app)
})()
