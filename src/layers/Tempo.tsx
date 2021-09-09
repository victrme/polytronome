import { useState } from 'react'
import propTypes from 'prop-types'
import Wheel from '../inputs/Wheel'

const Tempo = ({ tempo, setTempo, tempoRef, restart }) => {
	const [tap, setTap] = useState([
		{
			date: 0,
			wait: 0,
		},
	])

	const changeTempo = (amount: number) => {
		const up = amount > tempo
		const max = up ? 300 : 30
		const outOfBound = up ? amount > max : amount < max

		setTempo(outOfBound ? max : amount)
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

			<button className="tap" onClick={tapTempo}>
				tap
			</button>
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
