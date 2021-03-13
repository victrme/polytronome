import { useDrag } from 'react-use-gesture'
import { useState, useRef } from 'react'

function Wheel({ what, list, init, update }): JSX.Element {
	const wheelRef = useRef(document.createElement('div'))
	const box = wheelRef.current.getBoundingClientRect()
	const height = box.height / list.length

	// LE MOINS QUARANTE EST PAS BEAU DU TOUT
	const [wheelY, setWheelY] = useState(init * -40)
	const [wheelSnap, setWheelSnap] = useState(true)

	const bind = useDrag(
		state => {
			const y = state.movement[1]

			if (state.dragging) {
				setWheelY(y)
				setWheelSnap(false)
			} else {
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
				update(+(Math.abs(toTranslate) / height))

				// moveWheel(toTranslate, true)
				setWheelY(toTranslate)
				setWheelSnap(true)
			}
		},
		{ axis: 'y', initial: () => [0, wheelY] }
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
