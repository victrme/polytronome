export function OldInefficientWheel() {
	// const what: {
	// 	list: string[]
	// 	current: number
	// 	offset: number
	// } = { list: [], current: 0, offset: 0 }
	// if (tempo !== undefined) {
	// 	what.list = allLists.tempo
	// 	what.current = tempo
	// 	what.offset = 30
	// }
	// if (beats !== undefined) {
	// 	what.list = allLists.beats
	// 	what.current = beats
	// 	what.offset = 1
	// 	what.list[what.list.length - 1] = '×'
	// }
	// if (freq !== undefined) {
	// 	what.list = allLists.frequency
	// 	what.current = freq
	// }
	// const { list } = what
	// const height = 50
	// const maxMovement = -height * (list.length - 1)
	// const current = what.current - what.offset
	//
	//
	// const bodyScroll = locked => {
	// 	locked ? disableBodyScroll(document.body) : enableBodyScroll(document.body)
	// 	// Temporaire, juste pour windows
	// 	if (isWindows && document.body.scrollHeight > window.innerHeight)
	// 		document.body.style.paddingRight = '16px'
	// }
	//
	// const [wasInterval, setWasInterval] = useState(false)
	// const [wheel, setWheel] = useState({
	// 	y: maxMovement - current * -height,
	// 	snap: true,
	// })
	// const arrowTimeout = useRef(setTimeout(() => {}, 1))
	// const arrowInterval = useRef(setTimeout(() => {}, 1))
	// const wheelDivRef = useRef(document.createElement('div'))
	// const wheelRef = useRef(wheel)
	// wheelRef.current = wheel
	// const getNumberFromPosition = pos => +(Math.abs(wheelSnapping(maxMovement - pos)) / height)
	//
	// const wheelArrows = (sign: number, click: 'enter' | 'click' | 'leave') => {
	// const updateFromArrow = () =>
	// 	update(getNumberFromPosition(wheelRef.current.y + height * sign))
	// if (click === 'enter') {
	// 	arrowTimeout.current = setTimeout(() => {
	// 		updateFromArrow()
	// 		arrowInterval.current = setInterval(
	// 			() => {
	// 				setWasInterval(true)
	// 				updateFromArrow()
	// 			},
	// 			tempo !== undefined ? 50 : 200
	// 		)
	// 	}, 200)
	// }
	// if (click === 'click') {
	// 	clearTimeout(arrowInterval.current)
	// 	clearInterval(arrowTimeout.current)
	// 	if (!wasInterval) updateFromArrow()
	// 	setWasInterval(false)
	// }
	// if (click === 'leave') {
	// 	clearTimeout(arrowInterval.current)
	// 	clearInterval(arrowTimeout.current)
	// }
	// return false
	// }
	// const setCorrectWheel = () => {
	// 	if (beats !== undefined) setWheel({ y: maxMovement - current * -height, snap: true })
	// 	if (freq !== undefined) setWheel({ y: maxMovement - current * -height, snap: true })
	// 	if (tempo !== undefined) setWheel({ y: maxMovement - current * -height, snap: true })
	// }
	// Let go and wheel align with the nearest element
	// const wheelSnapping = (y: number) => {
	// let toTranslate = y
	// const surplus = y % height
	// const isAboveHalfHeight = -surplus >= height / 2
	// // Snap to Element
	// toTranslate -= isAboveHalfHeight ? height + surplus : surplus
	// // Lower - Upper bounds
	// if (toTranslate > 0) toTranslate = 0
	// if (toTranslate < maxMovement) toTranslate = maxMovement
	// return toTranslate
	// }
	// const movingAction = (state: any) => {
	// const y = state.movement[1]
	// const userMoves = state.dragging || state.wheeling || state.scrolling
	// if (userMoves) {
	// 	setWheel({ y, snap: false })
	// } else {
	// 	// Save element position
	// 	const number = getNumberFromPosition(y)
	// 	update(number)
	// 	// user hasnt moved enough, still snaps
	// 	if (number === current) setCorrectWheel()
	// }
	// return false
	// }
	// return (
	// 	<div className={'immovable_wheel'}>
	// 		<div className="arrows">
	// 			<span
	// 				className="up"
	// 				onClick={() => wheelArrows(1, 'click')}
	// 				onMouseDown={() => wheelArrows(1, 'enter')}
	// 				onMouseLeave={() => wheelArrows(1, 'leave')}
	// 				style={{ transform: 'rotate(180deg)' }}
	// 			>
	// 				<Arrow></Arrow>
	// 			</span>
	// 			<span
	// 				className="down"
	// 				onClick={() => wheelArrows(-1, 'click')}
	// 				onMouseDown={() => wheelArrows(-1, 'enter')}
	// 				onMouseLeave={() => wheelArrows(-1, 'leave')}
	// 			>
	// 				<Arrow></Arrow>
	// 			</span>
	// 		</div>
	// 		<div
	// 			{...bind()}
	// 			style={{ transform: `translateY(0px)` }}
	// 			onMouseDown={() => bodyScroll(true)}
	// 			onMouseLeave={() => bodyScroll(false)}
	// 		>
	// 			<pre>{list.join('\n')}</pre>
	// 		</div>
	// 	</div>
	// )
}

export default OldInefficientWheel
