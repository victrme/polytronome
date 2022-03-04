import { useSpring, animated } from '@react-spring/web'
import { useDrag, useWheel } from '@use-gesture/react'
import { useEffect, useRef, useState } from 'react'
import useMeasure from 'react-use-measure'
import inRange from 'lodash/inRange'

import { tempoList } from '../lib/utils'

const freqArr = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const allLists: {
	beats: string[]
	tempo: number[]
	freq: string[]
} = { beats: ['×'], tempo: [...tempoList].reverse(), freq: [] }

for (let i = 2; i <= 16; i++) allLists.beats.unshift(i.toString())
for (let i = 0; i <= 54; i++) allLists.freq.unshift(freqArr[i % freqArr.length])

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

const Wheel = ({ update, type, state, animations }): JSX.Element => {
	const list: string[] = allLists[type]
	const [dragRelease, setDragRelease] = useState(false)
	const [wheelRef, preBounds] = useMeasure()
	const [animate, setAnimate] = useState(true)

	// Beats are one-based, other wheel states zero-based
	if (type === 'beats') state -= 1

	const getHeight = () => preBounds.height / allLists[type].length
	const getClosest = (y: number) => Math.round(y / getHeight()) * getHeight()
	const getUserVal = (y: number) => Math.round(y / getHeight()) + list.length - 1

	const getBottomPos = () => -(list.length - 1) * getHeight()
	const getInitalPos = () => getBottomPos() + state * getHeight()

	const [{ y }, spring] = useSpring(() => ({
		x: 0,
		y: getInitalPos(),
		config: { tension: 500, friction: 30, precision: 0.001 },
	}))

	// Update logic for wheel (for everywhere except drag)
	const handleWheelMove = (sign: number) => {
		const snapped = getClosest(y.get() + getHeight() * sign)

		if (inRange(snapped, getHeight(), getBottomPos())) {
			update(getUserVal(snapped))
		}
	}

	// Puts back wheel in place after drag move
	const snapWheel = () => {
		const pos = getBottomPos() + state * getHeight()
		animate ? spring.start({ y: pos }) : spring.set({ y: pos })
	}

	useEffect(() => {
		!dragRelease ? snapWheel() : setDragRelease(false)
	}, [state])

	// Snaps wheel into place on resize
	useEffect(() => {
		snapWheel()
	}, [preBounds.height])

	useEffect(() => {
		setAnimate(animations)
	}, [animations])

	//
	// Gestures
	//

	const dragging = useDrag(
		({ active, offset: [x, y] }) => {
			spring.start({ y })

			if (!active) {
				setDragRelease(true)
				spring.start({ y: getClosest(y) })
				update(getUserVal(y))
			}
		},
		{
			axis: 'y',
			rubberband: 0.1,
			from: () => [0, y.get()],
			eventOptions: { passive: true },
			bounds: { top: getBottomPos(), bottom: 0 },
		}
	)

	const wheeling = useWheel(({ wheeling, direction }) => {
		if (wheeling) {
			setAnimate(false)
			handleWheelMove(direction[1])
		} else setAnimate(animations)
	}, {})

	//
	// Arrows
	//

	const detectAutoTimeout = useRef(setTimeout(() => {}, 1))
	const autoScrollTimeout = useRef(setTimeout(() => {}, 1))

	const handleArrow = (sign: number, enter: boolean) => {
		//
		function autoScroll() {
			autoScrollTimeout.current = setTimeout(() => {
				handleWheelMove(sign)
				autoScroll()
			}, 100)
		}

		// Starts clicking on arrow, activate once
		// and start recursion after .4s
		if (enter) {
			handleWheelMove(sign)
			detectAutoTimeout.current = setTimeout(() => {
				handleWheelMove(sign)
				autoScroll()
			}, 400)
		}
		// MouseUp & MouseLeave, clear timeouts
		else {
			clearTimeout(detectAutoTimeout.current)
			clearTimeout(autoScrollTimeout.current)
		}

		return false
	}

	return (
		<div className="immovable_wheel">
			<div className="arrows">
				<Arrow
					className="up"
					onMouseDown={() => handleArrow(1, true)}
					onMouseLeave={() => handleArrow(1, false)}
					onMouseUp={() => handleArrow(1, false)}
				/>

				<Arrow
					className="down"
					onMouseDown={() => handleArrow(-1, true)}
					onMouseLeave={() => handleArrow(-1, false)}
					onMouseUp={() => handleArrow(-1, false)}
				/>
			</div>

			<animated.div
				{...dragging()}
				{...wheeling()}
				ref={wheelRef}
				className="wheel"
				style={{ y }}
			>
				{list.map((elem, i) => (
					<p key={'wheelElem' + i}>{elem}</p>
				))}
			</animated.div>
		</div>
	)
}

export default Wheel
