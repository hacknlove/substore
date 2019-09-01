const assert = require('assert')
const {
  substoreHasKeyReducer,
  subStoreSetReducer,
  subStoreCheckExists,
  subStoreClean,
  subStoreDispatch,
  reducers
} = require('../src/subStore')

describe('substoreHasKeyReducer', () => {
  it('devuelve state si action no tiene key', () => {
    const oldState = {}
    const newState = substoreHasKeyReducer(oldState, {})
    assert.strictEqual(newState, oldState)
  })

  it('devuelve undefined si action tiene key', () => {
    const oldState = {}
    const newState = substoreHasKeyReducer(oldState, { key: 'tred' })
    assert.strictEqual(newState, undefined)
  })
})

describe('subStoreSetReducer', () => {
  it('devuelve undefined si type no concuerda', () => {
    const oldState = {}
    const newState = substoreHasKeyReducer(oldState, {
      type: 'algo',
      key: 'tred'
    })
    assert.strictEqual(newState, undefined)
  })

  it('inicia el substore en el state si la key concuerda y no está iniciado', () => {
    const oldState = {
      º: {
      }
    }

    const newState = subStoreSetReducer(oldState, {
      type: 'ºfoo',
      key: 'foo',
      reducer: '234'
    })

    assert.deepStrictEqual(newState, {
      º: {
        foo: ['234']
      }
    })
  })

  it('si el reducer existe no lo incluye', () => {
    const oldState = {
      º: {
        foo: ['algo']
      }
    }

    const newState = subStoreSetReducer(oldState, {
      type: 'ºfoo',
      key: 'foo',
      reducer: 'algo'
    })

    assert.deepStrictEqual(newState, {
      º: {
        foo: ['algo']
      }
    })
  })
})

describe('subStoreCheckExists', () => {
  it('devuelve state si no hay subAction', () => {
    const oldState = {}
    const newState = subStoreCheckExists(oldState, {})
    assert.strictEqual(newState, oldState)
  })

  it('devuelve state si subAction no tiene type', () => {
    const oldState = {}
    const newState = subStoreCheckExists(oldState, {
      subAction: {}
    })
    assert.strictEqual(newState, oldState)
  })

  it('subStoreCheckExists devuelve state si no existe el subStore para la key', () => {
    const oldState = {
      º: {

      }
    }
    const newState = subStoreCheckExists(oldState, {
      key: 'sdg',
      subAction: {
        type: 'dfkjhg'
      }
    })
    assert.strictEqual(newState, oldState)
  })

  it('subStoreCheckExists devuelve undefined si existe el substore', () => {
    const oldState = {
      º: {
        foo: {}
      }
    }
    const newState = subStoreCheckExists(oldState, {
      key: 'fo',
      subAction: {
        type: 'dfkjhg'
      }
    })
    assert.strictEqual(newState, oldState)
  })
})

describe('subStoreClean', () => {
  it('subStoreClean devuelve undefined si el type no es de clean', () => {
    const oldState = {}
    const newState = subStoreClean(oldState, {
      type: 'sdf'
    })
    assert.strictEqual(newState, undefined)
  })

  it('subStoreClean devuelve undefined si el type es de clean, pero la action no tiene clean true', () => {
    const oldState = {}
    const newState = subStoreClean(oldState, {
      type: 'º/foo/clean',
      key: 'foo'
    })
    assert.strictEqual(newState, undefined)
  })

  it('subStoreClean devuelve un state con el substore eliminado', () => {
    const oldState = {
      º: {
        foo: []
      }
    }
    const newState = subStoreClean(oldState, {
      type: 'ºfoo/clean',
      key: 'foo',
      clean: true
    })
    assert.deepStrictEqual(newState, {
      º: {
      }
    })
  })
})

describe('subStoreDispatch', () => {
  it('subStoreDispatch devuelve state si no concuerda el key', () => {
    const oldState = {}
    const newState = subStoreDispatch(oldState, {
      type: 'ºfoo/bar',
      key: 'fli',
      subAction: {
        type: 'bar'
      }
    })
    assert.strictEqual(newState, oldState)
  })
  it('subStoreDispatch devuelve state si no concuerda el type', () => {
    const oldState = {}
    const newState = subStoreDispatch(oldState, {
      type: 'ºfoo/bar',
      key: 'foo',
      subAction: {
        type: 'blur'
      }
    })
    assert.strictEqual(newState, oldState)
  })

  it('subStoreDispatch, llama a los reducers indicados, uno a uno, en el orden en que han sido asignados', () => {
    reducers.fail = () => {
      assert.fail('no debería haber llamado a este reducer')
    }
    reducers.a = (state, action) => {
      assert.strictEqual(state, 'pre')
      assert.deepStrictEqual(action, { type: 'ert', foo: 'bar' })
      return 'a'
    }
    reducers.b = (state, action) => {
      assert.strictEqual(state, 'a')
      assert.deepStrictEqual(action, { type: 'ert', foo: 'bar' })
      return 'b'
    }
    reducers.c = (state, action) => {
      assert.strictEqual(state, 'b')
      assert.deepStrictEqual(action, { type: 'ert', foo: 'bar' })
      return 'c'
    }
    reducers.d = (state, action) => {
      assert.strictEqual(state, 'c')
      assert.deepStrictEqual(action, { type: 'ert', foo: 'bar' })
      return 'd'
    }

    const oldState = {
      º: {
        kjghs: ['a', 'b', 'c', 'd']
      },
      kjghs: 'pre'
    }

    const newState = subStoreDispatch(oldState, {
      type: 'ºkjghs/ert',
      key: 'kjghs',
      subAction: {
        type: 'ert',
        foo: 'bar'
      }
    })

    assert.deepStrictEqual(newState, {
      º: {
        kjghs: ['a', 'b', 'c', 'd']
      },
      kjghs: 'd'
    })
  })
})
