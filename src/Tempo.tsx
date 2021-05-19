import { useRef, useState } from 'react'
import { isMobileOnly } from 'react-device-detect'
import propTypes from 'prop-types'
import Wheel from './Wheel'

const Tempo = ({ tempo, restart, update, wheelUpdate }) => {
	const [tap, setTap] = useState([
		{
			date: 0,
			wait: 0,
		},
	])
	const buttonsInterval = useRef(setTimeout(() => {}, 1))

	const tempoBtns = (e: any, dir: string, sign: number, doAnything: boolean) => {
		// Cut fct short if not good platform
		if (!doAnything) return false

		if (dir === 'enter') {
			update(tempo + 1 * sign)

			buttonsInterval.current = setTimeout(
				() =>
					(buttonsInterval.current = setInterval(() => update(tempo + 1 * sign), 70)),
				300
			)
		}

		if (dir === 'leave') {
			clearTimeout(buttonsInterval.current)
			clearInterval(buttonsInterval.current)
			restart()
		}

		if (!isMobileOnly) e.preventDefault()
		e.stopPropagation()
		return false
	}

	const tapTempo = () => {
		// Reset tap after 2s
		if (Date.now() - tap[0].date > 2000) {
			setTap([
				{
					date: Date.now(),
					wait: 0,
				},
			])
		} else {
			//
			// Wait is offset between two taps
			const currTap = [...tap]
			currTap.unshift({
				date: Date.now(),
				wait: Date.now() - tap[0].date,
			})

			// Array of tap offsets
			const cumul: number[] = []

			// Removes first, only keeps 6 at a time
			currTap.forEach((each, i) => {
				if (each.wait > 0) cumul.push(each.wait)
				if (each.wait === 0 || i === 6) currTap.pop()
			})

			const averageTempo = Math.floor(
				60000 / (cumul.reduce((a: number, b: number) => a + b) / cumul.length)
			)
			update(averageTempo)

			setTap(currTap)
			restart()
		}
	}

	return (
		<div>
			<div className="boxed tempo">
				<div className="setting">
					<Wheel
						tempo={tempo}
						update={result => {
							wheelUpdate('tempo', result)
							restart()
						}}
					></Wheel>

					<button className="tap" onClick={tapTempo}>
						tap
					</button>
					<div className="tempo-buttons">
						<button
							className="tempo-minus"
							onTouchStart={e => tempoBtns(e, 'enter', -1, isMobileOnly)}
							onTouchEnd={e => tempoBtns(e, 'leave', -1, isMobileOnly)}
							onMouseDown={e => tempoBtns(e, 'enter', -1, !isMobileOnly)}
							onMouseUp={e => tempoBtns(e, 'leave', -1, !isMobileOnly)}
							onMouseLeave={e => tempoBtns(e, 'leave', -1, !isMobileOnly)}
							onContextMenu={e => e.preventDefault()}
						>
							-
						</button>
						<button
							className="tempo-plus"
							onTouchStart={e => tempoBtns(e, 'enter', 1, isMobileOnly)}
							onTouchEnd={e => tempoBtns(e, 'leave', 1, isMobileOnly)}
							onMouseDown={e => tempoBtns(e, 'enter', 1, !isMobileOnly)}
							onMouseUp={e => tempoBtns(e, 'leave', 1, !isMobileOnly)}
							onMouseLeave={e => tempoBtns(e, 'leave', 1, !isMobileOnly)}
							onContextMenu={e => e.preventDefault()}
						>
							+
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

Tempo.propTypes = {
	restart: propTypes.func,
	wheelUpdate: propTypes.func,
	update: propTypes.func,
	tempo: propTypes.number,
}

export default Tempo
