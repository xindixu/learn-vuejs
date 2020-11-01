// Since this is a plugin, we don't want to import Vue directly.
// If we do so, we'll end up packing Vue with the plugin.
let _Vue

class XVueRouter {
  constructor (options) {
    this.$options = options

    // Save the current url
    // WRONG:
    // this.current = window.location.hash.slice(1) || '/'
    // CORRECT:
    // `current` needs to be reactive so that `router-view` depends on `current`
    // Thus, once `current` changes, `router-view` will call `render` again
    const initial = window.location.hash.slice(1) || '/'
    _Vue.util.defineReactive(this, 'current', initial)

    // spy on url changes
    window.addEventListener('hashchange', this.onHashChange.bind(this))
    window.addEventListener('load', this.onHashChange.bind(this))
  }

  onHashChange () {
    this.current = window.location.hash.slice(1)
    console.log(this.current)
  }
}

// Vue.use(router) will call install method
XVueRouter.install = function (Vue) {
  // Save Vue for later use
  _Vue = Vue

  // 1. add $router to the Vue
  Vue.mixin({
    beforeCreate () {
      // get router instance
      if (this.$options.router) {
        // only root Vue instance has $router
        Vue.prototype.$router = this.$options.router
      }
    }
  })

  // 2. register two components
  // <router-link to="/xxx">...</router-link>
  Vue.component('router-link', {
    props: {
      to: {
        type: String,
        required: true
      }
    },

    // can't use `template` here since this file runs in webpack and won't be transpile
    render (h) {
      // <a href="/#/xxx">...</a>
      // - Using JSX
      // return <a href={`#${this.to}`}>{this.$slots.default}</a>

      // - Using h()
      /**
       * @param  {String} type HTML element type
       * @param  {Object} attrs attributes
       * @param  {Element} child
       */
      return h('a', { attrs: { href: `#${this.to}` } }, this.$slots.default)
    }
  })

  Vue.component('router-view', {
    render (h) {
      let component = null
      const route = this.$router.$options.routes.find(route => route.path === this.$router.current)

      console.log(this.$router)
      if (route) {
        component = route.component
      }
      // Get `hash` from current url
      // Get the corresponding Component
      return h(component)
    }
  })
}

export default XVueRouter
