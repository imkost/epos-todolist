// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"lib/epos.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dynamic = dynamic;
exports.autorun = autorun;
exports.computed = computed;
exports.compound = compound;
exports.render = render;
exports.renderRaw = renderRaw;
exports.suspend = suspend;
exports.default = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

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
Object.assign(render, {
  addPlugin: addRenderPlugin
});
var _default = {
  dynamic: dynamic,
  autorun: autorun,
  computed: computed,
  compound: compound,
  // DOM-related
  render: render,
  renderRaw: renderRaw,
  suspend: suspend
};
exports.default = _default;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Function to be called on reactive getter.
 */
var curGet = null;
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Current reactive computation. Computations are created by `autorun`.
 */

var curComp = null;
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Current node created via `renderObject`
 */

var curNode = null;
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * List of all delayed reactions. Used for compound.
 */

var curStack = null;
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Counter for creating boundary nodes.
 */

var boundaryId = 1;
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

var isStandaloneRender = false;
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * List of all possible event names: "onclick", "onmousedown", etc.
 */

var events = getAllPossibleEventNames();
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * List of render plugins.
 */

var plugins = [];
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Набор функций, которые будут выполнены, когда root-computation
 * перевычислится. Под рутовым вычислением имеется в виду тот, который
 * перевычислился при реактивном измененнии одной из своих зависимостей,
 * а не тот, который перевычислился из-за того, что его родитель-computation
 * перевычислился. Этот набор нужен для реализации `computed`.
 */

var afterRun = new Set();
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * All symbols used by Epos
 */

var _comp_ = Symbol('comp');

var _comps_ = Symbol('comps');

var _usages_ = Symbol('usages');

var _source_ = Symbol('source');

var _splice_ = Symbol('splice');

var _trusted_ = Symbol('trusted');

var _children_ = Symbol('children');

var _isStream_ = Symbol('isStream');

var _boundaryId_ = Symbol('boundaryId');
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function dynamic(any) {
  return createSource(any);
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function createSource(any, parentChange) {
  if (isObject(any)) {
    return createSourceObject(any, parentChange);
  }

  if (isArray(any)) {
    return createSourceArray(any, parentChange);
  }

  return any;
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function createSourceObject(object, parentChange) {
  if (object.get$) {
    return object;
  }

  var source = {};

  for (var key in object) {
    setSourceProp(key, object[key]);
  }

  Object.defineProperties(source, {
    set$: {
      get: function get() {
        return set$;
      }
    },
    delete$: {
      get: function get() {
        return delete$;
      }
    },
    get$: {
      get: function get() {
        return get$;
      }
    }
  });
  return source;

  function set$(key, value) {
    setSourceProp(key, value);

    if (parentChange) {
      callFnsStack(parentChange);
    }
  }

  function delete$(key) {
    source["".concat(key, "$")] = undefined;
    delete source[key];
    delete source["".concat(key, "$")];

    if (parentChange) {
      callFnsStack(parentChange);
    }
  }

  function get$(key) {
    if (key in source) {
      return source["".concat(key, "$")];
    } // TODO: implement dynamic setting and deleting

  }

  function setSourceProp(key, value) {
    var change = new Set(); // fns to be called on reactive value change

    source[key] = createSource(value, change);
    var prevValue = source[key];
    Object.defineProperty(source, "".concat(key, "$"), {
      configurable: true,
      // for `delete source['key$']` to work
      get: function get() {
        if (!curComp && !source[_trusted_]) {// console.warn(`Referencing a dynamic field "${key}" without a computational context or function`)
        }

        if (curGet) {
          curGet(change);
        }

        return source[key];
      },
      set: function set(newValue) {
        if (prevValue !== newValue) {
          source[key] = createSource(newValue, change);
          callFnsStack(change);
        }

        prevValue = newValue;
        return true;
      }
    });
  }
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function createSourceArray(array, parentChange) {
  if (array.pop$) {
    return array;
  }

  var source = array.map(function (item) {
    return createSource(item);
  });
  source[_splice_] = new Set(); // fns to be called after splice$
  // TODO: add sort$ and reverse$

  Object.defineProperties(source, {
    pop$: {
      get: function get() {
        return pop$;
      }
    },
    push$: {
      get: function get() {
        return push$;
      }
    },
    shift$: {
      get: function get() {
        return shift$;
      }
    },
    unshift$: {
      get: function get() {
        return unshift$;
      }
    },
    splice$: {
      get: function get() {
        return splice$;
      }
    },
    map$: {
      get: function get() {
        return map$;
      }
    }
  });
  return source;

  function map$(fn) {
    return createStream(source, fn);
  }
  /**
   * All of these functions are implemented via splice$. Why?
   * It's just simpler, we impelement reactivity only for splice$ and get
   * reactivity for all the reset functions for free.
   */


  function pop$() {
    var removed = splice$(source.length - 1, 1);
    return removed[0];
  }

  function push$(item) {
    splice$(source.length, 0, item);
    return source.length;
  }

  function shift$() {
    var removed = splice$(0, 1);
    return removed[0];
  }

  function unshift$(item) {
    splice$(0, 0, item);
    return source.length;
  }

  function splice$(start, removeCount) {
    for (var _len = arguments.length, items = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      items[_key - 2] = arguments[_key];
    }

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
      start = Math.max(0, source.length + start);
    } else if (start > source.length - 1) {
      start = source.length;
    }

    removeCount = Math.max(0, Math.min(source.length - start, removeCount)); // Every item to source

    items = items.map(function (i) {
      return createSource(i);
    }); // Call original splice

    var removed = source.splice.apply(source, [start, removeCount].concat(_toConsumableArray(items))); // Call splice$ listeners

    callFnsStack.apply(void 0, [source[_splice_], start, removeCount].concat(_toConsumableArray(items))); // Call `parentChange`, because splice$ changes array (in reactivity)

    if (parentChange) {
      callFnsStack(parentChange);
    }

    return removed;
  }
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function computed(fn) {
  if (!isFunction(fn)) {
    return fn;
  } // If `computed` was never run for the given function


  if (!fn[_source_]) {
    // Создаем счетчик использований, который говорит сколько раз computed
    // от переданной функции вызывался внутри computation-ов
    fn[_usages_] = 0; // Создаем источник для функции со значением undefined

    fn[_source_] = createSource({
      value: void 0
    });
    fn[_source_][_trusted_] = true; // Перевычисляем значение в standalone-computation (передаем true в авторан)

    fn[_comp_] = autorun(function () {
      // TODO: в юнифиде в некоторых ситуациях получалось так, что autorun
      // бежит, а _source_ уже нет. Баг? Или ок?
      // UPD: скорее всего было связано с тем, что не было suspend,
      // закмментирую if, проверим
      // UPD2: все-таки нужно if. Надо разобраться почему
      if (fn[_source_]) {
        fn[_source_].value$ = fn();
      }
    }, true);
  } // Если мы внутри computation-а


  if (curComp) {
    // Увеличиваем счетчик использований
    fn[_usages_] += 1;
    onStop(curComp, function () {
      // Когда computation останавливается, понижаем счетчик использований.
      // Если внутри computation-а computed от одной функции вызовется
      // дважды, то счетчик увеличится на 2, а при остановке уменьшится
      // на 2 — все ок.
      fn[_usages_] -= 1; // Как только рутовый computation закончится, нужно проверить, что
      // computed от функции нигде больше не используется ...

      afterRun.add(checkUsages);

      function checkUsages() {
        // ... И если он действительно больше нигда не используется
        if (fn[_usages_] === 0) {
          // То останавливаем computation
          fn[_comp_].stop(); // Обнуляем source


          fn[_source_] = null;
        }
      }
    });
  } // Возвращаем реактивный get на value, таким образом computation, который
  // внутри вызывает computed(fn) будет зависеть динамически только
  // от результата fn, а не от всех ее внутренностей


  return fn[_source_].value$;
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function compound(fn) {
  var parentStack = curStack;
  curStack = [];
  fn();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = curStack[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var f = _step.value;
      f();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  curStack = parentStack;
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
// TODO: подумать над реактивным индексом
// возможно что-то вроде Epos.dynamic(i) или i.value$


function createStream(sourceArray, fn) {
  var stream = createSourceArray(sourceArray.map(function (item) {
    return fn(item);
  })); // Помечаем поток, чтобы при рендеринге отличать его от массива

  stream[_isStream_] = true; // Слушаем splice$

  onSplice(sourceArray, function (start, removeCount) {
    for (var _len2 = arguments.length, items = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      items[_key2 - 2] = arguments[_key2];
    }

    // Трансформируем новые значения
    items = items.map(function (item) {
      return fn(item);
    }); // Делаем реактивный splice$, чтобы стриггерить слушателей потока, если такие имеются

    stream.splice$.apply(stream, [start, removeCount].concat(_toConsumableArray(items)));
  });
  return stream;
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


function autorun(fn) {
  var isStandalone = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  // Тут хранятся change-наборы зависимых переменных
  var deps = new Set();

  var comp = _defineProperty({
    stop: stop
  }, _children_, []);

  if (curNode) {
    curNode[_comps_].push(comp);
  } // Если есть родительский computation и autorun не в standalone-режиме,
  // то прописываем себя в дети родителя


  if (curComp && !isStandalone) {
    curComp[_children_].push(comp);
  }

  run();
  return comp;

  function run() {
    stop();
    var parentGet = curGet;
    var parentComp = curComp;
    curGet = get;
    curComp = comp;
    fn(comp);
    curGet = parentGet;
    curComp = parentComp; // Если `curComp` оказался null-ом, значит это закончил свое перевычисление
    // root-computation (см. описание `afterRun` выше).

    if (curComp === null) {
      callFns(afterRun);
      afterRun.clear();
    }
  }

  function get(change) {
    // Добавляем зависимость
    change.add(run);
    deps.add(change);
  }

  function stop() {
    // Останавливаем всех детей
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = comp[_children_][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var child = _step2.value;
        child.stop();
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    comp[_children_] = []; // Удаляем все связанные зависимости

    for (var _i = 0, _Array$from = Array.from(deps); _i < _Array$from.length; _i++) {
      var change = _Array$from[_i];
      change.delete(run);
    }

    deps.clear();
  }
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function render(template) {
  var result;
  autorun(function () {
    var prev = isStandaloneRender;
    isStandaloneRender = true;
    result = renderInternal(template);
    isStandaloneRender = prev;
  }, true);
  return result;
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function renderInternal(template, isSvg) {
  if (template instanceof window.Node) {
    return template;
  }

  if (isStringOrNumber(template)) {
    return document.createTextNode(template);
  }

  if (isObject(template)) {
    return renderObject(template, isSvg);
  }

  if (isArray(template)) {
    return renderArray(template, isSvg);
  }

  if (isFunction(template)) {
    return renderFunction(template, isSvg);
  }

  if (isStream(template)) {
    return renderStream(template, isSvg);
  }

  return document.createTextNode('');
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function renderObject(template, isSvg) {
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
  var stateByPlugin = new Map();

  for (var _i2 = 0, _plugins = plugins; _i2 < _plugins.length; _i2++) {
    var plugin = _plugins[_i2];

    if (plugin.preprocess) {
      var state = {};
      stateByPlugin.set(plugin, state);
      plugin.preprocess({
        state: state,
        template: template
      });
    }
  } // Cleanup template by plugins


  for (var _i3 = 0, _plugins2 = plugins; _i3 < _plugins2.length; _i3++) {
    var _plugin = _plugins2[_i3];

    if (_plugin.cleanupTemplate) {
      _plugin.cleanupTemplate({
        template: template
      });
    }
  } // Create node


  var node;
  var tag = template.tag || 'div';

  if (tag === 'svg') {
    isSvg = true;
  } // TODO: process <foreignObject>


  if (isSvg) {
    node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  } else {
    node = document.createElement(tag);
  }

  node[_comps_] = [];
  var parentNode = curNode; // This fixes show/hide post after toggling show hidden in unifeed

  if (!isStandaloneRender) {
    curNode = node;
  } // Set attributes and add event listeners


  var _loop = function _loop(key) {
    if (key === 'tag' || key === 'inner') {
      return "continue";
    }

    var value = template[key];

    if (events.includes(key.toLowerCase()) && isFunction(value)) {
      node.addEventListener(key.toLowerCase().slice(2), value);
    } else {
      autorun(function () {
        setAttributeSafe(node, key, isFunction(value) ? value() : value, isSvg);
      });
    }
  };

  for (var key in template) {
    var _ret = _loop(key);

    if (_ret === "continue") continue;
  } // Render children and attach them to the node


  var children = toFlatArray(renderInternal(template.inner, isSvg));
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var child = _step3.value;
      node.appendChild(child);
    } // Postprocess with plugins

  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  for (var _i4 = 0, _plugins3 = plugins; _i4 < _plugins3.length; _i4++) {
    var _plugin2 = _plugins3[_i4];

    if (_plugin2.postprocess) {
      var _state = stateByPlugin.get(_plugin2); // TODO: probably remove `template` from args?


      _plugin2.postprocess({
        state: _state,
        template: template,
        node: node
      });
    }
  }

  curNode = parentNode;
  return node;
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function setAttributeSafe(node, key, value, isSvg) {
  // `value` is valid => set attribute
  if (isStringOrNumber(value) || typeof value === 'boolean') {
    // Если поле есть на элементе, то меняем его, иначе — ставим атрибут.
    // Почему так? Например, для input-ов есть поле value и менять его
    // следует именно через input.value, а не через
    // input.setAttribute('value', ...)
    if (key in node && !isSvg) {
      node[key] = value;
    } else {
      node.setAttribute(key, value);
    } // Otherwise => delete attribute

  } else {
    node.removeAttribute(key);
  }
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function renderArray(template, isSvg) {
  var _createBoundaryNodes = createBoundaryNodes(),
      _createBoundaryNodes2 = _slicedToArray(_createBoundaryNodes, 2),
      startNode = _createBoundaryNodes2[0],
      endNode = _createBoundaryNodes2[1];

  return [startNode].concat(_toConsumableArray(toFlatArray(template.map(function (i) {
    return renderInternal(i, isSvg);
  }))), [endNode]);
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function renderFunction(template, isSvg) {
  var _createBoundaryNodes3 = createBoundaryNodes(),
      _createBoundaryNodes4 = _slicedToArray(_createBoundaryNodes3, 2),
      startNode = _createBoundaryNodes4[0],
      endNode = _createBoundaryNodes4[1];

  var isFirstRun = true;
  var nodes;
  autorun(function () {
    var newNodes = toFlatArray(renderInternal(template(), isSvg));

    if (isFirstRun) {
      nodes = newNodes;
      isFirstRun = false;
    } else {
      // Create fragment with new nodes
      var fragment = document.createDocumentFragment();
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = newNodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var newNode = _step4.value;
          fragment.appendChild(newNode);
        } // Remove all nodes between start and end

      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      while (startNode.nextSibling !== endNode) {
        removeNode(startNode.nextSibling);
      } // Insert fragment between start and end


      endNode.parentNode.insertBefore(fragment, endNode);
    }
  });
  return [startNode].concat(_toConsumableArray(nodes), [endNode]);
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function renderStream(stream, isSvg) {
  var nodes = renderArray(stream);
  var startNode = nodes[0];
  var endNode = nodes[nodes.length - 1]; // TODO: порефакторить все, что внутри

  onSplice(stream, function (start, removeCount) {
    var i = 0;
    var cursor = startNode.nextSibling;

    if (!cursor) {
      // probably rerun of already removed elements
      console.log('strange');
      return;
    }

    var children = [];

    while (cursor !== endNode) {
      if (cursor[_boundaryId_]) {
        var nodes2 = [];
        var _boundaryId = cursor[_boundaryId_];

        while (true) {
          nodes2.push(cursor);
          cursor = cursor.nextSibling;

          if (cursor[_boundaryId_] === _boundaryId) {
            nodes2.push(cursor);
            break;
          }
        }

        children.push(nodes2);
      } else {
        children.push(cursor);
      }

      cursor = cursor.nextSibling;
    }

    var nodesToRemove = [];
    var bef = toFlatArray(children[start] || endNode)[0];

    for (i = 0; i < removeCount; i++) {
      var cc = toFlatArray(children[start + i]);
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = cc[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var c = _step5.value;
          nodesToRemove.push(c);
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }

    for (var _len3 = arguments.length, items = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
      items[_key3 - 2] = arguments[_key3];
    }

    for (var _i5 = 0, _items = items; _i5 < _items.length; _i5++) {
      var item = _items[_i5];
      var ii = toFlatArray(renderInternal(item, isSvg));
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = ii[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var _i7 = _step6.value;
          bef.parentNode.insertBefore(_i7, bef);
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }

    for (var _i6 = 0, _nodesToRemove = nodesToRemove; _i6 < _nodesToRemove.length; _i6++) {
      var n = _nodesToRemove[_i6];
      removeNode(n);
    }
  });
  return nodes;
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function addRenderPlugin(plugin) {
  plugins.push(plugin);
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function renderRaw(string) {
  var div = renderInternal({});
  div.innerHTML = string;
  return Array.from(div.childNodes);
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Stops all dynamic computations for the given node
 */


function suspend(node) {
  if (node && node[_comps_]) {
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = node[_comps_][Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        var comp = _step7.value;
        comp.stop();
      }
    } catch (err) {
      _didIteratorError7 = true;
      _iteratorError7 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
          _iterator7.return();
        }
      } finally {
        if (_didIteratorError7) {
          throw _iteratorError7;
        }
      }
    }
  }
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function removeNode(node) {
  node.remove();
  suspend(node);
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Adds splice listener for the given source-array
 */


function onSplice(sourceArray, fn) {
  sourceArray[_splice_].add(fn); // Stop listener if current computation stops


  if (curComp) {
    onStop(curComp, function () {
      sourceArray[_splice_].delete(fn);
    });
  }
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Calls all given functions one by one
 * fns = Array/Set
 */


function callFns(fns) {
  for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    args[_key4 - 1] = arguments[_key4];
  }

  for (var _i8 = 0, _Array$from2 = Array.from(fns); _i8 < _Array$from2.length; _i8++) {
    var fn = _Array$from2[_i8];
    fn.apply(void 0, args);
  }
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Same as `callFns`, but stack-aware.
 * If inside compound => push fns to stack instead of calling
 */


function callFnsStack(fns) {
  for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    args[_key5 - 1] = arguments[_key5];
  }

  if (!fns) {
    return;
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
    curStack.push(call);
  } else {
    call();
  }

  function call() {
    callFns.apply(void 0, [fns].concat(args));
  }
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Returns a list of all possible DOM events: "onclick", "onmousedown", etc.
 * https://css-tricks.com/snippets/javascript/get-possible-dom-events/
 */


function getAllPossibleEventNames() {
  var events = [];

  for (var key in document) {
    var value = document[key];

    if (key.startsWith('on') && (value === null || isFunction(value))) {
      events.push(key);
    }
  }

  return events;
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function createBoundaryNodes() {
  var startNode = document.createTextNode('');
  var endNode = document.createTextNode('');
  startNode[_boundaryId_] = boundaryId;
  endNode[_boundaryId_] = boundaryId;
  boundaryId += 1;
  return [startNode, endNode];
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function onStop(comp, fn) {
  comp[_children_].push({
    stop: function stop() {
      fn();
    }
  });
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function isStringOrNumber(any) {
  return typeof any === 'string' || typeof any === 'number';
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function isFunction(any) {
  return typeof any === 'function';
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function isObject(any) {
  return Object.prototype.toString.call(any) === '[object Object]';
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function isArray(any) {
  return Array.isArray(any) && !any[_isStream_];
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function isStream(any) {
  return any && any[_isStream_];
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function toFlatArray(any) {
  return isArray(any) ? any.flat() : [any];
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


addRenderPlugin({
  preprocess: function preprocess(_ref) {
    var template = _ref.template,
        state = _ref.state;
    var ordered = template.ordered;

    if (ordered) {
      state.ordered = ordered;

      if (ordered.items.map$) {
        template.inner = ordered.items.map(ordered.render);
      } else {
        template.inner = ordered.items.map(ordered.render);
      }
    }
  },
  cleanupTemplate: function cleanupTemplate(_ref2) {
    var template = _ref2.template;
    delete template.ordered;
  },
  postprocess: function postprocess(_ref3) {
    var state = _ref3.state,
        node = _ref3.node;
    var ordered = state.ordered;

    if (!ordered) {
      return;
    }

    var items = _toConsumableArray(ordered.items);

    var d = !!ordered.items._deb;

    var originalOrder = _toConsumableArray(ordered.items);

    if (ordered.items.map$) {
      onSplice(ordered.items, function () {
        originalOrder = _toConsumableArray(ordered.items);

        var nextOrder = _toConsumableArray(originalOrder).sort(ordered.compare);

        reorderChildren(node, items, nextOrder, ordered.render, ordered.withAnimation); // items becomes nextOrder
      });
    } // if (items.map$) {
    //   onSplice(items, () => {
    //     originalOrder.items = [...items]
    //     const nextOrder = [...originalOrder.items]
    //     nextOrder.sort(ordered.compare)
    //     reorderChildren(node, items, nextOrder) // items becomes nextOrder
    //   });
    // }


    autorun(function () {
      var nextOrder = _toConsumableArray(originalOrder).sort(ordered.compare);

      reorderChildren(node, items, nextOrder, ordered.render, ordered.withAnimation); // items becomes nextOrder
    });
  }
}); // TODO: нужно научить stream-ы не только в splice, но и в перемещение
// из index1 в index2, тогда sort$ — это стрим и рендерим как обычный стрим

function reorderChildren(root, order, nextOrder, renderItem) {
  var withAnimation = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  if (withAnimation) {
    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
      for (var _iterator8 = root.children[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
        var elem = _step8.value;
        var rect = elem.getBoundingClientRect();
        elem._prevPosition = {
          left: rect.left,
          top: rect.top
        };
      }
    } catch (err) {
      _didIteratorError8 = true;
      _iteratorError8 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
          _iterator8.return();
        }
      } finally {
        if (_didIteratorError8) {
          throw _iteratorError8;
        }
      }
    }
  } // console.log('--------');
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


  order.forEach(function (item) {
    // Item is removed
    if (!nextOrder.includes(item)) {
      var index = order.indexOf(item);
      order.splice(index, 1);
      removeByIndex(root, index);
    }
  }); // const moveElems = []
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

  nextOrder.forEach(function (nextItem, nextIndex) {
    // Item added
    var index = order.indexOf(nextItem);

    if (index === -1) {
      order.splice(nextIndex, 0, nextItem);
      var newElems = toFlatArray(render(renderItem(nextItem)));
      var fragment = document.createDocumentFragment();
      newElems.forEach(function (newElem) {
        fragment.appendChild(newElem);
      });
      root.insertBefore(fragment, getFirstNodeByIndex(root, nextIndex));
    }
  });
  nextOrder.forEach(function (nextItem, nextIndex) {
    var index = order.indexOf(nextItem); // New item

    if (index === -1) {// order.splice(nextIndex, 0, nextItem)
      // const newElem = render(renderItem(nextItem))
      // root.insertBefore(newElem, getFirstNodeByIndex(root, nextIndex))
      // Item changes position
    } else if (index !== nextIndex) {
      // console.log('> CHANGE POS');
      // console.log({from: index, to: nextIndex});
      changePosition(root, index, nextIndex); // Move item from `index` to `nextIndex`

      var itemAtIndex = order.splice(index, 1)[0];
      order.splice(nextIndex, 0, itemAtIndex);
    }
  }); // moveElems.forEach(elem => {
  //   elem._move()
  // })

  if (withAnimation) {
    (function () {
      var delay = 10;
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        var _loop2 = function _loop2() {
          var elem = _step9.value;
          var prevPosition = elem._prevPosition;

          if (!prevPosition || prevPosition.left === 0 && prevPosition.top === 0) {
            return "continue";
          }

          delete elem._prevPosition;
          requestAnimationFrame(function () {
            var nextPosition = elem.getBoundingClientRect();

            if (prevPosition.left === nextPosition.left && prevPosition.top === nextPosition.top) {
              return;
            }

            var dx = nextPosition.left - prevPosition.left;
            var dy = nextPosition.top - prevPosition.top;
            elem.style.transition = 'none';
            elem.style.transform = "translate(".concat(-dx, "px, ").concat(-dy, "px)");
            setTimeout(function () {
              elem.style.transition = 'transform 0.5s ease';
              elem.style.transform = 'translate(0, 0)';
            }, delay);
            delay += 50;
          });
        };

        for (var _iterator9 = root.children[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var _ret2 = _loop2();

          if (_ret2 === "continue") continue;
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9.return != null) {
            _iterator9.return();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }
    })();
  } // moveElems.forEach(elem => {
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

function takeByIndex(elem, index) {
  var isTake = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var i = 0;
  var cursor = elem.childNodes[0][_boundaryId_] ? elem.childNodes[1] : elem.childNodes[0];

  while (true) {
    if (!cursor) {
      return null;
    }

    var _boundaryId2 = cursor[_boundaryId_];

    if (_boundaryId2) {
      var fragment = void 0;

      if (i === index) {
        fragment = document.createDocumentFragment();
      }

      while (true) {
        var nextSibling = cursor.nextSibling; // Hack for animation reorder

        if (cursor.getBoundingClientRect && !isTake) {
          cursor._prevPosition = cursor.getBoundingClientRect();
        }

        if (isTake && fragment) {
          fragment.appendChild(cursor);
        }

        cursor = nextSibling;

        if (!cursor) {
          return null;
        }

        if (cursor[_boundaryId_] === _boundaryId2) {
          // Hack for animation reorder
          if (cursor.getBoundingClientRect && !isTake) {
            cursor._prevPosition = cursor.getBoundingClientRect();
          }

          if (isTake && fragment) {
            fragment.appendChild(cursor);
          }

          break;
        }
      }

      if (fragment) {
        return fragment;
      }
    } else {
      if (i === index) {
        var _fragment = document.createDocumentFragment(); // Hack for animation reorder


        if (cursor.getBoundingClientRect && !isTake) {
          cursor._prevPosition = cursor.getBoundingClientRect();
        }

        if (isTake && _fragment) {
          _fragment.appendChild(cursor);
        }

        return _fragment;
      }
    }

    i += 1;
    cursor = cursor.nextSibling;
  }
}

function removeByIndex(root, index) {
  var nodesAtIndex = [];
  var i = 0;
  var cursor = root.childNodes[0][_boundaryId_] ? root.childNodes[1] : root.childNodes[0];

  while (true) {
    if (!cursor) {
      break;
    }

    var _boundaryId3 = cursor[_boundaryId_];
    var isIndex = i === index;

    if (_boundaryId3) {
      while (true) {
        if (isIndex) {
          nodesAtIndex.push(cursor);
        }

        cursor = cursor.nextSibling;

        if (!cursor) {
          break;
        }

        if (cursor && cursor[_boundaryId_] === _boundaryId3) {
          if (isIndex) {
            nodesAtIndex.push(cursor);
          }

          break;
        }
      }

      if (isIndex) {
        break;
      }
    } else if (isIndex) {
      nodesAtIndex.push(cursor);
      break;
    }

    i += 1;
    cursor = cursor.nextSibling;
  }

  nodesAtIndex.forEach(function (node) {
    root.removeChild(node);
  });
}

function changePosition(root, oldIndex, newIndex) {
  var nodesAtOldIndex = [];
  var i = 0;
  var cursor = root.childNodes[0][_boundaryId_] ? root.childNodes[1] : root.childNodes[0];

  while (true) {
    if (!cursor) {
      break;
    }

    var _boundaryId4 = cursor[_boundaryId_];
    var isOldIndex = i === oldIndex;

    if (_boundaryId4) {
      while (true) {
        if (isOldIndex) {
          nodesAtOldIndex.push(cursor);
        }

        cursor = cursor.nextSibling;

        if (!cursor) {
          break;
        }

        if (cursor && cursor[_boundaryId_] === _boundaryId4) {
          if (isOldIndex) {
            nodesAtOldIndex.push(cursor);
          }

          break;
        }
      }

      if (isOldIndex) {
        break;
      }
    } else if (isOldIndex) {
      nodesAtOldIndex.push(cursor);
      break;
    }

    i += 1;
    cursor = cursor.nextSibling;
  }

  var firstNodeAtNewIndex = getFirstNodeByIndex(root, newIndex);
  nodesAtOldIndex.forEach(function (node) {
    root.insertBefore(node, firstNodeAtNewIndex);
  });
}

function getFirstNodeByIndex(elem, index) {
  var i = 0;
  var cursor = elem.childNodes[0][_boundaryId_] ? elem.childNodes[1] : elem.childNodes[0];

  while (true) {
    if (!cursor) {
      return null;
    }

    var _boundaryId5 = cursor[_boundaryId_];

    if (_boundaryId5) {
      if (i === index) {
        return cursor;
      }

      while (true) {
        cursor = cursor.nextSibling;

        if (!cursor) {
          return null;
        }

        if (cursor[_boundaryId_] === _boundaryId5) {
          break;
        }
      }
    } else {
      if (i === index) {
        return cursor;
      }
    }

    i += 1;
    cursor = cursor.nextSibling;
  }
}
},{}],"lib/epos-bem-class-processor.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = bemClassProcessor;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function bemClassProcessor() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (typeof props === 'string') {
    return props;
  }

  var className = props.name;

  var mods = _objectSpread({}, props);

  delete mods.name;

  if (!mods) {
    return className;
  }

  if (typeof mods === 'string') {
    return "".concat(className, " ").concat(className, "_").concat(mods);
  }

  var classes = [className];
  Object.keys(mods).forEach(function (k) {
    var v = mods[k];

    if (v === true) {
      classes.push("".concat(className, "_").concat(k));
    } else if (typeof v === 'number' || typeof v === 'string' && v) {
      classes.push("".concat(className, "_").concat(k, "_").concat(v));
    }
  });
  return classes.join(' ');
}
},{}],"lib/epos-plugin-class-array.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _epos = require("/lib/epos.js");

/**
 * Copyright (c) Konstantin Zemtsovsky
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var _prevClassList_ = Symbol('prevClassList');

var classProcessor = function classProcessor(c) {
  return c;
};

var _default = {
  setClassProcessor: function setClassProcessor(fn) {
    classProcessor = fn;
  },
  preprocess: function preprocess(_ref) {
    var state = _ref.state,
        template = _ref.template;

    if (template.class) {
      state.class = template.class;
    }
  },
  cleanupTemplate: function cleanupTemplate(_ref2) {
    var template = _ref2.template;

    if (template.class) {
      delete template.class;
    }
  },
  postprocess: function postprocess(_ref3) {
    var state = _ref3.state,
        node = _ref3.node;

    if (!state.class) {
      return;
    }

    (0, _epos.autorun)(function () {
      var prevClassList = node[_prevClassList_] || [];
      var nextClassList = [].concat(typeof state.class === 'function' ? state.class() : state.class).filter(Boolean).map(classProcessor).filter(function (c) {
        return c && typeof c === 'string';
      }).join(' ').split(/\s+/);
      node[_prevClassList_] = nextClassList;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = nextClassList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var className = _step.value;

          if (className && typeof className === 'string' && !prevClassList.includes(className)) {
            node.classList.add(className);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = prevClassList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _className = _step2.value;

          if (!nextClassList.includes(_className)) {
            node.classList.remove(_className);
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    });
  }
};
exports.default = _default;
},{"/lib/epos.js":"lib/epos.js"}],"lib/epos-plugin-on-create.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  preprocess: function preprocess(_ref) {
    var state = _ref.state,
        template = _ref.template;

    if (template.onCreate) {
      state.onCreate = template.onCreate;
      delete template.onCreate;
    }
  },
  postprocess: function postprocess(_ref2) {
    var state = _ref2.state,
        node = _ref2.node;

    if (state.onCreate) {
      state.onCreate(node);
    }
  }
};
exports.default = _default;
},{}],"lib/epos-plugin-mount-unmount.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var elementsToObserve = new Set();
var _default = {
  preprocess: function preprocess(_ref) {
    var state = _ref.state,
        template = _ref.template;

    if (!template) {
      return;
    }

    if (template.onMount) {
      state.onMount = template.onMount;
      delete template.onMount;
    }

    if (template.onUnmount) {
      state.onUnmount = template.onUnmount;
      delete template.onUnmount;
    }
  },
  postprocess: function postprocess(_ref2) {
    var state = _ref2.state,
        template = _ref2.template,
        node = _ref2.node;

    if (state.onMount || state.onUnmount) {
      elementsToObserve.add(node);
      node.onMount = state.onMount;
      node.onUnmount = state.onUnmount;
      startMo();
    }
  }
};
exports.default = _default;
var mo = new MutationObserver(function (mutations) {
  Array.from(elementsToObserve).forEach(function (elem) {
    if (elem.__isMounted) {
      if (!document.contains(elem)) {
        if (elem.onUnmount) {
          elem.onUnmount(elem);
        }

        elementsToObserve.delete(elem);

        if (elementsToObserve.size === 0) {
          stopMo();
        }
      }
    } else {
      if (document.contains(elem)) {
        elem.__isMounted = true;

        if (elem.onMount) {
          elem.onMount(elem);
        }
      }
    }
  });
});

function startMo() {
  if (mo.__started) {
    return;
  }

  mo.__started = true;
  mo.observe(document, {
    childList: true,
    subtree: true
  });
}

function stopMo() {
  if (mo.__started) {
    mo.__started = false;
    mo.disconnect();
  }
}
},{}],"store.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _epos = require("/lib/epos.js");

var _default = Object.assign(store, {
  init: initStore
});

exports.default = _default;
var st;

function store() {
  return st;
}

function initStore(data) {
  st = (0, _epos.dynamic)(data);
}
},{"/lib/epos.js":"lib/epos.js"}],"ui/app.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = App;

var _store = _interopRequireDefault(require("/store.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function App() {
  return {
    class: 'App',
    inner: (0, _store.default)().todos.map$(function (item) {
      return {
        class: function _class() {
          return {
            name: 'App__todo',
            done: item.done$
          };
        },
        onClick: function onClick() {
          return item.done$ = !item.done;
        },
        inner: function inner() {
          return item.text$;
        }
      };
    })
  };
}
},{"/store.js":"store.js"}],"index.js":[function(require,module,exports) {
"use strict";

var _epos = require("/lib/epos.js");

var _eposBemClassProcessor = _interopRequireDefault(require("/lib/epos-bem-class-processor.js"));

var _eposPluginClassArray = _interopRequireDefault(require("/lib/epos-plugin-class-array.js"));

var _eposPluginOnCreate = _interopRequireDefault(require("/lib/epos-plugin-on-create.js"));

var _eposPluginMountUnmount = _interopRequireDefault(require("/lib/epos-plugin-mount-unmount.js"));

var _store = _interopRequireDefault(require("/store.js"));

var _app = _interopRequireDefault(require("/ui/app.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function main() {
  _eposPluginClassArray.default.setClassProcessor(_eposBemClassProcessor.default);

  _epos.render.addPlugin(_eposPluginClassArray.default);

  _epos.render.addPlugin(_eposPluginOnCreate.default);

  _epos.render.addPlugin(_eposPluginMountUnmount.default);

  _store.default.init({
    todos: [{
      text: 'Learn epos',
      done: false
    }, {
      text: 'Write todolist',
      done: false
    }]
  });

  var $app = (0, _epos.render)((0, _app.default)());
  document.body.appendChild($app);
})();
},{"/lib/epos.js":"lib/epos.js","/lib/epos-bem-class-processor.js":"lib/epos-bem-class-processor.js","/lib/epos-plugin-class-array.js":"lib/epos-plugin-class-array.js","/lib/epos-plugin-on-create.js":"lib/epos-plugin-on-create.js","/lib/epos-plugin-mount-unmount.js":"lib/epos-plugin-mount-unmount.js","/store.js":"store.js","/ui/app.js":"ui/app.js"}],"../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "61545" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/src.e31bb0bc.js.map