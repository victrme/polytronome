import { useGesture } from 'react-use-gesture'
import { useState, useRef } from 'react'

function Wheel({ what, list, init, update }): JSX.Element {
	const wheelRef = useRef(document.createElement('div'))

	// Need to figure better way to get wheel height
	// const box = wheelRef.current.getBoundingClientRect()
	// const height = box.height / list.length
	const height = 40
	const maxMovement = -height * list.length + height

	const [wheelY, setWheelY] = useState(init * -height)
	const [wheelSnap, setWheelSnap] = useState(true)

	const scrollPrevent = (no: boolean) =>
		(document.body.style.overflow = no ? 'hidden' : 'auto')

	wheelRef.current.addEventListener('mouseenter', () => scrollPrevent(true))
	wheelRef.current.addEventListener('mouseleave', () => scrollPrevent(false))

	const movingAction = (state: any) => {
		// console.log(state)
		const y = state.movement[1]
		const userMoves = state.dragging || state.wheeling || state.scrolling

		if (userMoves) {
			if (state.wheeling) document.body.style.overflow = 'hidden'
			setWheelY(y)
			setWheelSnap(false)
		} else {
			const surplus = y % height
			const isAboveHalfHeight = -surplus >= height / 2
			let toTranslate = y

			// Snap to Element
			toTranslate -= isAboveHalfHeight ? height + surplus : surplus

			// Lower - Upper bounds
			if (toTranslate > 0) toTranslate = 0
			if (toTranslate < maxMovement) toTranslate = maxMovement

			// Save element position
			update(+(Math.abs(toTranslate) / height))

			setWheelY(toTranslate)
			setWheelSnap(true)
		}
	}
	const options: any = {
		axis: 'y',
		rubberband: 0.1,
		initial: () => [0, wheelY],
		bounds: { bottom: 0, top: maxMovement },
	}
	const bind = useGesture(
		{
			onDrag: state => movingAction(state),
			onWheel: state => movingAction(state),
		},
		{ drag: options, wheel: options }
	)

	return (
		<div className="immovable_wheel">
			<div
				{...bind()}
				ref={wheelRef}
				className={what + ' wheel'}
				style={{
					transform: `translateY(${wheelY}px)`,
					transition: `transform ${wheelSnap ? '.2s' : '0s'}`,
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
