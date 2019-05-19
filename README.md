Preact Gestures
==================

Preact compatible higher order components for gesture detection
```
npm i preact-gestures
```

Gesture detection made easy, even in preact
* Simple, and easy to use: `<CompWithGestures onDragStart={dragStarted}>`
* Lightweight: **~3kb** minified, **1.5kb** gzipped
* Multi platform: Handle gestures the same way across devices
* Built-in gesture detectors:
    * `onMenu` right-click or long tap
    * `onDrag` click&drag or tap, hold and drag
        * `Start`
        * `Move`
        * `End`
    * ... more in the works

Usage
-----
```js
import { h, render } from 'preact'
import { withGestures } from 'preact-gestures'

let MyComp = () => (
<div>I'm a regular component</div>
)
let MyCompWithGestures = withGestures(MyComp)

render(<MyComp onDragStart={() => console.log('Im being dragged!'')}/>, document.body)
```

API
---

##### `withGestures(Component, config)`
---
A higher-order component that add gesture detection to your component

##### Parameters
`Component` A Preact functional or class component, or a JSX element
`config` A configuration object for the built-in gesture detectors. Supported parameters:
```js
{
    touchMenuHoldTime = 600, // How many ms does the user has to hold before the onMenu event fires
    touchDragDelay = 500 // How many ms does the user has to hold before a drag starts
}
```
##### Returns
The passed in `Component` with the following additional props
```js
onClick = (event: MouseEvent) => void // Regular click event
onDblclick = (event: MouseEvent) => void // Regular double click event
onMenu = (event: MouseEvent | TouchEvent) => void // Right-click menu, or long tap
onDragStart = (event: MouseEvent | TouchEvent) => void // Fired when the element grabbed AND first moved. On touch devices there's a small delay before tha drag starts
onDragMove = (event: MouseEvent | TouchEvent) => void // Fired after onDragStart for every movement
onDragEnd = (event: MouseEvent | TouchEvent) => void // Fired when the element is dropped
```

Roadmap
-------
* `onSwipe` and `onZoom` gestures
* Pass in custom gesture detectors
* Custom gesture event objects for the callbacks, instead of the event that triggered the gesture
* Typescript definitions

License
-------
_MIT (c) Balint Magyar 2019_
