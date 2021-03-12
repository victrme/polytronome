import { useDrag } from 'react-use-gesture'
import { useState, useRef } from 'react'

function Wheel(): JSX.Element {
	const wheelRef = useRef(document.createElement('div'))
	const [wheelY, setWheelY] = useState(0)
	const [octaveSelection, setOctaveSelection] = useState({
		init: [-1, 0, 1, 2, 3, 4, 5, 6],
		on: 0,
	})

	// console.log(testage)

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
				const height = box.height / octaveSelection.init.length
				const mod = y % height
				const isAboveHalfHeight = -mod >= height / 2
				const maxMovement = -box.height + height
				let toTranslate = y

				// Snap to Element
				toTranslate -= isAboveHalfHeight ? height + mod : mod

				// Lower - Upper bounds
				if (toTranslate > 0) toTranslate = 0
				if (toTranslate < maxMovement) toTranslate = maxMovement

				// Save element position
				setOctaveSelection(prev => ({
					...prev,
					on: +(Math.abs(toTranslate) / height),
				}))

				moveWheel(toTranslate, true)
				setWheelY(toTranslate)
			}
		},
		{ axis: 'y', initial: () => [0, wheelY] }
	)

	return (
		<div className="immovable_wheel">
			<div {...bind()} ref={wheelRef} className="wheel octave">
				{octaveSelection.init.map((oct, i) => (
					<div key={'octavewheel' + i}>{oct}</div>
				))}
			</div>
		</div>
	)
}

export default Wheel
