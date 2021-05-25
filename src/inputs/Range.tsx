import { useGesture } from 'react-use-gesture'
import { useState, useRef, useEffect } from 'react'

// [-----|---------.-------]
// a     z         x       b

function Range({ volume, i, layers, setLayers }): JSX.Element {
	const rangeRef = useRef(document.createElement('div'))
	const [dontClick, setDontClick] = useState(false)
	const [range, setRange] = useState({
		width: 0,
		x: volume * 100,
		moving: false,
	})

	const stayPositive = (n: number) => (n > 0 ? n : 0)

	const movingAction = state => {
		const moving = state.dragging || state.wheeling

		if (moving) {
			const percent = state.movement[0] / range.width
			setRange({ x: percent * 100, moving, width: range.width })

			setDontClick(true)

			//update
			const newLayers = [...layers]
			newLayers[i].volume = stayPositive(percent)
			setLayers(newLayers)
		}
	}

	const clickAction = state => {
		if (!dontClick) {
			const childXpos = rangeRef.current.children[0].getBoundingClientRect().x
			const childWidth = state.event.clientX - childXpos
			const percent = childWidth / range.width

			setRange({ x: percent * 100, moving: false, width: range.width })

			//update
			const newLayers = [...layers]
			newLayers[i].volume = stayPositive(percent)
			setLayers(newLayers)
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
				className={'inner-range' + (range.moving ? ' moving' : '')}
				style={{ width: range.x + '%' }}
			></div>
		</div>
	)
}

export default Range
