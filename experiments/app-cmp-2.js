import ui from './ui.js'
require('./app-cpm-2.css')


export default ({ todos }) => ({
  style: 'App',
  inner: todos.map$(todo => ({
    style: () => (
      [ui.box.column, ui.card, { name: 'todo', done: todo.done$ }]),
    onClick: () => todo.done$ = !todo.done,
    inner: () => todo.text$
  }))
})
