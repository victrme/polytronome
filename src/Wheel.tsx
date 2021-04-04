import { useGesture } from 'react-use-gesture'
import { useState, useRef, useEffect, useCallback } from 'react'
import scrollPrevent from './ScrollPrevent'

// Wheels work by getting the index of an element with wheel height divided by children height
// Up movement uses translateY(-px), incrementing is negative, so maths are weird

const fillArray = (start: number, end: number) => {
	const arr: number[] = []
	for (let i = start; i <= end; i++) arr.push(i)
	return arr
}

// Init all wheels text before JSX Element
const allLists = {
	beats: fillArray(2, 16),
	octave: fillArray(-1, 6),
	tempo: fillArray(30, 300),
	frequency: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
}

function Wheel({ index, what, metronome, update }): JSX.Element {
	const is = (cat: string) => what === cat

	const height = is('tempo') ? 80 : 40
	const list = allLists[what]
	const maxMovement = -height * list.length + height
	const currentWhat = is('tempo') ? metronome.tempo : metronome.layers[index][what]
	const initOffset = is('tempo') ? 30 : is('beats') ? 2 : 0

	// States
	const wheelRef = useRef(document.createElement('div'))
	const [saved, setSaved] = useState(currentWhat)
	const [wheel, setWheel] = useState({
		y: (currentWhat - initOffset) * -height,
		snap: true,
	})

	// Let go and wheel align with the nearest element
	const wheelSnapping = useCallback(
		(y: number) => {
			let toTranslate = y
			const surplus = y % height
			const isAboveHalfHeight = -surplus >= height / 2

			// Snap to Element
			toTranslate -= isAboveHalfHeight ? height + surplus : surplus

			// Lower - Upper bounds
			if (toTranslate > 0) toTranslate = 0
			if (toTranslate < maxMovement) toTranslate = maxMovement

			setWheel({ y: toTranslate, snap: true })

			return toTranslate
		},
		[setWheel, maxMovement, height]
	)

	const movingAction = (state: any) => {
		const y = state.movement[1]
		const userMoves = state.dragging || state.wheeling || state.scrolling

		if (userMoves) {
			setWheel({ y, snap: false })
		} else {
			// Save element position
			let number = +(Math.abs(wheelSnapping(y)) / height)
			number = what === 'tempo' ? number + 30 : number

			setSaved(number)
			update(number)
		}
	}

	const bind = useGesture(
		{
			onDrag: state => movingAction(state),
			onWheel: state => movingAction(state),
		},
		{
			drag: {
				axis: 'y',
				rubberband: 0.1,
				initial: () => [0, wheel.y],
				bounds: { bottom: 0, top: maxMovement },
			},
			wheel: {
				axis: 'y',
				rubberband: 0.1,
				initial: () => [0, wheel.y],
				bounds: { bottom: 0, top: maxMovement },
			},
		}
	)

	// Listens for state changes outside of the component
	// Only update affected wheel
	useEffect(() => {
		// Update Wheel when randomize beats
		if (what === 'beats' && currentWhat !== saved) {
			setSaved(currentWhat)
			wheelSnapping((currentWhat - 2) * -height)
		}

		// Update Wheel when tempo tapping
		if (what === 'tempo' && currentWhat !== saved) {
			setSaved(currentWhat)
			wheelSnapping((currentWhat - 30) * -height)
		}
	}, [what, wheelSnapping, saved, currentWhat, height])

	useEffect(() => {
		wheelRef.current.addEventListener('mouseenter', () => scrollPrevent(true))
		wheelRef.current.addEventListener('mouseleave', () => scrollPrevent(false))
	}, [])

	return (
		<div className="immovable_wheel">
			<div
				{...bind()}
				ref={wheelRef}
				className={'wheel' + (wheel.snap ? '' : ' dragging')}
				style={{ transform: `translateY(${wheel.y}px)` }}
			>
				{list.map((elem, i: number) => (
					<div key={'wheel_child' + i}>{elem}</div>
				))}
			</div>
		</div>
	)
}

export default Wheel
