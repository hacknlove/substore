const assert = require('assert')
const store = require('@hacknlove/reduxplus')

process.env.NODE_ENV = 'production'
const { reducers } = require('../src/index')
process.env.NODE_ENV = 'test'

describe('basico integracion', () => {
  const substore = store.subStore('kjdhfgkjywer')
  beforeEach(() => {
    substore.hydrate({
      xcvb: 'tyu'
    }, true)
  })

  it('substore es un substore', () => {
    assert(substore)
    assert(substore.dispatch)
    assert(substore.setReducer)
    assert(substore.getState)
    assert(substore.useRedux)
    assert(substore.hydrate)
    assert(substore.subscribe)
    assert(substore.subscribeKey)
    assert(substore.clean)
    assert(substore.subStore)
  })

  describe('getState', () => {
    it('getState devuelve el estado del subStore', () => {
      assert.deepStrictEqual(substore.getState(), {
        xcvb: 'tyu'
      })
    })
  })

  describe('hydrate', () => {
    it('hidratar actualiza el state', () => {
      substore.hydrate({
        foo: 'bar'
      })
      assert.deepStrictEqual(substore.getState(), {
        xcvb: 'tyu',
        foo: 'bar'
      })
    })
    it('hidratar replace, sustituye el state', () => {
      substore.hydrate({
        hjg: 'tyu'
      }, true)
      assert.deepStrictEqual(substore.getState(), {
        hjg: 'tyu'
      })
    })
  })

  describe('setReducer and dispatch', () => {
    it('set reducer crea una entrada en el store para almacenar los reducers del substore', () => {
      substore.setReducer('cucucu')
      assert.deepStrictEqual(store.getState().º, {
        kjdhfgkjywer: ['cucucu']
      })
    })
    it('dispatch llama al reducer indicado con el state y action correcto', () => {
      substore.hydrate({
        kuhgdfg: '1-oiu345'
      }, true)
      reducers.cucucu = (state, action) => {
        assert.deepStrictEqual(state, {
          kuhgdfg: '1-oiu345'
        })
        assert.deepStrictEqual(action, {
          type: '2-jkinfgbdo',
          nlkb: '2-p9854'
        })
        return { kjlnfv: '3-lijhk' }
      }
      substore.dispatch({
        type: '2-jkinfgbdo',
        nlkb: '2-p9854'
      })
      assert.deepStrictEqual(substore.getState(), { kjlnfv: '3-lijhk' })
    })
  })

  describe('subscribe', () => {
    var deleteSubscription
    afterEach(() => {
      deleteSubscription && deleteSubscription()
    })

    it('llama al calback cuando el estado cambia', () => {
      expect.assertions(1)
      deleteSubscription = substore.subscribe((state) => {
        expect(state).toStrictEqual({ mrty6: '75843' })
      })
      substore.hydrate({ mrty6: '75843' }, true)
    })

    it('deja de llamar al callback si se elimina la suscripcion', () => {
      deleteSubscription = substore.subscribe((state) => {
        assert.fail()
      })
      deleteSubscription()
      substore.hydrate({ mrty6: '75843' }, true)
    })
  })

  describe('subscribeKey', () => {
    var deleteSubscription
    afterEach(() => {
      deleteSubscription && deleteSubscription()
    })

    it('no llama al calback si cambia el estado, pero no la el valor de la key', () => {
      deleteSubscription = substore.subscribeKey('nmer', (state) => {
        assert.fail()
      })
      substore.hydrate({ mrty6: '75843' }, true)
    })

    it('llama al calback con el valor de la clave cuando el estado cambia', () => {
      expect.assertions(1)
      deleteSubscription = substore.subscribeKey('mrty6', (state) => {
        expect(state).toBe('75843')
      })
      substore.hydrate({ mrty6: '75843' }, true)
    })

    it('deja de llamar al callback si se elimina la suscripcion', () => {
      deleteSubscription = substore.subscribeKey('mrty6', (state) => {
        assert.fail()
      })
      deleteSubscription()
      substore.hydrate({ mrty6: '75843' }, true)
    })
  })
  describe('clean', () => {
    it('si hay varias copias decrementa el i', () => {
      store.subStore('kjdhfgkjywer')
      assert(substore.i === 2)
      substore.clean()
      assert(substore.i === 1)
    })
    it('elimina las suscripciones y los substores', () => {
      expect.assertions(1)
      substore.subscribeKey('mrty6', (state) => {
        assert.fail()
      })
      substore.substores['test'] = {
        clean () {
          expect(true).toBe(true)
        }
      }
      substore.clean()
      store.hydrate({ kjdhfgkjywer: { mrty6: '75843' } })
      assert.throws(() => substore.clean(), new Error('subStore cleaned'))
    })
  })
})

describe('callback de inicialización', () => {
  it('cuando se crea un substore se llama al callback de init', () => {
    expect.assertions(1)
    store.subStore('kjhdfg', () => {
      expect(true).toBe(true)
    })
  })
  it('las siguientes veces no se llama', () => {
    store.subStore('kjhdfg', () => {
      assert.fail()
    })
  })
})
