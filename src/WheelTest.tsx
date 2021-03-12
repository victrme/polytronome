import { useDrag } from 'react-use-gesture'
import { useState, useRef } from 'react'

function Wheel({ data, update, what }): JSX.Element {
	const wheelRef = useRef(document.createElement('div'))
	const [wheelY, setWheelY] = useState(0)

	const moveWheel = (y: number, isSnap?: boolean) =>
		wheelRef.current.setAttribute(
			'style',
			`transform: translateY(${y}px); transition: transform ${isSnap ? '.2s' : '0s'}`
		)

	const bind = useDrag(
		state => {
			const y = state.movement[1]

			if (state.dragging) {
				moveWheel(y)
				setWheelY(y)
			} else {
				const box = wheelRef.current.getBoundingClientRect()
				const height = box.height / data.length
				const mod = y % height
				const isAboveHalfHeight = -mod >= height / 2
				const maxMovement = -box.height + height
				let toTranslate = y

				console.log(height)

				// Snap to Element
				toTranslate -= isAboveHalfHeight ? height + mod : mod

				// Lower - Upper bounds
				if (toTranslate > 0) toTranslate = 0
				if (toTranslate < maxMovement) toTranslate = maxMovement

				// Save element position
				update(+(Math.abs(toTranslate) / height) - 1)

				moveWheel(toTranslate, true)
				setWheelY(toTranslate)
			}
		},
		{ axis: 'y', initial: () => [0, wheelY] }
	)

	return (
		<div className="immovable_wheel">
			<div {...bind()} ref={wheelRef} className={what + ' wheel'}>
				{data.map((oct, i) => (
					<div key={'wheel_child' + i}>{oct}</div>
				))}
			</div>
		</div>
	)
}

export default Wheel
