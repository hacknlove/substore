const store = require('@hacknlove/reduxplus')
const getValue = require('@hacknlove/reduxplus/getValue')
const setValue = require('@hacknlove/reduxplus/setValue')

const reducers = {}

store.hydrate({
  '@hacknlove/substore': {

  }
})

store.setReducer()

store.setReducer((state, action) => {
  if (!action.key) {
    return state
  }

  if (action.type === `@hacknlove/substore/${action.key}`) {
    return {
      ...state,
      '@hacknlove/substore': {
        ...state['@hacknlove/substore'],
        [action.key]: {
          subReducers: [],
          subSubscriptions: []
        }
      }
    }
  }

  if (!action.action) {
    return state
  }
  if (!action.action.type) {
    return state
  }
  if (action.type !== `@hacknlove/substore/${action.key}/${action.action.type}`) {
    return state
  }
  if (action.clean) {
    const newSubstores = {
      ...state['@hacknlove/substore']
    }
    delete newSubstores[action.key]
    return {
      ...state,
      '@hacknlove/substore': newSubstores
    }
  }
  if (!state['@hacknlove/substore'][action.key]) {
    return state
  }

  return setValue(
    state,
    action.key,
    state['@hacknlove/substore'][action.key].subReducers.reduce(
      (state, reducer) => {
        if (typeof reducers[reducer] === 'function') {
          return reducers[reducer](state, action.action)
        }
        if (typeof reducer === 'function') {
          return reducer(state, action.action)
        }
        console.error('reducer not found', action, reducer)
        return state
      },
      getValue(state, action.key)
    )
  )
})

class SubStore {
  constructor (key, sub) {
    this.key = key
  }

  getState () {
    return getValue(store.getState(), this.key)
  }

  dispatch (action) {
    store.dispatch({
      type: `@hacknlove/substore/${this.key}/${action.type}`,
      key: this.key,
      action
    })
  }

  useRedux (key) {
    if (key === undefined) {
      return store.useRedux(this.key)
    }
    return store.useRedux(`${this.key}.${key}`)
  }

  hydrate (newState, replace = false) {
    if (!replace) {
      newState = {
        ...this.getState(),
        ...newState
      }
    }
    store.hydrate(setValue(store.getState(), this.key, newState))
  }

  subscribe (callback) {
    const unsuscribe = store.subscribeKey(`${this.key}`, callback)
    this.subscriptions.push(unsuscribe)
    return unsuscribe
  }

  subscribeKey (key, callback) {
    const unsuscribe = store.subscribeKey(`${this.key}.${key}`, callback)
    this.subscriptions.push(unsuscribe)
    return unsuscribe
  }
}

class SubStoreFactory {
  constructor (key) {
    this.key = key
    this.subscriptions = []
    this.reducers = []
  }

  new (key) {
    return new MountedSubStore(key, this)
  }

  setReducer (reducer) {
    this.reducers.push(reducer)
  }

  subStore () {
    return new SubStoreFactory()
  }

  useSubStore (key, data) {
    this.isNotForgotten()
    return store.useSubStore(`${key}.${this.key}`, data)
  }

  cleanDebounced (timeout = 1000, data = false) {
    if (scope[this.key].clean) {
      clearTimeout(scope[this.key].clean)
    }
    scope[this.key].clean = setTimeout(() => {
      this.clean(data)
    }, timeout)
  }

  clean (data) {
    this.isNotForgotten()
    if (data) {
      store.dispatch({
        type: `__/${this.key}/clean`,
        clean: true,
        action: {
          type: 'clean'
        }
      })
    }
    scope[this.key].subSubscriptions.forEach(f => f())
    delete scope[this.key]
    delete store.subs[this.key]
  }
}

function subStore (key) {
  store.dispatch({
    type: `@hacknlove/substore/${key}`,
    action: {
      key
    }
  })
  return new SubStore(key)
}

module.exports = subStore
