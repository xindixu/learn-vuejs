/**
 * Observer
 */

class Observer {
  constructor (value) {
    if (Array.isArray(value)) {
      // ...
    } else {
      this.walk(value)
    }
  }

  walk (obj) {
    Object.keys(obj).forEach(key => {
      defineReactive(obj, key, obj[key])
    })
  }
}

// set all properties of an object to be reactive
function observe (obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  new Observer(obj)
}

/** Observe getting and setting an existing property of an object
 * It cannot add or remove a property
 * @param  {Object} obj
 * @param  {String} key
 * @param  {Any} val initial value
 */
function defineReactive (obj, key, val) {
  // recurse on nested objects
  observe(val)

  // create dep
  const dep = new Dep()

  Object.defineProperty(obj, key, {
    get: () => {
      // collect deps
      console.log('get', key)
      Dep.target && dep.addDep(Dep.target)
      return val
    },
    set: (newVal) => {
      if (val !== newVal) {
        // new values needs to be observe as well
        observe(newVal)
        console.log('set', key)
        val = newVal
        dep.notify()
      }
    }
  })
}

const isInter = (node) => node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)

/**
 * Compile
 */

// Compile, fetch dynamic content, find related deps and create watchers for it
// new Compile('#app', vm)
class Compile {
  constructor (el, vm) {
    // 1. get the template
    this.$el = document.querySelector(el)
    this.$vm = vm

    // 2. start compiling
    this.compile(this.$el)
  }

  compile (el) {
    // get all child nodes
    const childNodes = el.childNodes
    childNodes.forEach(node => {
      // Element
      if (node.nodeType === 1) {
        this.compileElement(node)
      }

      // Text && {{counter}}
      if (isInter(node)) {
        this.compileText(node)
      }

      // process children's children
      if (node.childNodes) {
        this.compile(node)
      }
    })
  }

  update (node, exp, dir) {
    // 1. initialize

    const fn = this[`${dir}Updater`]
    fn && fn(node, this.$vm[exp])

    // 2. update: create watcher
    new Watcher(this.$vm, exp, function (val) {
      fn && fn(node, val)
    })
  }

  // Real update
  textUpdater (node, val) {
    node.textContent = val
  }

  htmlUpdater (node, val) {
    node.innerHTML = val
  }

  compileText (node) {
    this.update(node, RegExp.$1, 'text')
    node.textContent = this.$vm[RegExp.$1]
  }

  compileElement (node) {
    // loop through all the attributes
    const nodeAttrs = node.attributes
    Array.from(nodeAttrs).forEach(attr => {
      // x-text="counter"
      const attrName = attr.name // x-text
      const exp = attr.value // counter
      if (attrName.startsWith('x-')) {
        const dir = attrName.substring(2)
        this[dir] && this[dir](node, exp)
      }
    })
  }

  // x-text
  text (node, exp) {
    this.update(node, exp, 'text')
  }

  // x-html
  html (node, exp) {
    this.update(node, exp, 'html')
  }
}

/**
 *  Watcher 1:1 co-respondence with Deps
 */
class Watcher {
  constructor (vm, key, update) {
    this.vm = vm
    this.key = key
    this.updateFn = update

    // Collect deps
    Dep.target = this
    this.vm[this.key]
    Dep.target = null
  }

  update () {
    console.log('water update')
    this.updateFn.call(this.vm, this.vm[this.key])
  }
}

/**
 * Dep Watcher 1:1 co-respondence with vm keys
 */
class Dep {
  constructor () {
    this.deps = []
  }

  addDep (dep) {
    this.deps.push(dep)
  }

  notify () {
    this.deps.forEach(dep => dep.update())
  }
}

/**
 * XVue
 */

function proxy (vm) {
  Object.keys(vm.$data).forEach((key) => {
    Object.defineProperty(vm, key, {
      get: () => vm.$data[key],
      set: (v) => {
        vm.$data[key] = v
      }
    })
  })
}

class XVue {
  constructor (options) {
    this.$options = options
    this.$data = options.data

    // 1. spy on this.$data
    // All reactive data should be a property of this.$data
    observe(this.$data)

    // 1.5 Proxy: put all `$data` into `this`
    // so that user can use: app.counter, not app.$data.counter
    //
    proxy(this)

    // 2. compile
    new Compile('#app', this)
  }
}
