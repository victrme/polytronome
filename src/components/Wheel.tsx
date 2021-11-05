import { useDrag, useWheel } from '@use-gesture/react'
import { useSpring, animated, config } from '@react-spring/web'
import propTypes from 'prop-types'
import { inRange } from 'lodash'

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

	const wheeling = useWheel(({ wheeling, direction }) => {
		if (wheeling) {
			const snapped = getClosest(y.get() + 50 * direction[1])

			if (inRange(snapped, bottomPos)) {
				api.start({ y: snapped })
				update(getUserVal(snapped))
			}
		}
	})

	return (
		<div className="immovable_wheel">
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
