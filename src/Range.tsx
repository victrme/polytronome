import { useGesture } from 'react-use-gesture'
import { useState, useRef } from 'react'

function Range(): JSX.Element {
	const rangeRef = useRef(document.createElement('div'))
	const [range, setRange] = useState({
		x: 80,
		moving: false,
	})

	const scrollPrevent = (no: boolean) => {
		document.body.style.overflow = no ? 'hidden' : 'auto'
		document.body.style.marginRight = no ? '17px' : '0'
	}

	rangeRef.current.addEventListener('mouseenter', () => scrollPrevent(true))
	rangeRef.current.addEventListener('mouseleave', () => scrollPrevent(false))

	const rangeWidth = rangeRef.current.getBoundingClientRect().width

	const movingAction = state => {
		const moving = state.dragging || state.wheeling
		const [x, y] = state.movement

		setRange({ x, moving })
	}

	const bind = useGesture(
		{
			onDrag: state => movingAction(state),
		},
		{
			drag: {
				axis: 'x',
				rubberband: 0,
				initial: () => [range.x, 0],
				bounds: { left: 0, right: rangeWidth },
			},
		}
	)
	return (
		<div className="range-wrap" {...bind()} ref={rangeRef}>
			<div
				className="inner-range"
				style={{
					width: (range.x / rangeWidth) * 100 + '%',
					transition: `transform ${range.moving ? '0s' : '.2s'}`,
				}}
			></div>
		</div>
	)
}

export default Range
