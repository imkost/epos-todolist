/* eslint-disable */

/*
Как трекать не реактивный set и возможный рассинхрон:
хранить prevValue при реактивном set$, при get$ сравнивать реальное значение
с prevValue (реактивное), если разные, значит рассинхрон.
Аналогично при реактивном set$ проверять.
 */


/*
В compound нужно понимать, что нет дублирующихся реакций, убирать дубликаты
 */

/*
// Maybe implement lib/create-dynamic-array-from-object.js
// createDynamicArrayFromObject(store.feeds).map$()
let prevFeedIds
autorun(() => {
  const feedIds = Object.values(store.feeds$).map(f => f.id)
  if (!prevFeedIds) {
    state.feedIdsOrder$ = feedIds
  }
  if (prevFeedIds) {
    feedIds.forEach((feedId, index) => {
      // New item? => add
      if (!prevFeedIds.includes(feedId)) {
        state.feedIdsOrder.splice$(index, 0, feedId)
      }
    })
    prevFeedIds.forEach(feedId => {
      // Item was removed? => remove
      if (!feedIds.includes(feedId)) {
        state.feedIdsOrder.splice$(state.feedIdsOrder.indexOf(feedId), 1)
      }
    })
  }
  prevFeedIds = feedIds
})
*/



/*
For next version:
obj / dobj (instead of object / source) dynamic-object
arr / darr (instead of array / sourceArray)
*/


/*
Idea:
Epos.dep(store, 'title') // same as store.get$('title') but ok with linters
Epos.trigger(store, 'title') // force reactions
*/


/*
idea: Epos.whyRun()
{
  class () {
    Epos.whyRun()
    return post.title$
  }
}
logs smth like:
.class was run because it is first time run
.class was run because 'title' of post {...} changed
*/


/*
Был такой момент:
inner () {
  if (!store.visible$) {
    return null
  }
  if (!$post) {
    $post = render(Post())
  }
  return $post
}
когда visible$ будет меняться, элементы будут удаляться из DOM-а и с ними вся динамика, то есть
динамика на $post пропадет, это нежелаемое поведение.

Чтобы избежать, render (который export-ируется, а не renderInternal) обернут в standalone-autorun
поэтому render внутри render теперь не создает parent-child связь, но нужно теперь не забывать
suspend-ить $post самостоятельно
*/

// TODO: throw exception if dynamic get not inside computation
// TODO: add middle process for deleting only to prevent plugins conflicts (cleanupTemplate)
//
// idea: Epos.dynamic(value)
// var hidden = Epos.dynamic(false)
// hidden.set$(true), hidden.get$(), hidden.set(false), hidden.get()

/**
 * Copyright (c) Konstantin Zemtsovsky
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Эпос использует несколько своих внутренних понятий.
 * Пройдемся по каждому из них:
 *
 * 1. Мнимые поля у объекта.
 * Это non-enumarable поля создаваемые через Object.defineProperty.
 * К этим поляем можно обращаться, но их не получить через
 * `for (key in obj)` или `Object.keys(obj)`.
 *
 * 1. Источник (source).
 * Бывает двух типов: объект и массив.
 *
 * Источник-объект — это объект у которого для каждого поля существует такое
 * же мнимое поле, заканчивающееся на `$`. Например, для объекта {a, b}
 * источник будет выглядеть так: {a, b, a$, b$}, где a$ и b$ — мнимые поля.
 * У мнимых полей прописаны getter и setter, благодаря которым реализуется
 * реактивность.
 *
 * Источник-массив — это обычный массив с мнимыми методами push$/pop$/etc.
 * Эти методы превносят реактивность. В обычном javascript array.push
 * не изменяет значение массива, но в Эпосе sourceArray.push$ сработает так,
 * будто значение изменилось (на самом деле оно не изменится), то есть все
 * вычисления, зависящие от sourceArray, перевычислятся.
 *
 * 2. Динамичные поля у объекта-источника.
 * Это мнимые поля, которы заканчиваются на $ и у которых определены
 * специальные getter/setter о которых говорилось выше.
 *
 * 3. Вычисление (computation или просто comp).
 * TODO: добавить описание
 *
 * 4. Потоки (streams).
 * TODO: добавить описание
 */

Object.assign(render, { addPlugin: addRenderPlugin })

export default {
  dynamic,
  autorun,
  computed,
  compound,

  // DOM-related
  render,
  renderRaw,
  suspend
}

export {
  dynamic,
  autorun,
  computed,
  compound,

  // DOM-related
  render,
  renderRaw,
  suspend
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Function to be called on reactive getter.
 */
let curGet = null

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Current reactive computation. Computations are created by `autorun`.
 */
let curComp = null

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Current node created via `renderObject`
 */
let curNode = null

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * List of all delayed reactions. Used for compound.
 */
let curStack = null

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Counter for creating boundary nodes.
 */
let boundaryId = 1

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

let isStandaloneRender = false;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * List of all possible event names: "onclick", "onmousedown", etc.
 */
const events = getAllPossibleEventNames()

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * List of render plugins.
 */
const plugins = []

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Набор функций, которые будут выполнены, когда root-computation
 * перевычислится. Под рутовым вычислением имеется в виду тот, который
 * перевычислился при реактивном измененнии одной из своих зависимостей,
 * а не тот, который перевычислился из-за того, что его родитель-computation
 * перевычислился. Этот набор нужен для реализации `computed`.
 */
const afterRun = new Set()

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * All symbols used by Epos
 */
const _comp_ = Symbol('comp')
const _comps_ = Symbol('comps')
const _usages_ = Symbol('usages')
const _source_ = Symbol('source')
const _splice_ = Symbol('splice')
const _trusted_ = Symbol('trusted')
const _children_ = Symbol('children')
const _isStream_ = Symbol('isStream')
const _boundaryId_ = Symbol('boundaryId')

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function dynamic (any) {
  return createSource(any)
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function createSource (any, parentChange) {
  if (isObject(any)) {
    return createSourceObject(any, parentChange)
  }

  if (isArray(any)) {
    return createSourceArray(any, parentChange)
  }

  return any
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function createSourceObject (object, parentChange) {
  if (object.get$) {
    return object
  }

  const source = {}

  for (const key in object) {
    setSourceProp(key, object[key])
  }

  Object.defineProperties(source, {
    set$: { get: () => set$ },
    delete$: { get: () => delete$ },
    get$: { get: () => get$ }
  })

  return source

  function set$ (key, value) {
    setSourceProp(key, value)
    if (parentChange) {
      callFnsStack(parentChange)
    }
  }

  function delete$ (key) {
    source[`${key}$`] = undefined
    delete source[key]
    delete source[`${key}$`]
    if (parentChange) {
      callFnsStack(parentChange)
    }
  }

  function get$ (key) {
    if (key in source) {
      return source[`${key}$`]
    }
    // TODO: implement dynamic setting and deleting
  }

  function setSourceProp (key, value) {
    const change = new Set() // fns to be called on reactive value change
    source[key] = createSource(value, change)
    let prevValue = source[key]

    Object.defineProperty(source, `${key}$`, {
      configurable: true, // for `delete source['key$']` to work
      get () {
        if (!curComp && !source[_trusted_]) {
          // console.warn(`Referencing a dynamic field "${key}" without a computational context or function`)
        }
        if (curGet) {
          curGet(change)
        }
        return source[key]
      },
      set (newValue) {
        if (prevValue !== newValue) {
          source[key] = createSource(newValue, change)
          callFnsStack(change)
        }
        prevValue = newValue
        return true
      }
    })
  }
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function createSourceArray (array, parentChange) {
  if (array.pop$) {
    return array
  }

  const source = array.map(item => createSource(item))
  source[_splice_] = new Set() // fns to be called after splice$

  // TODO: add sort$ and reverse$
  Object.defineProperties(source, {
    pop$: { get: () => pop$ },
    push$: { get: () => push$ },
    shift$: { get: () => shift$ },
    unshift$: { get: () => unshift$ },
    splice$: { get: () => splice$ },
    map$: { get: () => map$ }
  })

  return source

  function map$ (fn) {
    return createStream(source, fn)
  }

  /**
   * All of these functions are implemented via splice$. Why?
   * It's just simpler, we impelement reactivity only for splice$ and get
   * reactivity for all the reset functions for free.
   */
  function pop$ () {
    const removed = splice$(source.length - 1, 1)
    return removed[0]
  }
  function push$ (item) {
    splice$(source.length, 0, item)
    return source.length
  }
  function shift$ () {
    const removed = splice$(0, 1)
    return removed[0]
  }
  function unshift$ (item) {
    splice$(0, 0, item)
    return source.length
  }

  function splice$ (start, removeCount, ...items) {
    /**
     * Make `start` and `removeCount` usage-friendly.
     *
     * start и removeCount могут быть любыми числами, например, они могут быть
     * отрицательными или выходить за размеры массива. Оригинальный js-овский
     * splice поддерживает всевозможные случаи. Для удобства, мы переводим
     * нестандартные значения в равносильные, но более удобные:
     * start не может быть меньше нуля и больше размера массива,
     * removeCount тоже неотрицательный и не может "выходить" за размеры
     * массива.
     * TODO: прочекать, что будет, если передавать нецелые числа
     * TODO: прочекать, что будет, если передавать не числа
     */
    if (start < 0) {
      start = Math.max(0, source.length + start)
    } else if (start > source.length - 1) {
      start = source.length
    }
    removeCount = Math.max(0, Math.min(source.length - start, removeCount))

    // Every item to source
    items = items.map(i => createSource(i))

    // Call original splice
    const removed = source.splice(start, removeCount, ...items)

    // Call splice$ listeners
    callFnsStack(source[_splice_], start, removeCount, ...items)

    // Call `parentChange`, because splice$ changes array (in reactivity)
    if (parentChange) {
      callFnsStack(parentChange)
    }

    return removed
  }
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function computed (fn) {
  if (!isFunction(fn)) {
    return fn
  }

  // If `computed` was never run for the given function
  if (!fn[_source_]) {
    // Создаем счетчик использований, который говорит сколько раз computed
    // от переданной функции вызывался внутри computation-ов
    fn[_usages_] = 0

    // Создаем источник для функции со значением undefined
    fn[_source_] = createSource({
      value: void 0
    })
    fn[_source_][_trusted_] = true

    // Перевычисляем значение в standalone-computation (передаем true в авторан)
    fn[_comp_] = autorun(() => {
      // TODO: в юнифиде в некоторых ситуациях получалось так, что autorun
      // бежит, а _source_ уже нет. Баг? Или ок?
      // UPD: скорее всего было связано с тем, что не было suspend,
      // закмментирую if, проверим
      // UPD2: все-таки нужно if. Надо разобраться почему
      if (fn[_source_]) {
        fn[_source_].value$ = fn()
      }
    }, true)
  }

  // Если мы внутри computation-а
  if (curComp) {
    // Увеличиваем счетчик использований
    fn[_usages_] += 1

    onStop(curComp, () => {
      // Когда computation останавливается, понижаем счетчик использований.
      // Если внутри computation-а computed от одной функции вызовется
      // дважды, то счетчик увеличится на 2, а при остановке уменьшится
      // на 2 — все ок.
      fn[_usages_] -= 1

      // Как только рутовый computation закончится, нужно проверить, что
      // computed от функции нигде больше не используется ...
      afterRun.add(checkUsages)

      function checkUsages () {
        // ... И если он действительно больше нигда не используется
        if (fn[_usages_] === 0) {
          // То останавливаем computation
          fn[_comp_].stop()

          // Обнуляем source
          fn[_source_] = null
        }
      }
    })
  }

  // Возвращаем реактивный get на value, таким образом computation, который
  // внутри вызывает computed(fn) будет зависеть динамически только
  // от результата fn, а не от всех ее внутренностей
  return fn[_source_].value$
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function compound (fn) {
  const parentStack = curStack
  curStack = []
  fn()
  for (const f of curStack) {
    f()
  }
  curStack = parentStack
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

// TODO: подумать над реактивным индексом
// возможно что-то вроде Epos.dynamic(i) или i.value$
function createStream (sourceArray, fn) {
  const stream = createSourceArray(sourceArray.map(item => fn(item)))

  // Помечаем поток, чтобы при рендеринге отличать его от массива
  stream[_isStream_] = true

  // Слушаем splice$
  onSplice(sourceArray, (start, removeCount, ...items) => {
    // Трансформируем новые значения
    items = items.map(item => fn(item))

    // Делаем реактивный splice$, чтобы стриггерить слушателей потока, если такие имеются
    stream.splice$(start, removeCount, ...items)
  })

  return stream
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Самая сложная для понимания часть библиотеки. Все реактивные вещи —
 * это autorun. Вызов autorun создает новый computation.
 *
 * isStandalone создает standalone-computation вместо обычного, это означает,
 * что такой computation не будет остановлен при остановке computation-родителя.
 * Точнее даже так: у такого computation-а не будет родителя, даже если
 * иерархически родитель есть. Такой computation можно остановить только
 * вручную вызвав метод stop.
 *
 * TODO: добавить описание
 * TODO: проверить, может реализация через класс добавит производительности
 */
function autorun (fn, isStandalone = false) {
  // Тут хранятся change-наборы зависимых переменных
  let deps = new Set()

  const comp = {
    stop,
    [_children_]: []
  }

  if (curNode) {
    curNode[_comps_].push(comp)
  }

  // Если есть родительский computation и autorun не в standalone-режиме,
  // то прописываем себя в дети родителя
  if (curComp && !isStandalone) {
    curComp[_children_].push(comp)
  }

  run()

  return comp

  function run () {
    stop()
    const parentGet = curGet
    const parentComp = curComp
    curGet = get
    curComp = comp
    fn(comp)
    curGet = parentGet
    curComp = parentComp

    // Если `curComp` оказался null-ом, значит это закончил свое перевычисление
    // root-computation (см. описание `afterRun` выше).
    if (curComp === null) {
      callFns(afterRun)
      afterRun.clear()
    }
  }

  function get (change) {
    // Добавляем зависимость
    change.add(run)
    deps.add(change)
  }

  function stop () {
    // Останавливаем всех детей
    for (const child of comp[_children_]) {
      child.stop()
    }
    comp[_children_] = []

    // Удаляем все связанные зависимости
    for (const change of Array.from(deps)) {
      change.delete(run)
    }
    deps.clear()
  }
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function render (template) {
  let result
  autorun(() => {
    const prev = isStandaloneRender
    isStandaloneRender = true
    result = renderInternal(template)
    isStandaloneRender = prev
  }, true)
  return result
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function renderInternal (template, isSvg) {
  if (template instanceof window.Node) {
    return template
  }

  if (isStringOrNumber(template)) {
    return document.createTextNode(template)
  }

  if (isObject(template)) {
    return renderObject(template, isSvg)
  }

  if (isArray(template)) {
    return renderArray(template, isSvg)
  }

  if (isFunction(template)) {
    return renderFunction(template, isSvg)
  }

  if (isStream(template)) {
    return renderStream(template, isSvg)
  }

  return document.createTextNode('')
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function renderObject (template, isSvg) {
  // const parentComp = curComp
  // const comp = {
  //   stop () {
  //     for (const child of comp[_children_]) {
  //       child.stop()
  //     }
  //     comp[_children_] = []
  //   },
  //   [_children_]: []
  // }
  // if (parentComp) {
  //   parentComp[_children_].push(comp)
  // }
  // curComp = comp
  // node.comp = comp
  // curComp = parentComp

  // Preprocess with plugins
  const stateByPlugin = new Map()
  for (const plugin of plugins) {
    if (plugin.preprocess) {
      const state = {}
      stateByPlugin.set(plugin, state)
      plugin.preprocess({ state, template })
    }
  }

  // Cleanup template by plugins
  for (const plugin of plugins) {
    if (plugin.cleanupTemplate) {
      plugin.cleanupTemplate({ template })
    }
  }

  // Create node
  let node
  const tag = template.tag || 'div'
  if (tag === 'svg') {
    isSvg = true
  }
  // TODO: process <foreignObject>
  if (isSvg) {
    node = document.createElementNS('http://www.w3.org/2000/svg', tag)
  } else {
    node = document.createElement(tag)
  }

  node[_comps_] = []
  const parentNode = curNode

  // This fixes show/hide post after toggling show hidden in unifeed
  if (!isStandaloneRender) {
    curNode = node
  }

  // Set attributes and add event listeners
  for (const key in template) {
    if (key === 'tag' || key === 'inner') {
      continue
    }

    const value = template[key]
    if (events.includes(key.toLowerCase()) && isFunction(value)) {
      node.addEventListener(key.toLowerCase().slice(2), value)
    } else {
      autorun(() => {
        setAttributeSafe(node, key, isFunction(value) ? value() : value, isSvg)
      })
    }
  }

  // Render children and attach them to the node
  const children = toFlatArray(renderInternal(template.inner, isSvg))
  for (const child of children) {
    node.appendChild(child)
  }

  // Postprocess with plugins
  for (const plugin of plugins) {
    if (plugin.postprocess) {
      const state = stateByPlugin.get(plugin)
      // TODO: probably remove `template` from args?
      plugin.postprocess({ state, template, node })
    }
  }

  curNode = parentNode

  return node
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function setAttributeSafe (node, key, value, isSvg) {
  // `value` is valid => set attribute
  if (isStringOrNumber(value) || typeof value === 'boolean') {
    // Если поле есть на элементе, то меняем его, иначе — ставим атрибут.
    // Почему так? Например, для input-ов есть поле value и менять его
    // следует именно через input.value, а не через
    // input.setAttribute('value', ...)
    if (key in node && !isSvg) {
      node[key] = value
    } else {
      node.setAttribute(key, value)
    }
  // Otherwise => delete attribute
  } else {
    node.removeAttribute(key)
  }
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function renderArray (template, isSvg) {
  const [startNode, endNode] = createBoundaryNodes()
  return [
    startNode,
    ...toFlatArray(template.map(i => renderInternal(i, isSvg))),
    endNode
  ]
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function renderFunction (template, isSvg) {
  const [startNode, endNode] = createBoundaryNodes()
  let isFirstRun = true
  let nodes

  autorun(() => {
    const newNodes = toFlatArray(renderInternal(template(), isSvg))

    if (isFirstRun) {
      nodes = newNodes
      isFirstRun = false
    } else {
      // Create fragment with new nodes
      const fragment = document.createDocumentFragment()
      for (const newNode of newNodes) {
        fragment.appendChild(newNode)
      }

      // Remove all nodes between start and end
      while (startNode.nextSibling !== endNode) {
        removeNode(startNode.nextSibling)
      }

      // Insert fragment between start and end
      endNode.parentNode.insertBefore(fragment, endNode)
    }
  })

  return [startNode, ...nodes, endNode]
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function renderStream (stream, isSvg) {
  const nodes = renderArray(stream)
  const startNode = nodes[0]
  const endNode = nodes[nodes.length - 1]

  // TODO: порефакторить все, что внутри
  onSplice(stream, (start, removeCount, ...items) => {
    let i = 0
    let cursor = startNode.nextSibling

    if (!cursor) {
      // probably rerun of already removed elements
      console.log('strange')
      return
    }

    const children = []

    while (cursor !== endNode) {
      if (cursor[_boundaryId_]) {
        const nodes2 = []
        const boundaryId = cursor[_boundaryId_]
        while (true) {
          nodes2.push(cursor)
          cursor = cursor.nextSibling
          if (cursor[_boundaryId_] === boundaryId) {
            nodes2.push(cursor)
            break
          }
        }
        children.push(nodes2)
      } else {
        children.push(cursor)
      }

      cursor = cursor.nextSibling
    }

    const nodesToRemove = []
    const bef = toFlatArray(children[start] || endNode)[0]

    for (i = 0; i < removeCount; i++) {
      const cc = toFlatArray(children[start + i])
      for (const c of cc) {
        nodesToRemove.push(c)
      }
    }

    for (const item of items) {
      const ii = toFlatArray(renderInternal(item, isSvg))
      for (const i of ii) {
        bef.parentNode.insertBefore(i, bef)
      }
    }

    for (const n of nodesToRemove) {
      removeNode(n)
    }
  })

  return nodes
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function addRenderPlugin (plugin) {
  plugins.push(plugin)
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function renderRaw (string) {
  const div = renderInternal({})
  div.innerHTML = string
  return Array.from(div.childNodes)
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Stops all dynamic computations for the given node
 */
function suspend (node) {
  if (node && node[_comps_]) {
    for (const comp of node[_comps_]) {
      comp.stop()
    }
  }
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function removeNode (node) {
  node.remove()
  suspend(node)
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Adds splice listener for the given source-array
 */
function onSplice (sourceArray, fn) {
  sourceArray[_splice_].add(fn)

  // Stop listener if current computation stops
  if (curComp) {
    onStop(curComp, () => {
      sourceArray[_splice_].delete(fn)
    })
  }
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Calls all given functions one by one
 * fns = Array/Set
 */
function callFns (fns, ...args) {
  for (const fn of Array.from(fns)) {
    fn(...args)
  }
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Same as `callFns`, but stack-aware.
 * If inside compound => push fns to stack instead of calling
 */
function callFnsStack (fns, ...args) {
  if (!fns) {
    return
  }

  if (curStack) {
    // curStack.push(() => {
    //   const executed = new Set()
    //   for (const fn of Array.from(fns)) {
    //     if (!executed.has(fn)) {
    //       fn(...args)
    //       executed.add(fn)
    //     }
    //   }
    // })
    curStack.push(call)
  } else {
    call()
  }

  function call () {
    callFns(fns, ...args)
  }
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Returns a list of all possible DOM events: "onclick", "onmousedown", etc.
 * https://css-tricks.com/snippets/javascript/get-possible-dom-events/
 */
function getAllPossibleEventNames () {
  const events = []
  for (const key in document) {
    const value = document[key]
    if (key.startsWith('on') && (value === null || isFunction(value))) {
      events.push(key)
    }
  }

  return events
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function createBoundaryNodes () {
  const startNode = document.createTextNode('')
  const endNode = document.createTextNode('')
  startNode[_boundaryId_] = boundaryId
  endNode[_boundaryId_] = boundaryId
  boundaryId += 1
  return [startNode, endNode]
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function onStop (comp, fn) {
  comp[_children_].push({
    stop () {
      fn()
    }
  })
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function isStringOrNumber (any) {
  return typeof any === 'string' || typeof any === 'number'
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function isFunction (any) {
  return typeof any === 'function'
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function isObject (any) {
  return Object.prototype.toString.call(any) === '[object Object]'
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function isArray (any) {
  return Array.isArray(any) && !any[_isStream_]
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function isStream (any) {
  return any && any[_isStream_]
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function toFlatArray (any) {
  return isArray(any) ? any.flat() : [any]
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

addRenderPlugin({
  preprocess ({ template, state }) {
    const ordered = template.ordered
    if (ordered) {
      state.ordered = ordered
      if (ordered.items.map$) {
        template.inner = ordered.items.map(ordered.render)
      } else {
        template.inner = ordered.items.map(ordered.render)
      }
    }
  },

  cleanupTemplate ({ template }) {
    delete template.ordered
  },

  postprocess ({ state, node }) {
    const ordered = state.ordered
    if (!ordered) {
      return
    }

    const items = [...ordered.items]

    const d = !!ordered.items._deb

    let originalOrder = [...ordered.items]
    if (ordered.items.map$) {
      onSplice(ordered.items, () => {
        originalOrder = [...ordered.items]
        const nextOrder = [...originalOrder].sort(ordered.compare)
        reorderChildren(node, items, nextOrder, ordered.render, ordered.withAnimation) // items becomes nextOrder
      })
    }

    // if (items.map$) {
    //   onSplice(items, () => {
    //     originalOrder.items = [...items]
    //     const nextOrder = [...originalOrder.items]
    //     nextOrder.sort(ordered.compare)
    //     reorderChildren(node, items, nextOrder) // items becomes nextOrder
    //   });
    // }

    autorun(() => {
      const nextOrder = [...originalOrder].sort(ordered.compare)
      reorderChildren(node, items, nextOrder, ordered.render, ordered.withAnimation) // items becomes nextOrder
    })
  }
})

// TODO: нужно научить stream-ы не только в splice, но и в перемещение
// из index1 в index2, тогда sort$ — это стрим и рендерим как обычный стрим

function reorderChildren (root, order, nextOrder, renderItem, withAnimation = false) {
  if (withAnimation) {
    for (const elem of root.children) {
      const rect = elem.getBoundingClientRect()
      elem._prevPosition = {
        left: rect.left,
        top: rect.top
      }
    }
  }

  // console.log('--------');
  // console.log('REORDER');
  // console.log({from: [...order], to: [...nextOrder]});

  // TODO: нужно что-то придумать с потерей фокуса у инпутов
  // (исчезают из-за фрагментов)
  // Может так: если input и в фокусе, то делаем без фрагментов (медленно)
  // Иначе с фрагментами (быстро)

  // let rangeBefore = getSelection().getRangeAt(0);
  // rangeBefore = {
  //   startContainer: rangeBefore.startContainer,
  //   startOffset: rangeBefore.startOffset,
  //   endContainer: rangeBefore.endContainer,
  //   endOffset: rangeBefore.endOffset
  // };

  order.forEach(item => {
    // Item is removed
    if (!nextOrder.includes(item)) {
      const index = order.indexOf(item)
      order.splice(index, 1)
      removeByIndex(root, index)
    }
  })

  // const moveElems = []

  // nextOrder.forEach((nextItem, nextIndex) => {
  //   const index = order.indexOf(nextItem)
  //   if (index === -1) {
  //     // order.splice(nextIndex, 0, nextItem)
  //     // const newElem = render(renderItem(nextItem))
  //     // root.insertBefore(newElem, getFirstNodeByIndex(root, nextIndex))
  //   } else if (index !== nextIndex) {
  //     // Передаем false для isTake, только чтобы позиции запомнить
  //     const fragment = takeByIndex(root, index, false)
  //   }
  // })

  nextOrder.forEach((nextItem, nextIndex) => {
    // Item added
    const index = order.indexOf(nextItem)
    if (index === -1) {
      order.splice(nextIndex, 0, nextItem)
      const newElems = toFlatArray(render(renderItem(nextItem)))
      const fragment = document.createDocumentFragment()
      newElems.forEach(newElem => {
        fragment.appendChild(newElem)
      })
      root.insertBefore(fragment, getFirstNodeByIndex(root, nextIndex))
    }
  })


  nextOrder.forEach((nextItem, nextIndex) => {
    const index = order.indexOf(nextItem)

    // New item
    if (index === -1) {
      // order.splice(nextIndex, 0, nextItem)
      // const newElem = render(renderItem(nextItem))
      // root.insertBefore(newElem, getFirstNodeByIndex(root, nextIndex))

    // Item changes position
    } else if (index !== nextIndex) {
      // console.log('> CHANGE POS');
      // console.log({from: index, to: nextIndex});
      changePosition(root, index, nextIndex)

      // Move item from `index` to `nextIndex`
      const itemAtIndex = order.splice(index, 1)[0]
      order.splice(nextIndex, 0, itemAtIndex)
    }
  })
  // moveElems.forEach(elem => {
  //   elem._move()
  // })


  if (withAnimation) {
    let delay = 10
    for (const elem of root.children) {
      const prevPosition = elem._prevPosition

      if (!prevPosition || (prevPosition.left === 0 && prevPosition.top === 0)) {
        continue
      }

      delete elem._prevPosition
      requestAnimationFrame(() => {
        const nextPosition = elem.getBoundingClientRect()
        if (
          prevPosition.left === nextPosition.left &&
          prevPosition.top === nextPosition.top
        ) {
          return
        }

        const dx = nextPosition.left - prevPosition.left
        const dy = nextPosition.top - prevPosition.top
        elem.style.transition = 'none';
        elem.style.transform = `translate(${-dx}px, ${-dy}px)`
        setTimeout(() => {
          elem.style.transition = 'transform 0.5s ease';
          elem.style.transform = 'translate(0, 0)';
        }, delay)
        delay += 50
      })
    }
  }

  // moveElems.forEach(elem => {
  //   const nextPosition = elem.getBoundingClientRect()
  //   if (elem._prevPosition) {
  //     const dx = nextPosition.left - elem._prevPosition.left
  //     const dy = nextPosition.top - elem._prevPosition.top
  //     elem.style.transition = 'none';
  //     elem.style.transform = `translate(${-dx}px, ${-dy}px)`
  //     // elem.offsetWidth // force redraw
  //     setTimeout(() => {
  //       elem.style.transition = 'transform 0.5s ease';
  //       elem.style.transform = 'translate(0, 0)';
  //     }, 10)
  //   }
  // })


  // if (rangeBefore) {
  //   console.log(rangeBefore);
  //   const range = document.createRange()
  //   range.setStart(rangeBefore.startContainer, rangeBefore.startOffset)
  //   range.setEnd(rangeBefore.endContainer, rangeBefore.endOffset)
  //   getSelection().removeAllRanges()
  //   getSelection().addRange(range)
  // }
}

function takeByIndex (elem, index, isTake = false) {
  let i = 0
  let cursor = elem.childNodes[0][_boundaryId_]
    ? elem.childNodes[1]
    : elem.childNodes[0]

  while (true) {
    if (!cursor) {
      return null
    }

    const boundaryId = cursor[_boundaryId_]
    if (boundaryId) {
      let fragment
      if (i === index) {
        fragment = document.createDocumentFragment()
      }

      while (true) {
        const nextSibling = cursor.nextSibling

        // Hack for animation reorder
        if (cursor.getBoundingClientRect && !isTake) {
          cursor._prevPosition = cursor.getBoundingClientRect()
        }

        if (isTake && fragment) {
          fragment.appendChild(cursor)
        }

        cursor = nextSibling
        if (!cursor) {
          return null
        }
        if (cursor[_boundaryId_] === boundaryId) {
          // Hack for animation reorder
          if (cursor.getBoundingClientRect && !isTake) {
            cursor._prevPosition = cursor.getBoundingClientRect()
          }

          if (isTake && fragment) {
            fragment.appendChild(cursor)
          }
          break
        }
      }

      if (fragment) {
        return fragment
      }
    } else {
      if (i === index) {
        const fragment = document.createDocumentFragment()

        // Hack for animation reorder
        if (cursor.getBoundingClientRect && !isTake) {
          cursor._prevPosition = cursor.getBoundingClientRect()
        }

        if (isTake && fragment) {
          fragment.appendChild(cursor)
        }

        return fragment
      }
    }
    i += 1
    cursor = cursor.nextSibling
  }
}

function removeByIndex (root, index) {
  const nodesAtIndex = []

  let i = 0
  let cursor = root.childNodes[0][_boundaryId_]
    ? root.childNodes[1]
    : root.childNodes[0]

  while (true) {
    if (!cursor) {
      break
    }

    const boundaryId = cursor[_boundaryId_]
    const isIndex = (i === index)
    if (boundaryId) {
      while (true) {
        if (isIndex) {
          nodesAtIndex.push(cursor)
        }
        cursor = cursor.nextSibling
        if (!cursor) {
          break
        }
        if (cursor && cursor[_boundaryId_] === boundaryId) {
          if (isIndex) {
            nodesAtIndex.push(cursor)
          }
          break
        }
      }
      if (isIndex) {
        break
      }
    } else if (isIndex) {
      nodesAtIndex.push(cursor)
      break
    }

    i += 1
    cursor = cursor.nextSibling
  }

  nodesAtIndex.forEach(node => {
    root.removeChild(node)
  })
}

function changePosition (root, oldIndex, newIndex) {
  const nodesAtOldIndex = []

  let i = 0
  let cursor = root.childNodes[0][_boundaryId_]
    ? root.childNodes[1]
    : root.childNodes[0]

  while (true) {
    if (!cursor) {
      break
    }

    const boundaryId = cursor[_boundaryId_]
    const isOldIndex = (i === oldIndex)
    if (boundaryId) {
      while (true) {
        if (isOldIndex) {
          nodesAtOldIndex.push(cursor)
        }
        cursor = cursor.nextSibling
        if (!cursor) {
          break
        }
        if (cursor && cursor[_boundaryId_] === boundaryId) {
          if (isOldIndex) {
            nodesAtOldIndex.push(cursor)
          }
          break
        }
      }
      if (isOldIndex) {
        break
      }
    } else if (isOldIndex) {
      nodesAtOldIndex.push(cursor)
      break
    }

    i += 1
    cursor = cursor.nextSibling
  }

  const firstNodeAtNewIndex = getFirstNodeByIndex(root, newIndex)
  nodesAtOldIndex.forEach(node => {
    root.insertBefore(node, firstNodeAtNewIndex)
  })
}


function getFirstNodeByIndex (elem, index) {
  let i = 0
  let cursor = elem.childNodes[0][_boundaryId_]
    ? elem.childNodes[1]
    : elem.childNodes[0]

  while (true) {
    if (!cursor) {
      return null
    }

    const boundaryId = cursor[_boundaryId_]
    if (boundaryId) {
      if (i === index) {
        return cursor
      }
      while (true) {
        cursor = cursor.nextSibling
        if (!cursor) {
          return null
        }
        if (cursor[_boundaryId_] === boundaryId) {
          break
        }
      }
    } else {
      if (i === index) {
        return cursor
      }
    }
    i += 1
    cursor = cursor.nextSibling
  }
}
