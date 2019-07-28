import store from '/store.js'
requireMeta(import.meta)
require('./app.css')

export default function App () {
  return {
    class: 'App',
    inner: store().todos.map$(item => {
      return {
        class: () => ({ name: 'App__todo', done: item.done$ }),
        onClick: () => item.done$ = !item.done,
        inner: () => item.text$
      }
    })
  }
}
