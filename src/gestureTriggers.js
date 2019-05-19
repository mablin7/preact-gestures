export default ({ touchMenuHoldTime = 600, touchDragDelay = 500 } = {}) => ({
  onClick: {
    onClick: (fireEvent, event) => fireEvent(event)
  },
  onDblclick: {
    onDblclick: (fireEvent, event) => fireEvent(event)
  },
  onMenu: {
    onMousedown (fireEvent, event) {
      if (event.button === 2) fireEvent(event)
    },
    onTouchstart (fireEvent, event) {
      const { target } = event
      let canFire = false
      const holdTimer = setTimeout(() => canFire = true, touchMenuHoldTime)
      const handleCancel = () => {
        target.removeEventListener('touchend', handleEnd)
        target.removeEventListener('touchcancel', handleCancel)
      }
      const handleEnd = () => {
        if (canFire) {
          fireEvent(event)
        } else {
          clearTimeout(holdTimer)
        }
        handleCancel()
      }
      target.addEventListener('touchend', handleEnd)
      target.addEventListener('touchcancel', handleCancel)
    }
  },
  onDrag: {
    onMousedown (fireEvent, startEvent) {
      if (startEvent.button !== 0) return
      const { target } = startEvent
      let isFirstMove = true
      const handleMove = (moveEvent) => {
        if (isFirstMove) {
          fireEvent(startEvent, 'start')
          isFirstMove = false
        }
        fireEvent(moveEvent, 'move')
      }
      const handleEnd = (endEvent) => {
        fireEvent(endEvent, 'end')
        target.removeEventListener('mousemove', handleMove)
        target.removeEventListener('mouseup', handleEnd)
      }
      target.addEventListener('mousemove', handleMove)
      target.addEventListener('mouseup', handleEnd)
    },
    onTouchstart (fireEvent, startEvent) {
      const { target } = startEvent
      const startingTouch = startEvent.changedTouches[0]
      let isDragging = false
      let isFirstMove = true
      const handleMove = (moveEvent) => {
        if (isFirstMove) {
          fireEvent(startEvent, 'start')
          isFirstMove = false
        }
        for (let i = 0; i < moveEvent.changedTouches.length; i++) {
          const touch = moveEvent.changedTouches[i]
          if (touch.identifier === startingTouch.identifier) {
            fireEvent(moveEvent, 'move')
          }
        }
      }
      const handleStart = () => {
        isDragging = true
        target.addEventListener('touchmove', handleMove)
      }
      const holdTimer = setTimeout(handleStart, touchDragDelay)
      const handleEnd = (endEvent) => {
        debugger
        if (isDragging) {
          fireEvent(endEvent, 'end')
          target.removeEventListener('touchmove', handleMove)
        } else {
          clearTimeout(holdTimer)
        }
        isDragging = false
        target.removeEventListener('touchend', handleEnd)
        target.removeEventListener('touchcancel', handleEnd)
      }
      target.addEventListener('touchend', handleEnd)
      target.addEventListener('touchcancel', handleEnd)
    }
  }
})
