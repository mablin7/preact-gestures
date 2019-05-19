/** @jsx h */
import { h } from 'preact'

import gestureTriggers from './gestureTriggers.js'
import { splitCamelCase, mergeWith, series, mapObj, setPath } from './utils.js'

const splitHandlerName = name => {
  let [on, gestureName, ...eventName] = splitCamelCase(name)
  eventName = eventName.length === 0 ? ['default'] : eventName 
  return [on + gestureName, eventName.join('')]
}

export function withGetures (Wrapped, config) {
  const handledEvents = []
  const configuredTriggers = gestureTriggers(config)
  
  const bindTriggerToCallbacks = (triggerFunc, callbacks) => {
    const fireEvent = (event, name = 'default') => {
      if (!handledEvents.includes(event)) {
        handledEvents.push(event)
        if (name in callbacks) callbacks[name](event)
      }
    }
    return triggerFunc.bind(null, fireEvent)
  }

  return function (props) {
    let passtroughProps = {}
    let gestureTriggers = {}
    let gestureCallbacks = {}
    Object.entries(props)
      .forEach(([ propName, prop ]) => {
        let [ gestureName, gestureEventName ] = splitHandlerName(propName)
        gestureEventName = gestureEventName.toLowerCase()

        if (gestureName in configuredTriggers) {
          let gestureCallback = prop
          setPath(gestureCallbacks, [gestureName, gestureEventName], gestureCallback)
        } else {
          passtroughProps[propName] = prop
        }
      })

    Object.entries(gestureCallbacks)
      .forEach(([ gestureName, callbacks ]) => {
        let currentTriggers = mapObj(
          configuredTriggers[gestureName],
          (name, triggerFunc) => bindTriggerToCallbacks(triggerFunc, callbacks)
        )

        gestureTriggers = mergeWith(series, gestureTriggers, currentTriggers)
      })

    return (
      <span {...gestureTriggers}>
        <Wrapped {...passtroughProps} /> 
      </span>
      )
    }
  }
  