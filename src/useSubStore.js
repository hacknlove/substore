const { useEffect } = require('react')
const store = require('../../reduxplus/src/store')

module.exports = function useSubStore (options) {
  const {
    key,
    hydrate,
    replace,
    clean,
    reducers
  } = options

  const sub = store.subStore(key)

  if (hydrate) {
    sub.hydrate(hydrate, replace)
  }

  if (reducers && reducers.length) {
    reducers.forEach(r => {
      sub.setReducer(r)
    })
  }

  useEffect(() => {
    return sub.cleanDebounced(500, clean)
  }, [])
  return sub
}
