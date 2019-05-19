/** @jsx h */
import { h } from 'preact'
import { render, cleanup, fireEvent } from 'preact-testing-library'

import { withGetures } from '../'

let TestComp, ComponentWithGestures

beforeEach(() => {
  TestComp = ({ testProp = 'hello' }) => <div>{testProp}</div>
  ComponentWithGestures = withGetures(TestComp)
})
afterEach(cleanup)

const getWrap = (props) => render(<ComponentWithGestures {...props}/>)
const sleep = (time) => new Promise((res) => setTimeout(res, time))
const mockTouchEvent = () => ({
  changedTouches: [
    { identifier: 1 }
  ]
})


describe('withGesture HOC', () => {
  test('should render', () => {
    const wrapper = getWrap()
    const innerComp = wrapper.container.firstChild
    expect(innerComp).not.toBeFalsy()
  })

  test('should pass trough props', () => {
    const { queryByText } = getWrap({ testProp: 'hello' })
    const innerComp = queryByText('hello')
    expect(innerComp).not.toBeFalsy()
  })
})

describe('Gestures', () => {
  const getComp = (props) => getWrap({ ...props, testProp: 'Test' }).getByText('Test')

  describe('onClick', () => {
    test('should fire on click', () => {
      const cb = jest.fn()
      const el = getComp({ onClick: cb })
      fireEvent.click(el)
      expect(cb.mock.calls.length).toBe(1)
    })
  })

  describe('onDblclick', () => {
    test('should fire on double click', () => {
      const cb = jest.fn()
      const el = getComp({ onDblclick: cb })
      fireEvent.dblClick(el)
      expect(cb.mock.calls.length).toBe(1)
    })
  })

  describe('onMenu', () => {
    test('should fire on right click', () => {
      const cb = jest.fn()
      const el = getComp({ onMenu: cb })
      fireEvent.mouseDown(el, { button: 2 })
      expect(cb.mock.calls.length).toBe(1)
    })

    test('should fire on holding for >600ms and releasing', async () => {
      const cb = jest.fn()
      const el = getComp({ onMenu: cb })
      fireEvent.touchStart(el)
      await sleep(601)
      fireEvent.touchEnd(el)
      expect(cb.mock.calls.length).toBe(1)
    })

    test('should not fire on short tap (<600ms)', async () => {
      const cb = jest.fn()
      const el = getComp({ onMenu: cb })
      fireEvent.touchStart(el)
      await sleep(100)
      fireEvent.touchEnd(el)
      expect(cb.mock.calls.length).toBe(0)
    })

    test('should not fire on just holding (not releasing)', async () => {
      const cb = jest.fn()
      const el = getComp({ onMenu: cb })
      fireEvent.touchStart(el)
      await sleep(601)
      expect(cb.mock.calls.length).toBe(0)
    })

    test('should not fire on cancellation', async () => {
      const cb = jest.fn()
      const el = getComp({ onMenu: cb })
      fireEvent.touchStart(el)
      await sleep(601)
      fireEvent.touchCancel(el)
      expect(cb.mock.calls.length).toBe(0)
    })
  })

  describe('onDrag', () => {
    describe('start', () => {
      test('should fire once after click AND move', () => {
        const cb = jest.fn()
        const el = getComp({ onDragStart: cb })
        fireEvent.mouseDown(el)
        fireEvent.mouseMove(el)
        expect(cb.mock.calls.length).toBe(1)
      })

      test('should only fire when left button is pressed', () => {
        const cb = jest.fn()
        const el = getComp({ onDragStart: cb })
        
        const rClick = { button: 2 }
        fireEvent.mouseDown(el, rClick)
        fireEvent.mouseMove(el)

        const mClick = { button: 3 }
        fireEvent.mouseDown(el, mClick)
        fireEvent.mouseMove(el)

        expect(cb.mock.calls.length).toBe(0)
      })

      test('should fire after long touch AND move', async () => {
        const cb = jest.fn()
        const el = getComp({ onDragStart: cb })
        fireEvent.touchStart(el)
        await sleep(501)
        fireEvent.touchMove(el)
        expect(cb.mock.calls.length).toBe(1)
      })

      test('should not fire immediately after move', async () => {
        const cb = jest.fn()
        const el = getComp({ onDragStart: cb })
        fireEvent.touchStart(el)
        await sleep(100)
        fireEvent.touchMove(el)
        expect(cb.mock.calls.length).toBe(0)
      })

      test('should not collide with onMenu', async () => {
        const cb = jest.fn()
        const el = getComp({ onDragStart: cb, onMenu: cb })
        fireEvent.touchStart(el)
        await sleep(601)
        fireEvent.touchMove(el)
        fireEvent.touchEnd(el)
        expect(cb.mock.calls.length).toBe(1)
      })
    })

    describe('move', () => {
      test('should fire after for every move event while dragging', async () => {
        const cb = jest.fn()
        const el = getComp({ onDragMove: cb })
        const touchEvent = mockTouchEvent()
        fireEvent.touchStart(el, touchEvent)
        await sleep(501)

        const moves = 10
        for (let i = 0; i < moves; i++) {
          fireEvent.touchMove(el, touchEvent)
        }
        fireEvent.touchEnd(el)
        expect(cb.mock.calls.length).toBe(moves)
      })

      test('should only ever run after a start event', async () => {
        const cbStart = jest.fn()
        const cbMove = jest.fn()
        const el = getComp({ onDragStart: cbStart, onDragMove: cbMove })
        const touchEvent = mockTouchEvent()
        fireEvent.touchStart(el, touchEvent)

        await sleep(601)
        fireEvent.touchMove(el, touchEvent)

        const startInvOrder = cbStart.mock.invocationCallOrder[0]
        const moveInvOrder = cbMove.mock.invocationCallOrder[0]
        expect(startInvOrder)
        .toBeLessThan(moveInvOrder)
      })
    })

    describe('end', () => {
      test('should fire for when drag ends', async () => {
        const cb = jest.fn()
        const el = getComp({ onDragEnd: cb })
        fireEvent.touchStart(el)
        await sleep(501)
        fireEvent.touchMove(el)
        fireEvent.touchEnd(el)

        expect(cb.mock.calls.length).toBe(1)
      })

      test('should fire for when drag is cancelled', async () => {
        const cb = jest.fn()
        const el = getComp({ onDragEnd: cb })
        fireEvent.touchStart(el)
        await sleep(501)
        fireEvent.touchMove(el)
        fireEvent.touchCancel(el)

        expect(cb.mock.calls.length).toBe(1)
      })
    })
  })
})
