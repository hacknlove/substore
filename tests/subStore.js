import test from 'ava'
import { substoreHasKeyReducer, subStore, subStoreCreateReducer, subStoreCheckExists, subStoreClean, subStoreDispatch, subStoreReducer } from '../src/subStore'

test('substoreHasKeyReducer devuelve state si action no tiene key', t => {
  const oldState = {}
  const newState = substoreHasKeyReducer(oldState, {})
  t.is(newState, oldState)
})

test('substoreHasKeyReducer devuelve undefined si action tiene key', t => {
  const oldState = {}
  const newState = substoreHasKeyReducer(oldState, {key: 'tred'})
  t.is(newState, undefined)
})

test('subStoreCreateReducer devuelve undefined si type no concuerda', t => {
  const oldState = {}
  const newState = substoreHasKeyReducer(oldState, {
    type: 'algo',
    key: 'tred'
  })
  t.is(newState, undefined)
})

test('subStoreCreateReducer inicia el substore en el state si la key concuerda y no está iniciado', t => {
  const oldState = {
    '@hacknlove/substore': {
    }
  }

  const newState = subStoreCreateReducer(oldState, {
    type: '@hacknlove/substore/foo',
    key: 'foo'
  })

  t.deepEqual(newState, {
    '@hacknlove/substore': {
      foo: {
        count: 1,
        reducers: []
      }
    }
  })
})

test('subStoreCreateReducer incrementa el contador si la key concuerda y está iniciado', t => {
  const oldState = {
    '@hacknlove/substore': {
      foo: {
        count: 14,
        reducers: ['algo']
      }
    }
  }

  const newState = subStoreCreateReducer(oldState, {
    type: '@hacknlove/substore/foo',
    key: 'foo'
  })

  t.deepEqual(newState, {
    '@hacknlove/substore': {
      foo: {
        count: 15,
        reducers: ['algo']
      }
    }
  })
})
