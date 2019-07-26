import Bem from '/lib/bem.js'
import Store from '/store.js'


export default function App () {
  const store = Store.get()

  return {
    class: 'App',
    inner: store.todos.map$(todo => ({
      class: () => Bem.class('App__todo', { done: todo.done$ }),
      onClick: () => todo.done$ = !todo.done,
      inner: () => todo.text$
    }))
  }
}
