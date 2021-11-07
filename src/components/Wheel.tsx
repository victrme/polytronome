import { useDrag, useWheel } from '@use-gesture/react'
import { useSpring, animated, config } from '@react-spring/web'
import propTypes from 'prop-types'
import { inRange } from 'lodash'

const Arrow = props => {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="-1 -2 10 9">
			<path
				d="M4.866 6.5C4.4811 7.1667 3.5189 7.1667 3.134 6.5L.5359 2C.151 1.3333.6321.5 1.4019.5L6.5981.5C7.3679.5 7.849 1.3333 7.4641 2L4.866 6.5Z"
				stroke="transparent"
				strokeWidth="1"
				fill="var(--accent)"
			/>
		</svg>
	)
}

const freqArr = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const fillArray = (start: number, end: number, freq?: boolean): string[] => {
	const arr: any[] = []
	for (let i = start; i <= end; i++)
		arr.unshift(freq ? freqArr[i % freqArr.length].toString() : i.toString())
	return arr
}

// Init all wheels text before JSX Element
const allLists = {
	beats: fillArray(1, 16),
	tempo: fillArray(30, 300),
	freq: fillArray(0, freqArr.length * 3, true),
}

allLists.beats[allLists.beats.length - 1] = '×'

function Wheel({ update, type, state }): JSX.Element {
	const list: string[] = allLists[type]
	const bottomPos = -(list.length - 1) * 50
	const initialPos = bottomPos + (state - 1) * 50

	const getClosest = (y: number) => Math.round(y / 50) * 50
	const getUserVal = (y: number) => Math.round(y / 50) + list.length - 1

	// eslint-disable-next-line
	const [{ x, y }, api] = useSpring(() => ({
		x: 0,
		y: initialPos,
		config: config.stiff,
	}))

	const dragging = useDrag(
		({ active, offset: [x, y] }) => {
			api.start({ y })
			if (!active) {
				api.start({ x, y: getClosest(y) })
				update(getUserVal(y))
			}
		},
		{
			axis: 'y',
			rubberband: 0.1,
			from: () => [0, y.get()],
			eventOptions: { passive: true },
			bounds: { top: bottomPos, bottom: 0 },
		}
	)

	const handleWheelChange = (sign: number) => {
		const snapped = getClosest(y.get() + 50 * sign)

		if (inRange(snapped, 50, bottomPos)) {
			api.start({ y: snapped })
			update(getUserVal(snapped))
		}
	}

	const wheeling = useWheel(({ wheeling, direction }) => {
		if (wheeling) handleWheelChange(direction[1])
	})

	return (
		<div className="immovable_wheel">
			<div className="arrows">
				<Arrow
					className="up"
					onClick={() => handleWheelChange(1)}
					// onMouseDown={() => console.log('yo')}
					// onMouseUp={() => console.log('yo')}
				/>

				<Arrow
					className="down"
					onClick={() => handleWheelChange(-1)}
					// onMouseDown={() => console.log('yo')}
					// onMouseUp={() => console.log('yo')}
				/>
			</div>
			<animated.div {...dragging()} {...wheeling()} className="wheel" style={{ y }}>
				<pre>{list.join('\n')}</pre>
			</animated.div>
		</div>
	)
}

Wheel.propTypes = {
	update: propTypes.func.isRequired,
	type: propTypes.string.isRequired,
	state: propTypes.number.isRequired,
}

export default Wheel
