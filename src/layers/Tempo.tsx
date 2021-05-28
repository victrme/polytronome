import { useRef, useState } from 'react'
import { isDesktop, isMobileOnly } from 'react-device-detect'
import propTypes from 'prop-types'
import Wheel from '../inputs/Wheel'

const Tempo = ({ tempo, setTempo, tempoRef, restart }) => {
	const [changedTempo, setChangedTempo] = useState(false)
	const [tap, setTap] = useState([
		{
			date: 0,
			wait: 0,
		},
	])
	const buttonsInterval = useRef(setTimeout(() => {}, 1))

	const changeTempo = (amount: number) => {
		const up = amount > tempo
		const max = up ? 300 : 30
		const outOfBound = up ? amount > max : amount < max

		setTempo(outOfBound ? max : amount)
	}

	const tempoBtns = (e: any, dir: string, sign: number, doAnything: boolean) => {
		// Cut fct short if not good platform
		if (!doAnything) return false

		if (dir === 'enter') {
			setChangedTempo(true)
			changeTempo(tempo + 1 * sign)

			buttonsInterval.current = setTimeout(
				() =>
					(buttonsInterval.current = setInterval(() => {
						changeTempo(tempoRef.current + 1 * sign)
					}, 70)),
				300
			)
		}

		if (dir === 'leave') {
			clearTimeout(buttonsInterval.current)
			clearInterval(buttonsInterval.current)

			if (changedTempo) {
				setChangedTempo(false)
				restart()
			}
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
			changeTempo(averageTempo)

			setTap(currTap)
			restart()
		}
	}

	return (
		<div className="tempo">
			<Wheel
				tempo={tempo}
				update={res => {
					changeTempo(res + 30)
					restart()
				}}
			></Wheel>

			<div>
				<button className="tap" onClick={tapTempo}>
					tap
				</button>

				<div className="tempo-buttons">
					<button
						className={tempo === 30 ? 'off' : ''}
						onTouchStart={e => tempoBtns(e, 'enter', -1, isMobileOnly)}
						onTouchEnd={e => tempoBtns(e, 'leave', -1, isMobileOnly)}
						onMouseDown={e => tempoBtns(e, 'enter', -1, isDesktop)}
						onMouseUp={e => tempoBtns(e, 'leave', -1, isDesktop)}
						onMouseLeave={e => tempoBtns(e, 'leave', -1, isDesktop)}
						onContextMenu={e => e.preventDefault()}
					>
						-
					</button>
					<button
						className={tempo === 300 ? 'off' : ''}
						onTouchStart={e => tempoBtns(e, 'enter', 1, isMobileOnly)}
						onTouchEnd={e => tempoBtns(e, 'leave', 1, isMobileOnly)}
						onMouseDown={e => tempoBtns(e, 'enter', 1, isDesktop)}
						onMouseUp={e => tempoBtns(e, 'leave', 1, isDesktop)}
						onMouseLeave={e => tempoBtns(e, 'leave', 1, isDesktop)}
						onContextMenu={e => e.preventDefault()}
					>
						+
					</button>
				</div>
			</div>
		</div>
	)
}

Tempo.propTypes = {
	restart: propTypes.func,
	wheelUpdate: propTypes.func,
	tempo: propTypes.number,
	setTempo: propTypes.func,
	tempoRef: propTypes.object,
}

export default Tempo
