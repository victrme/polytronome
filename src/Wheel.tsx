import { useGesture } from 'react-use-gesture'
import { useState, useRef, useEffect, useCallback } from 'react'

const Beats = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
const Notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const Octaves = [-1, 0, 1, 2, 3, 4, 5, 6]

function Wheel({ index, what, metronome, update }): JSX.Element {
	const wheelRef = useRef(document.createElement('div'))

	// Need to figure better way to get wheel height
	// const box = wheelRef.current.getBoundingClientRect()
	// const height = box.height / list.length
	const list = what === 'beats' ? Beats : what === 'frequency' ? Notes : Octaves
	const height = 40
	const maxMovement = -height * list.length + height
	const currentWhat = metronome.layers[index][what]
	const [wheel, setWheel] = useState({
		y: currentWhat * -height,
		snap: true,
	})

	const scrollPrevent = (no: boolean) => {
		document.body.style.overflow = no ? 'hidden' : 'auto'
		document.body.style.marginRight = no ? '17px' : '0'
	}

	wheelRef.current.addEventListener('mouseenter', () => scrollPrevent(true))
	wheelRef.current.addEventListener('mouseleave', () => scrollPrevent(false))

	const wheelSnapping = useCallback(
		(y: number) => {
			const surplus = y % height
			const isAboveHalfHeight = -surplus >= height / 2
			let toTranslate = y

			// Snap to Element
			toTranslate -= isAboveHalfHeight ? height + surplus : surplus

			// Lower - Upper bounds
			if (toTranslate > 0) toTranslate = 0
			if (toTranslate < maxMovement) toTranslate = maxMovement

			setWheel({ y: toTranslate, snap: true })

			return toTranslate
		},
		[setWheel, maxMovement]
	)

	const movingAction = (state: any) => {
		const y = state.movement[1]
		const userMoves = state.dragging || state.wheeling || state.scrolling

		if (userMoves) {
			setWheel({ y, snap: false })
		} else {
			// Save element position
			update(+(Math.abs(wheelSnapping(y)) / height))
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

	useEffect(() => {
		if (!metronome.isRunning && what === 'beats') wheelSnapping((currentWhat - 2) * -height)
	}, [currentWhat, metronome, what, wheelSnapping])

	return (
		<div className="immovable_wheel">
			<div
				{...bind()}
				ref={wheelRef}
				className={'wheel'}
				style={{
					transform: `translateY(${wheel.y}px)`,
					transition: `transform ${wheel.snap ? '.2s' : '0s'}`,
				}}
			>
				{list.map((oct, i) => (
					<div key={'wheel_child' + i}>{oct}</div>
				))}
			</div>
		</div>
	)
}

export default Wheel
