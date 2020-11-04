// 1. Install $store

// 2. Store class:
// reactive state
// methods: commit(), dispatch()

let _Vue
class Store {
  constructor (options) {
    // Use Vue to create reactive data

    // Save mutations and actions
    this._mutations = options.mutations
    this._actions = options.actions
    /*
    {
      doubleCounter(state){
        ....
      }
    }
    */
    this._wrappedGetters = options.getters

    this.getters = {}
    const computed = {}
    const store = this
    Object.keys(this._wrappedGetters).forEach(key => {
      const fn = store._wrappedGetters[key]
      // convert it to no args
      computed[key] = function () {
        return fn(store.state)
      }
      Object.defineProperty(store.getters, key, {
        get: () => store._vm[key]
      })
    })
    // Simple way:
    /*
      this.state = new _Vue({
        // all these will be reactive
        data: options.state
      })
     */

    // Advanced: using getter and setters
    this._vm = new _Vue({
      // all these will be reactive
      data: {
        $$state: options.state
      },
      computed
    })

    // TODO:
    // Basic
    // $store.getters.doubleCounter
    // this.getters = options.getters
    // Object.defineProperty(this, 'getters', { get () {} })
    // Advanced: use Vue.compute

    this.commit = this.commit.bind(this)
    this.dispatch = this.dispatch.bind(this)
  }

  get state () {
    return this._vm._data.$$state
  }

  set state (state) {
    throw new Error('Please use replaceState to reset state.')
  }

  /** $store.commit('add', 1)
   * @param  {String} type action type, defined in options.mutations
   * @param  {any} payload
   */
  commit (type, payload) {
    const entry = this._mutations[type]

    if (!entry) {
      throw new Error('Unknown mutation')
    }

    entry(this.state, payload)
  }

  /** $store.dispatch({state, getters, dispatch})
   * @param  {} type
   * @param  {} payload
   */
  dispatch (type, payload) {
    const entry = this._actions[type]

    if (!entry) {
      throw new Error('Unknown action')
    }

    entry(this, payload)
  }
}

// Vue.use(vuex) will call install method
function install (Vue) {
  _Vue = Vue

  // 1. add $store to the Vue
  // Use mixin to delay the timing of execution
  Vue.mixin({
    beforeCreate () {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store
      }
    }
  })
}

export default { Store, install }
