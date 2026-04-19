```txt
# Audio UI SVG Component System — Normalized Control + Style Model

## 1. Primary Control Categories

### ParameterControl
Purpose: holds a parameter value for plugin/audio control.

Subtypes:
- continuous
- discrete
- boolean

Data:
- value
- valueType = continuous | discrete | boolean
- min
- max
- defaultValue
- step
- options[]
- unit

Scale:
- scaleType = linear | log | exponential | bipolar | equalPower | discrete
- centerValue
- curveAmount
- snap

Behavior:
- draggable
- clickable
- wheelEnabled
- fineAdjust
- resetOnDoubleClick
- orientation
- wrap
- toggleMode
- momentary

State:
- active
- pressed
- selected
- disabled
- readonly
- focused
- hovered

Display:
- showLabel
- showValue
- showTicks
- showArc
- showCenterDetent

Style:
- variant
- theme
- shape
- size
- fillColor
- strokeColor
- accentColor
- textColor
- backgroundColor
- activeColor
- inactiveColor

MIDI:
- midiCc
- midiChannel
- pickupMode

Audio:
- parameterId
- parameterType
- bipolar
- tempoSync
- syncDivision

Examples:
- knob
- slider
- fader
- selector
- toggle
- switch

---

### EventControl
Purpose: emits note/trigger events, does not hold normal ranged parameter state.

Data:
- note
- velocity
- channel
- gate
- aftertouch

Behavior:
- momentary
- velocitySensitive
- repeat
- holdToRepeat

State:
- pressed
- active
- disabled

Display:
- showLabel
- showValue

Style:
- variant
- theme
- shape
- size
- fillColor
- accentColor
- textColor
- highlightOnPress

MIDI:
- midiType = note
- midiChannel

Examples:
- piano key
- drum pad
- trigger button
- tap tempo trigger

---

### CommandControl
Purpose: executes command/action.

Data:
- action

Behavior:
- clickable
- momentary
- toggleMode

State:
- active
- pressed
- disabled
- armed

Display:
- showLabel
- blink

Style:
- variant
- theme
- shape
- size
- fillColor
- accentColor
- activeColor
- warningColor

MIDI:
- optional mapping

Examples:
- play
- stop
- record
- loop
- reset

---

### DisplayControl
Purpose: read-only monitoring/feedback.

Data:
- value
- min
- max
- peak
- clip
- text
- status

Scale:
- scaleType
- orientation

Behavior:
- none

State:
- active
- warning
- clip

Display:
- showLabel
- showValue
- showPeak
- showClip
- showScale

Style:
- variant
- theme
- shape
- size
- fillColor
- clipColor
- textColor
- backgroundColor

MIDI:
- none

Examples:
- LED indicator
- level meter
- peak meter
- waveform display
- spectrum display
- numeric readout

---

### CompositeControl
Purpose: combines primitive controls into one composed UI feature.

Data:
- title
- selected
- active
- collapsed
- childControls[]
- value
- stepValue
- gate
- velocity
- curve

Behavior:
- clickable
- draggable
- selectable
- editable

Style:
- variant
- theme
- gridColor
- highlightColor
- panelColor

MIDI:
- indirect via child parameter/event mapping

Examples:
- envelope editor
- modulation matrix slot
- step sequencer lane
- macro panel
- channel strip

## 2. Shared Style System

### Global Design Tokens

Colors:
- --color-bg
- --color-fg
- --color-accent
- --color-warning
- --color-clip
- --color-active
- --color-inactive
- --color-led-active
- --color-led-inactive

Sizes:
- --size-xs
- --size-sm
- --size-md
- --size-lg
- --size-xl

Radius:
- --radius-none
- --radius-sm
- --radius-md
- --radius-lg
- --radius-full

Typography:
- --font-ui
- --font-mono
- --font-size-xs
- --font-size-sm
- --font-size-md
- --font-size-lg

Effects:
- --shadow-soft
- --shadow-hard
- --glow-accent
- --glow-warning
- --glow-led

Spacing:
- --space-xs
- --space-sm
- --space-md
- --space-lg

Stroke:
- --stroke-thin
- --stroke-normal
- --stroke-bold

### Variant Set
Use variants instead of separate components.

- variant = flat | hardware | neon | minimal | retro | rack
- theme = dark | light | studio | eurorack
- shape = round | square | pill | key | pad | linear | led

## 3. Styling Rule

Do not create:
- RedLed
- GreenLed
- SquareLed
- VintageLed

Create:
- LedIndicator

Configure with:
- active
- intensity
- variant
- theme
- shape
- fillColor
- accentColor
- glow

Same rule for:
- knob
- fader
- button
- selector
- meter

## 4. Final System Summary

Primitive categories:
- ParameterControl
- EventControl
- CommandControl
- DisplayControl
- CompositeControl

Shared property layers:
- Data
- Scale
- Behavior
- State
- Display
- Style
- MIDI
- Audio semantics

Result:
- one reusable control model
- one reusable style/token model
- no duplicated component families
- explicit non-linear audio behavior
- explicit MIDI mapping
```
