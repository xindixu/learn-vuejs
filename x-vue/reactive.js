
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

// Vue.set/delete
// Dynamically add or remove a property
// However, js defineProperty doesn't have this

/** Observe adding a property to an object
 * @param  {Object} obj
 * @param  {String} key
 * @param  {Any} val
 */
function set (obj, key, val) {
  defineReactive(obj, key, val)
}

// set all properties of an object to be reactive
function observe (obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key])
  })
}

const obj = {
  foo: 'foo',
  boo: 'boo',
  baz: {
    a: 1,
    b: {
      yay: 'aya'
    }
  }
}

observe(obj)
// obj.foo
// obj.foo = 'fooooooo'
// obj.boo
// obj.boo = 'boooo'
// obj.baz.a
// obj.baz.b

// obj.baz = { a: 2 }
// obj.baz.a

set(obj, 'dong', 'dong')
// obj.dong = 'dong'
obj.dong

// Question: Observe array
// 7 mutation methods: push, pop, shift, unshift...
Array.prototype.push = function () {
  // call update
  // Array.prototype.push
}
