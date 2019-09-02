const store = require('@hacknlove/reduxplus')
const { getValue, setValue, deleteValue } = require('@hacknlove/deepobject')
const isDifferent = require('isdifferent')
const useRedux = require('./useRedux')
const reducers = {}

const subStores = {}

function substoreHasKeyReducer (state, action) { // tested
  if (!action.key) {
    return state
  }
}

function subStoreSetReducer (state, action) { // tested
  if (action.type !== `º${action.key}`) {
    return
  }

  if (!state.º) {
    return {
      ...state,
      º: {
        [action.key]: [action.reducer]
      }
    }
  }
  if (!state.º[action.key]) {
    return {
      ...state,
      º: {
        ...state.º,
        [action.key]: [action.reducer]
      }
    }
  }
  if (state.º[action.key].includes(action.reducer)) {
    return state
  }
  return {
    ...state,
    º: {
      [action.key]: [...state.º[action.key], action.reducer]
    }
  }
}

function subStoreMove (state, action) {
  if (!action.toKey) {
    return
  }

  if (action.type !== `º${action.key}/move`) {
    return
  }

  var newState = setValue(
    state,
    action.toKey,
    getValue(state, action.key)
  )
  newState = deleteValue(
    newState,
    action.key
  )
  newState.º[action.toKey] = newState.º[action.key]
  delete newState.º[action.key]

  return newState
}

function subStoreClean (state, action) { // tested
  if (action.type === `º${action.key}/clean` && action.clean) {
    const newSubstores = {
      ...state.º
    }
    delete newSubstores[action.key]
    return {
      ...state,
      º: newSubstores
    }
  }
}

function subStoreCheckExists (state, action) { // tested
  if (!action.subAction) {
    return state
  }
  if (!action.subAction.type) {
    return state
  }

  if (!state.º[action.key]) {
    return state
  }
  if (state.º[action.key].length === 0) {
    return state
  }
}

function subStoreDispatch (state, action) { // tested
  if (action.type !== `º${action.key}/${action.subAction.type}`) {
    return state
  }

  return setValue(
    state,
    action.key,
    state.º[action.key].reduce(
      (state, reducer) => {
        if (typeof reducers[reducer] === 'function') {
          return reducers[reducer](state, action.subAction)
        }
        if (typeof reducer === 'function') {
          return reducer(state, action.subAction)
        }
        console.error('reducer not found', action, reducer)
        return state
      },
      getValue(state, action.key)
    )
  )
}

function subStoreReducer (state, action) { // tested
  return substoreHasKeyReducer(state, action) ||
    subStoreSetReducer(state, action) ||
    subStoreCheckExists(state, action) ||
    subStoreClean(state, action) ||
    subStoreDispatch(state, action)
}

store.setReducer(subStoreReducer)

class SubStore {
  constructor (key) {
    this.key = key
    this.subscriptions = {}
    this.substores = {}
    this.i = 1

    this.__subscription = store.subscribeKey(this.key, state => {
      Object.values(this.subscriptions).forEach(cb => cb(state))
    })
  }

  setReducer (reducer) { // tested
    store.dispatch({
      type: `º${this.key}`,
      key: this.key,
      reducer
    })
  }

  getState () { // tested
    return getValue(store.getState(), this.key)
  }

  dispatch (action) { // tested
    store.dispatch({
      type: `º${this.key}/${action.type}`,
      key: this.key,
      subAction: action
    })
  }

  useRedux (key) { // not tested
    if (key === undefined) {
      return useRedux(this)
    }
    return useRedux(this, key)
  }

  hydrate (newState, replace = false) { // tested
    if (!replace) {
      newState = {
        ...this.getState(),
        ...newState
      }
    }
    store.hydrate(setValue({}, this.key, newState))
  }

  subscribe (callback) { // tested
    var sk
    do {
      sk = Math.random().toString(36).substr(2) + (Date.now() % 1000).toString(36)
    } while (this.subscriptions[sk])
    this.subscriptions[sk] = callback
    return () => {
      delete this.subscriptions[sk]
    }
  }

  subscribeKey (key, callback) { // tested
    var value = getValue(this.getState(), key)

    return this.subscribe(() => {
      const newValue = getValue(this.getState(), key)
      if (isDifferent(value, newValue)) {
        value = newValue
        callback(newValue)
      }
    })
  }

  clean (data) {
    this.subscriptions = {}
    var cleaned = () => {
      throw new Error('subStore cleaned')
    }
    ;['subscribe', 'subsccribeKey', 'subStore', 'getState', 'setReducer', 'dispatch', 'useRedux', 'hydrate'].forEach(k => {
      this[k] = cleaned
    })
    this.__subscription()

    Object.values(this.substores).forEach(sub => sub.clean())
    delete subStores[this.key]

    store.dispatch({
      type: `º${this.key}/clean`,
      clean: true
    })
  }

  subStore (key) {
    if (this.substores[key]) {
      this.substores.i++
      return this.substores[key]
    }

    this.substores[key] = new SubStore(`${this.key}.${key}`)
    return this.substores[key]
  }
}

exports.subStore = function subStore (key, init) {
  if (subStores[key]) {
    subStores[key].__i++
    return subStores[key]
  }
  subStores[key] = new SubStore(key)
  init && init()
  return subStores[key]
}

exports.moveSubstore = function (fromKey, toKey) {
  if (!subStores[fromKey]) {
    throw new Error('subStore not found')
  }
  if (subStores[toKey]) {
    throw new Error('destination exists')
  }
  if (!toKey) {
    throw new Error('Bad destination')
  }
  store.dispatch({
    type: `º${fromKey}/move`,
    key: fromKey,
    move: toKey
  })
}

if (process.env.NODE_ENV === 'test') {
  exports.reducers = reducers
  exports.substoreHasKeyReducer = substoreHasKeyReducer
  exports.subStoreSetReducer = subStoreSetReducer
  exports.subStoreCheckExists = subStoreCheckExists
  exports.subStoreClean = subStoreClean
  exports.subStoreDispatch = subStoreDispatch
  exports.subStoreReducer = subStoreReducer
}
