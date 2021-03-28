import { useGesture } from 'react-use-gesture'
import { useState, useRef, useEffect } from 'react'

// [-----|---------.-------]
// a     z         x       b

function Range({ sound, what, update }): JSX.Element {
	const rangeRef = useRef(document.createElement('div'))
	const init = what === 'volume' ? sound.volume : sound.release

	const [dontClick, setDontClick] = useState(false)
	const [range, setRange] = useState({
		width: 0,
		x: init * 100,
		moving: false,
	})

	const scrollPrevent = (no: boolean) => {
		document.body.style.overflow = no ? 'hidden' : 'auto'
		document.body.style.marginRight = no ? '17px' : '0'
	}

	rangeRef.current.addEventListener('mouseenter', () => scrollPrevent(true))
	rangeRef.current.addEventListener('mouseleave', () => scrollPrevent(false))

	const stayPositive = (n: number) => (n > 0 ? n : 0)

	const movingAction = state => {
		const moving = state.dragging || state.wheeling

		console.log(range.width)

		if (moving) {
			const percent = state.movement[0] / range.width
			setRange({ x: percent * 100, moving, width: range.width })
			update(stayPositive(percent))
			setDontClick(true)
		}
	}

	const clickAction = state => {
		if (!dontClick) {
			const childXpos = rangeRef.current.children[0].getBoundingClientRect().x
			const childWidth = state.event.clientX - childXpos
			const percent = childWidth / range.width

			setRange({ x: percent * 100, moving: false, width: range.width })
			update(stayPositive(percent))
		}
	}

	const bind = useGesture(
		{
			onDrag: state => movingAction(state),
			onClick: state => clickAction(state),
			onMouseDown: () => setDontClick(false),
		},
		{
			drag: {
				axis: 'x',
				rubberband: 0,
				initial: () => [range.width * (range.x / 100), 0],
				bounds: { left: 0, right: range.width },
			},
		}
	)

	useEffect(() => {
		//
		// Only calculate bounding on start or on resize
		// Range dragging is laggy if not
		//
		const updateRangeWidth = () =>
			setRange(prev => ({
				...prev,
				width: rangeRef.current.getBoundingClientRect().width,
			}))

		updateRangeWidth()
		window.addEventListener('resize', updateRangeWidth)
	}, [])
	return (
		<div className="range-wrap" {...bind()} ref={rangeRef}>
			<div
				className="inner-range"
				style={{
					width: range.x + '%',
					transition: `width ${range.moving ? '0s' : '.2s'}`,
				}}
			></div>
		</div>
	)
}

export default Range
