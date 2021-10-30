import { useGesture } from 'react-use-gesture'
import { useState, useRef, useEffect } from 'react'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import { isWindows } from 'react-device-detect'
import Arrow from './Arrow'

import propTypes from 'prop-types'

// Wheels work by getting the index of an element with wheel height divided by children height
// Up movement uses translateY(-px), incrementing is negative, so maths are weird

const freqArr = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const fillArray = (start: number, end: number, freq?: boolean) => {
	const arr: any[] = []
	for (let i = start; i <= end; i++)
		arr.unshift(freq ? freqArr[i % freqArr.length].toString() : i.toString())
	return arr
}

// Init all wheels text before JSX Element
const allLists = {
	beats: fillArray(1, 16),
	tempo: fillArray(30, 300),
	frequency: fillArray(0, freqArr.length * 3, true),
}

function Wheel({ update, tempo, freq, beats }): JSX.Element {
	const what: {
		height: number
		list: string[]
		current: number
		offset: number
	} = { height: 50, list: [], current: 0, offset: 0 }

	if (tempo !== undefined) {
		what.list = allLists.tempo
		what.current = tempo
		what.offset = 30
	}

	if (beats !== undefined) {
		what.list = allLists.beats
		what.current = beats
		what.offset = 1
		what.list[what.list.length - 1] = '×'
	}

	if (freq !== undefined) {
		what.list = allLists.frequency
		what.current = freq
	}

	const { height, list } = what
	const maxMovement = -height * (list.length - 1)
	const current = what.current - what.offset
	// States

	const [wasInterval, setWasInterval] = useState(false)
	const [wheel, setWheel] = useState({
		y: maxMovement - current * -height,
		snap: true,
	})

	const arrowTimeout = useRef(setTimeout(() => {}, 1))
	const arrowInterval = useRef(setTimeout(() => {}, 1))
	const wheelDivRef = useRef(document.createElement('div'))
	const wheelRef = useRef(wheel)

	wheelRef.current = wheel

	const wheelArrows = (sign: number, click: 'enter' | 'click' | 'leave') => {
		const updateFromArrow = () =>
			update(getNumberFromPosition(wheelRef.current.y + height * sign))

		if (click === 'enter') {
			arrowTimeout.current = setTimeout(() => {
				updateFromArrow()
				arrowInterval.current = setInterval(
					() => {
						setWasInterval(true)
						updateFromArrow()
					},
					tempo !== undefined ? 50 : 200
				)
			}, 200)
		}

		if (click === 'click') {
			clearTimeout(arrowInterval.current)
			clearInterval(arrowTimeout.current)

			if (!wasInterval) updateFromArrow()

			setWasInterval(false)
		}

		if (click === 'leave') {
			clearTimeout(arrowInterval.current)
			clearInterval(arrowTimeout.current)
		}

		return false
	}

	const getNumberFromPosition = pos => +(Math.abs(wheelSnapping(maxMovement - pos)) / height)

	const setCorrectWheel = () => {
		if (beats !== undefined) setWheel({ y: maxMovement - current * -height, snap: true })
		if (freq !== undefined) setWheel({ y: maxMovement - current * -height, snap: true })
		if (tempo !== undefined) setWheel({ y: maxMovement - current * -height, snap: true })
	}

	// Let go and wheel align with the nearest element
	const wheelSnapping = (y: number) => {
		let toTranslate = y
		const surplus = y % height
		const isAboveHalfHeight = -surplus >= height / 2

		// Snap to Element
		toTranslate -= isAboveHalfHeight ? height + surplus : surplus

		// Lower - Upper bounds
		if (toTranslate > 0) toTranslate = 0
		if (toTranslate < maxMovement) toTranslate = maxMovement

		return toTranslate
	}

	const movingAction = (state: any) => {
		const y = state.movement[1]
		const userMoves = state.dragging || state.wheeling || state.scrolling

		if (userMoves) {
			setWheel({ y, snap: false })
		} else {
			// Save element position
			const number = getNumberFromPosition(y)
			update(number)

			// user hasnt moved enough, still snaps
			if (number === current) setCorrectWheel()
		}

		return false
	}

	const bind = useGesture(
		{
			onDrag: state => movingAction(state),
			onWheel: state => movingAction(state),
		},
		{
			drag: {
				axis: 'y',
				rubberband: 0.1,
				initial: () => [0, wheel.y],
				bounds: { bottom: 0, top: maxMovement },
			},
			wheel: {
				axis: 'y',
				rubberband: 0.05,
				initial: () => [0, wheel.y],
				bounds: { bottom: 0, top: maxMovement },
			},
		}
	)

	useEffect(
		setCorrectWheel, // Snaps wheel on change
		// eslint-disable-next-line
		[current]
	)

	useEffect(() => {
		const tempScrollbarWindowsFix = () => {
			if (isWindows && document.body.scrollHeight > window.innerHeight)
				document.body.style.paddingRight = '16px'
		}

		wheelDivRef.current.addEventListener('mouseenter', () => {
			disableBodyScroll(document.body)
			tempScrollbarWindowsFix()
		})
		wheelDivRef.current.addEventListener('mouseleave', () => {
			enableBodyScroll(document.body)
			tempScrollbarWindowsFix()
		})
	}, [])

	return (
		<div className={'immovable_wheel'}>
			<div className="arrows">
				<span
					className="up"
					onClick={() => wheelArrows(1, 'click')}
					onMouseDown={() => wheelArrows(1, 'enter')}
					onMouseLeave={() => wheelArrows(1, 'leave')}
					style={{ transform: 'rotate(180deg)' }}
				>
					<Arrow></Arrow>
				</span>
				<span
					className="down"
					onClick={() => wheelArrows(-1, 'click')}
					onMouseDown={() => wheelArrows(-1, 'enter')}
					onMouseLeave={() => wheelArrows(-1, 'leave')}
				>
					<Arrow></Arrow>
				</span>
			</div>
			<div
				{...bind()}
				ref={wheelDivRef}
				className={'wheel' + (wheel.snap ? '' : ' dragging')}
				style={{ transform: `translateY(${wheel.y}px)` }}
			>
				<pre>{list.join('\n')}</pre>
			</div>
		</div>
	)
}

Wheel.propTypes = {
	update: propTypes.func.isRequired,
	tempo: propTypes.number,
	beats: propTypes.number,
	freq: propTypes.number,
}

export default Wheel
