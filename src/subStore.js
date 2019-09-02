const store = require('@hacknlove/reduxplus')
const { getValue, setValue, deleteValue } = require('@hacknlove/deepobject')
const isDifferent = require('isdifferent')
const useRedux = require('./useRedux')
const reducers = {}

const subStores = {}

function isSubstoreAction (state, action) { // tested
  if (action.key === undefined) {
    return state
  }
  if (action.type[0] !== 'º') {
    return state
  }
}

function subStoreSetReducer (state, action) { // tested
  if (!action.reducer) {
    return
  }
  if (action.type !== `º${action.key}/setReducer`) {
    return state
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

function subStoreClean (state, action) { // tested
  if (action.clean === undefined) {
    return
  }
  if (action.type !== `º${action.key}/clean`) {
    return state
  }
  var newState

  if (action.clean) {
    newState = deleteValue(state, action.key)
  } else {
    newState = state
  }

  var newSubstores = {
    ...newState.º
  }
  delete newSubstores[action.key]

  return {
    ...newState,
    º: newSubstores
  }
}

function subStoreCheckExists (state, action) { // tested
  if (!action.subAction) {
    return state
  }
  if (!state.º) {
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
        console.warn('reducer not found', action.subAction, reducer)
        return state
      },
      getValue(state, action.key)
    )
  )
}

function subStoreReducer (state, action) { // tested
  return isSubstoreAction(state, action) ||
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
      type: `º${this.key}/setReducer`,
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

  useRedux (key) { // tested
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
    if (--this.i) {
      return
    }
    this.subscriptions = {}
    var cleaned = () => {
      throw new Error('subStore cleaned')
    }
    ;['subscribe', 'subsccribeKey', 'subStore', 'getState', 'setReducer', 'dispatch', 'useRedux', 'hydrate', 'clean'].forEach(k => {
      this[k] = cleaned
    })
    this.__subscription()

    Object.values(this.substores).forEach(sub => sub.clean())
    delete subStores[this.key]

    store.dispatch({
      type: `º${this.key}/clean`,
      key: this.key,
      clean: data
    })
  }

  subStore (key) {
    var sk
    do {
      sk = Math.random().toString(36).substr(2) + (Date.now() % 1000).toString(36)
    } while (this.substores[sk])

    this.substores[sk] = new SubStore(`${this.key}.${key}`)
    return this.substores[sk]
  }
}

exports.subStore = function subStore (key, init) {
  if (subStores[key]) {
    subStores[key].i++
    return subStores[key]
  }
  subStores[key] = new SubStore(key)
  init && init()
  return subStores[key]
}
exports.reducers = reducers

if (process.env.NODE_ENV === 'test') {
  exports.isSubstoreAction = isSubstoreAction
  exports.subStoreSetReducer = subStoreSetReducer
  exports.subStoreCheckExists = subStoreCheckExists
  exports.subStoreClean = subStoreClean
  exports.subStoreDispatch = subStoreDispatch
  exports.subStoreReducer = subStoreReducer
}
