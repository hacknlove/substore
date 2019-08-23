import test from 'ava'
import { substoreHasKeyReducer, subStore, subStoreCreateReducer, subStoreCheckExists, subStoreClean, subStoreDispatch, subStoreReducer, reducers } from '../src/subStore'

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

test('subStoreCheckExists devuelve state si no hay subAction', t => {
  const oldState = {}
  const newState = subStoreCheckExists(oldState, {})
  t.is(newState, oldState)
})

test('subStoreCheckExists devuelve state si subAction no tiene type', t => {
  const oldState = {}
  const newState = subStoreCheckExists(oldState, {
    subAction: {}
  })
  t.is(newState, oldState)
})

test('subStoreCheckExists devuelve state si no existe el subStore para la key', t => {
  const oldState = {
    '@hacknlove/substore': {

    }
  }
  const newState = subStoreCheckExists(oldState, {
    key: 'sdg',
    subAction: {
      type: 'dfkjhg'
    }
  })
  t.is(newState, oldState)
})

test('subStoreCheckExists devuelve undefined si existe el substore', t => {
  const oldState = {
    '@hacknlove/substore': {
      foo: {}
    }
  }
  const newState = subStoreCheckExists(oldState, {
    key: 'fo',
    subAction: {
      type: 'dfkjhg'
    }
  })
  t.is(newState, oldState)
})

test('subStoreClean devuelve undefined si el type no es de clean', t => {
  const oldState = {}
  const newState = subStoreClean(oldState, {
    type: 'sdf'
  })
  t.is(newState, undefined)
})

test('subStoreClean devuelve undefined si el type es de clean, pero la action no tiene clean true', t => {
  const oldState = {}
  const newState = subStoreClean(oldState, {
    type: '@hacknlove/substore/foo/clean',
    key: 'foo'
  })
  t.is(newState, undefined)
})

test('subStoreClean devuelve un state con el substore eliminado, si el count es 1', t => {
  const oldState = {
    '@hacknlove/substore': {
      foo: {
        count: 1,
        reducers: []
      }
    }
  }
  const newState = subStoreClean(oldState, {
    type: '@hacknlove/substore/foo/clean',
    key: 'foo',
    clean: true
  })
  t.deepEqual(newState, {
    '@hacknlove/substore': {
    }
  })
})

test('subStoreClean decrementa el count del substore count si es mayor que 1', t => {
  const oldState = {
    '@hacknlove/substore': {
      foo: {
        count: 16,
        reducers: []
      }
    }
  }
  const newState = subStoreClean(oldState, {
    type: '@hacknlove/substore/foo/clean',
    key: 'foo',
    clean: true
  })
  t.deepEqual(newState, {
    '@hacknlove/substore': {
      foo: {
        count: 15,
        reducers: []
      }
    }
  })
})

test('subStoreDispatch devuelve state si no concuerda el key', t => {
  const oldState = {}
  const newState = subStoreDispatch(oldState, {
    type: '@hacknlove/substore/foo/bar',
    key: 'fli',
    subAction: {
      type: 'bar'
    }
  })
  t.is(newState, oldState)
})

test('subStoreDispatch devuelve state si no concuerda el type', t => {
  const oldState = {}
  const newState = subStoreDispatch(oldState, {
    type: '@hacknlove/substore/foo/bar',
    key: 'foo',
    subAction: {
      type: 'blur'
    }
  })
  t.is(newState, oldState)
})

test.serial('subStoreDispatch devuelve el resultado de aplicar todos los subReducers del subStore al estado', t => {

  reducers.a = (state, action) => {
  }
  '2' (state, action) {
  },
  '3' (state, action) {
  },
  '4' (state, action) {
  }

  const oldState = {
    '@hacknlove/substore': {
      'kjghs': {
        count: 1,
        reducers: [
        ]
      }
    },
    'kjghs': 0
  }

  const newState = subStoreDispatch(oldState, {

  })
})