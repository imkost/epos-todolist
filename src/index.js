import { render } from '/lib/epos.js'
import bemClassProcessor from '/lib/epos-bem-class-processor.js'
import pluginClassArray from '/lib/epos-plugin-class-array.js'
import pluginOnCreate from '/lib/epos-plugin-on-create.js'
import pluginMountUnmount from '/lib/epos-plugin-mount-unmount.js'
import store from '/store.js'
import App from '/ui/app/app.js'
require('/ui/global.css')

;(function main () {
  pluginClassArray.setClassProcessor(bemClassProcessor)
  render.addPlugin(pluginClassArray)
  render.addPlugin(pluginOnCreate)
  render.addPlugin(pluginMountUnmount)

  store.init({
    todos: [
      { text: 'Learn epos', done: false },
      { text: 'Write todolist', done: false }
    ]
  })

  const $app = render(App())
  document.body.appendChild($app)
})()
