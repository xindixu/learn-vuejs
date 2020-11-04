
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
export function observe (obj) {
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
  Object.defineProperty(obj, key, {
    get: () => {
      console.log('get', key)
      return val
    },
    set: (newVal) => {
      if (val !== newVal) {
        // new values needs to be observe as well
        observe(newVal)
        console.log('set', key)
        val = newVal
        // update
      }
    }
  })
}

export default Observer
