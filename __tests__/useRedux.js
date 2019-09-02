const { renderHook, act } = require('@testing-library/react-hooks')
const assert = require('assert')
const store = require('@hacknlove/reduxplus')
require('../src/index')

describe('useRedux key defined', () => {
  var clean
  const subStore = store.subStore('mykey2')

  afterEach(done => {
    clean()
    setTimeout(done, 500)
  })

  it('useRedux devuelve el valor correspondiente a la key', () => {
    act(() => subStore.hydrate({
      foo: 'bar'
    }, true))

    const { result, unmount } = renderHook(() => subStore.useRedux('foo'))
    clean = unmount

    assert(result.current === 'bar')
  })
  it('useRedux refresca el componente cuando cambia el valor de la key', async () => {
    act(() => subStore.hydrate({
      foo: {
        dfgh: true
      }
    }, true))

    const { result, unmount, waitForNextUpdate } = renderHook(() => subStore.useRedux('foo.dfgh'))
    clean = unmount

    assert(result.current)
    var wait = waitForNextUpdate()

    subStore.hydrate({
      foo: 'tdyu'
    }, true)
    await wait
    assert(result.current === undefined)

    act(() => subStore.hydrate({
      foo: {
        dfgh: false
      }
    }, true))
  })
  it('useRedux no refresca el componente cuando cambia el state, pero no el valor de la key', async () => {
    act(() => subStore.hydrate({
      foo: {
        dfgh: true
      }
    }, true))

    const { result, unmount, waitForNextUpdate } = renderHook(() => subStore.useRedux('foo.dfgh'))
    clean = unmount

    assert(result.current === true)
    const wait = waitForNextUpdate()

    var pass = false

    act(() => subStore.hydrate({
      kjhsdf: 'loiudfg'
    }))

    setTimeout(() => {
      pass = true
      act(() => subStore.hydrate({}, true))
    }, 100)

    await wait

    assert(pass, 'ha refrescado antes de tiempo')
  })
})

describe('useRedux key undefined', () => {
  var clean
  const subStore = store.subStore('mykey1')

  afterEach(done => {
    clean()
    setTimeout(done, 500)
  })

  it('useRedux devuelve el state completo', () => {
    act(() => subStore.hydrate({
      foo: 'bar'
    }, true))

    const { result, unmount } = renderHook(() => subStore.useRedux())
    clean = unmount

    assert.deepStrictEqual(result.current, {
      foo: 'bar'
    })
    unmount()
  })
  it('useRedux refresca el componente cuando cambia el state', async () => {
    subStore.hydrate({
      foo: 'bar'
    }, true)

    const { result, unmount, waitForNextUpdate } = renderHook(() => subStore.useRedux())
    clean = unmount

    assert.deepStrictEqual(result.current, {
      foo: 'bar'
    })
    const wait = waitForNextUpdate()
    act(() => subStore.hydrate({
      foo: 'lkjdfg'
    }))
    await wait
    assert.deepStrictEqual(result.current, {
      foo: 'lkjdfg'
    })

    act(() => subStore.hydrate({
      foo: 'tdyu'
    }, true))
    await wait
    assert.deepStrictEqual(result.current, {
      foo: 'tdyu'
    })
  })
  it('useRedux no refresca el componente cuando cambia no cambia el valor', async () => {
    act(() => subStore.hydrate({
      foo: {
        dfgh: true
      }
    }, true))

    const { result, unmount, waitForNextUpdate } = renderHook(() => subStore.useRedux())
    clean = unmount

    assert.deepStrictEqual(result.current, {
      foo: {
        dfgh: true
      }
    })
    const wait = waitForNextUpdate()

    var pass = false

    act(() => subStore.hydrate({
      foo: {
        dfgh: true
      }
    }))

    setTimeout(() => {
      pass = true
      act(() => subStore.hydrate({}, true))
    }, 100)

    await wait

    assert(pass, 'ha refrescado antes de tiempo')
  })
})
