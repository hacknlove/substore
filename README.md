# substore
![coverage 100%](https://img.shields.io/badge/coverage-100%25-brightgreen)

Decouple your storage more and better.

## install
```
npm i @hacknlove/substore
```

## Api

All `key` can be `'deep.dotted.key'`.
see [@hacknlove/deepobject](https://github.com/hacknlove/deepObject)

### `subStore(key)`

Returns the substore at `key`.

If there is a substore at that `key`, it returns that substore. If not, it creates a new one.

The substore methods mimic the store methods.

```javascript
const store = require('@hacknlove/reduxplus')
require('@hacknlove/substore')

const MySubStore1 = store.subStore('someKey')
assert(MySubstore1.i === 1)

const MySubStore2 = store.subStore('someKey')
assert(MySubstore1.i === 2)
assert(MySubStore1 === MySubStore2)

const MySubStore3 = store.subStore('otherKey')
assert(MySubStore1 !== MySubStore3)
assert(MySubstore3.i === 1)
```

### `substore.getState()`
Returns the state of the substore

### `substore.setReducer(reducer)`
Set a reducer to that substore, to process the actions dispatched in the substore.

### `substore.dispatch(action)`
Dispatch an action in the substore, that will be processed by the reducers of the substore.

### `substore.useRedux()`
React hook that refresh when the state of the substore changes.

### `substore.useRedux(key)`
React hook that refresh when the substore's state's value at `key` changes.

### `substore.hydrate(state, replace = false)
It set the store's state.

If `replace === true`, it replaces the old state with the new one.
If `replace !== true`, it replaces the old state with the merge of the new one in the old one.

### `substore.subscribe(callback)`
Returns a unsubscribe function.

The callback is called each time the substore's state changes, until unsubscribe funcion is called.

### `substore.subscribeKey(key, callback)`
Returns a unsubscribe function.

The callback is called each time the substore's state's value at `key` changes, until unsubscribe funcion is called.

### `substore.clean()`
If this is the last substore at its `key`, it removes all subscriptions, all reducers, stop all useRedux hooks and cleans all substore's substores. After that every substore method will throw `new Error('subStore cleaned')`

### `substore.clean(true)`
If this is the last substore at its `key`, it all, including the state

### substore.subStore(key)
it returns a new substore at `${substore.key}.${key}` that will be cleaned when the parent substore is cleaned.

### `substore.setMiddleware` is undefined
You cannot set a middleware to a substore.

## redux DevTools

You will see the subStore actions as `ºkey/type`

```javascript
const substore = store.subStore('foo.bar')

substore.dispatch({
  type: 'buz',
  some: {
    more: 'things'
  }
})

/*
store.dispatch({
  type: 'ºfoo.bar/buz',
  key: 'foo.bar'
  subAction: {
    type: 'buz',
    some: {
      more: 'things'
    }
  }
})
*/
```



## asciinema
[![asciicast](https://asciinema.org/a/265652.svg)](https://asciinema.org/a/265652)
