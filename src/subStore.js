const store = require('@hacknlove/reduxplus')
const getValue = require('@hacknlove/reduxplus/src/getValue')
const setValue = require('@hacknlove/reduxplus/src/setValue')

const reducers = {
}

store.hydrate({
  '@hacknlove/substore': {
  }
})

function substoreHasKeyReducer (state, action) { // tested
  if (!action.key) {
    return state
  }
}

function subStoreCreateReducer (state, action) { // tested
  if (action.type === `@hacknlove/substore/${action.key}`) {
    if (state['@hacknlove/substore'][action.key]) {
      return {
        ...state,
        '@hacknlove/substore': {
          ...state['@hacknlove/substore'],k
          [action.key]: {
            count: state['@hacknlove/substore'][action.key].count + 1,
            reducers: state['@hacknlove/substore'][action.key].reducers
          }
        }
      }
    }

    return {
      ...state,
      '@hacknlove/substore': {
        ...state['@hacknlove/substore'],
        [action.key]: {
          count: 1,
          reducers: []
        }
      }
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

  if (!state['@hacknlove/substore'][action.key]) {
    return state
  }
}

function subStoreClean (state, action) { // tested
  if (action.type === `@hacknlove/substore/${action.key}/clean` && action.clean) {
    if (state['@hacknlove/substore'][action.key].count === 1) {
      const newSubstores = {
        ...state['@hacknlove/substore']
      }
      delete newSubstores[action.key]
      return {
        ...state,
        '@hacknlove/substore': newSubstores
      }
    }
    return {
      ...state,
      '@hacknlove/substore': {
        ...state['@hacknlove/substore'],
        [action.key]: {
          count: state['@hacknlove/substore'][action.key].count - 1,
          reducers: state['@hacknlove/substore'][action.key].reducers
        }
      }
    }
  }
}

function subStoreDispatch (state, action) {
  if (action.type !== `@hacknlove/substore/${action.key}/${action.subAction.type}`) {
    return state
  }

  return setValue(
    state,
    action.key,
    state['@hacknlove/substore'][action.key].subReducers.reduce(
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

function subStoreReducer (state, action) {
  return substoreHasKeyReducer(state, action) ||
    subStoreCreateReducer(state, action) ||
    subStoreCheckExists(state, action) ||
    subStoreClean(state, action) ||
    subStoreDispatch(state, action)
}

store.setReducer(subStoreReducer)

class SubStore {
  constructor (key, sub) {
    this.key = key
    this.subscriptions = []
    this.substores = []
  }

  getState () {
    return getValue(store.getState(), this.key)
  }

  dispatch (action) {
    store.dispatch({
      type: `@hacknlove/substore/${this.key}/${action.type}`,
      key: this.key,
      subAction: action
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
    store.hydrate(setValue({}, this.key, newState))
  }

  subscribe (callback) {
    const unsuscribe = store.subscribeKey(this.key, callback)
    this.subscriptions.push(unsuscribe)
    return unsuscribe
  }

  subscribeKey (key, callback) {
    const unsuscribe = store.subscribeKey(`${this.key}.${key}`, callback)
    this.subscriptions.push(unsuscribe)
    return unsuscribe
  }

  clean (data) {
    store.dispatch({
      type: `@hacknlove/substore/${this.key}/clean`,
      clean: true
    })
    this.subscriptions.forEach(unsuscribe => unsuscribe())
    this.substores.forEach(substore => substore.clean())
  }

  subStore (key) {
    return subStore(`${this.key}.key`)
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

exports.subStore = subStore

if (process.env.NODE_ENV === 'test') {
  exports.reducers = reducers
  exports.substoreHasKeyReducer = substoreHasKeyReducer
  exports.subStoreCreateReducer = subStoreCreateReducer
  exports.subStoreCheckExists = subStoreCheckExists
  exports.subStoreClean = subStoreClean
  exports.subStoreDispatch = subStoreDispatch
  exports.subStoreReducer = subStoreReducer
}
