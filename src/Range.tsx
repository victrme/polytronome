import { useGesture } from 'react-use-gesture'
import { useState, useRef } from 'react'

function Range({ sound, what, update }): JSX.Element {
	const rangeRef = useRef(document.createElement('div'))
	const init = what === 'volume' ? sound.volume : sound.release
	const [range, setRange] = useState({
		x: init * 100,
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

		if (moving) {
			const percent = state.movement[0] / rangeWidth
			setRange({ x: percent * 100, moving })
			update(percent)
		} else {
			console.log(state)
			const rangeBox = rangeRef.current.children[0].getBoundingClientRect()
			const diff = state.event.clientX - rangeBox.x

			// [-----|---------.-------]
			// a     z         x       b

			console.log(diff)

			setRange({ x: (diff / rangeWidth) * 100, moving: true })
		}
	}

	const bind = useGesture(
		{
			onDrag: state => movingAction(state),
			onClick: state => movingAction(state),
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
					width: range.x + '%',
					transition: `transform ${range.moving ? '0s' : '.2s'}`,
				}}
			></div>
		</div>
	)
}

export default Range
