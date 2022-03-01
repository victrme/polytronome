import { ResizeObserver } from '@juggle/resize-observer'
import { useSpring, animated } from '@react-spring/web'
import { useDrag, useWheel } from '@use-gesture/react'
import { useEffect, useRef, useState } from 'react'
import useMeasure from 'react-use-measure'
import inRange from 'lodash/inRange'

const freqArr = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const allLists: {
	beats: string[]
	tempo: string[]
	freq: string[]
} = { beats: ['×'], tempo: [], freq: [] }

for (let i = 2; i <= 16; i++) allLists.beats.unshift(i.toString())
for (let i = 30; i <= 300; i++) allLists.tempo.unshift(i.toString())
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

const Wheel = ({ update, type, state, noAnim }): JSX.Element => {
	const list: string[] = allLists[type]
	const [dragRelease, setDragRelease] = useState(false)
	const [wheelRef, preBounds] = useMeasure({ polyfill: ResizeObserver })
	const [animate, setAnimate] = useState(true)

	const getHeight = () => preBounds.height / allLists[type].length
	const offsetState = (state: number) => (type === 'tempo' ? state - 30 : state - 1)
	const getClosest = (y: number) => Math.round(y / getHeight()) * getHeight()
	const getUserVal = (y: number) => Math.round(y / getHeight()) + list.length - 1

	const getBottomPos = () => -(list.length - 1) * getHeight()
	const getInitalPos = () => getBottomPos() + offsetState(state) * getHeight()

	// don't animate when tempo or reduced animations
	const animateControl = !(type === 'tempo' || noAnim)

	// eslint-disable-next-line
	const [{ y }, spring] = useSpring(() => ({
		x: 0,
		y: getInitalPos(),
		config: { tension: 500, friction: 30, precision: 0.001 },
	}))

	// Update logic for wheel (for everywhere except drag)
	const handleWheelMove = (sign: number, tempoNoUpdate?: boolean) => {
		const snapped = getClosest(y.get() + getHeight() * sign)

		if (inRange(snapped, getHeight(), getBottomPos())) {
			tempoNoUpdate ? spring.set({ y: snapped }) : update(getUserVal(snapped))
		}
	}

	// Puts back wheel in place after drag move
	const snapWheel = () => {
		const pos = getBottomPos() + offsetState(state) * getHeight()
		animate ? spring.start({ y: pos }) : spring.set({ y: pos })
	}

	useEffect(() => {
		!dragRelease ? snapWheel() : setDragRelease(false)
		// eslint-disable-next-line
	}, [state])

	useEffect(() => {
		// Snaps wheel into place on resize
		snapWheel()
		// eslint-disable-next-line
	}, [preBounds.height])

	useEffect(() => {
		setAnimate(animateControl)
		// eslint-disable-next-line
	}, [noAnim])

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
		} else setAnimate(animateControl)
	}, {})

	//
	// Arrows
	//

	const detectAutoTimeout = useRef(setTimeout(() => {}, 1))
	const autoScrollTimeout = useRef(setTimeout(() => {}, 1))
	const timeOfClick = useRef(0)

	const handleArrow = (sign: number, enter: boolean) => {
		//
		function autoScrollRecursion(ms: number) {
			autoScrollTimeout.current = setTimeout(() => {
				// dont update state if its tempo
				handleWheelMove(sign, type === 'tempo')

				// Increase speed if held
				const timeScrolling = performance.now() - timeOfClick.current
				if (timeScrolling > 1600) ms = 80
				if (timeScrolling > 3200) ms = 40
				if (timeScrolling > 4800) ms = 20

				autoScrollRecursion(ms)
			}, ms)
		}

		if (enter) {
			timeOfClick.current = performance.now()
			handleWheelMove(sign)

			detectAutoTimeout.current = setTimeout(() => {
				handleWheelMove(sign)
				autoScrollRecursion(160)
			}, 400)
		} else {
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
