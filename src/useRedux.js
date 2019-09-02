const { useState, useEffect } = require('react')
const { getValue } = require('@hacknlove/deepobject')

/**
 * hook que devuelve el state del store, se usa cómo helper de useRedux
 */
function useReduxFull (store) {
  const [value, set] = useState(store.getState())
  useEffect(() => {
    const unsuscribe = store.subscribe(() => {
      set(store.getState())
    })
    return () => {
      unsuscribe()
    }
  })
  return value
}

/**
 * hook para react que devuelve el valor de una key en el store de redux
 * @param {*} key
 */
function useRedux (store, key) {
  if (key === undefined) {
    return useReduxFull(store)
  }
  const [value, set] = useState(getValue(store.getState(), key))
  useEffect(() => {
    return store.subscribeKey(key, () => {
      set(getValue(store.getState(), key))
    })
  })
  return value
}

module.exports = useRedux
