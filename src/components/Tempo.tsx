import { useState } from 'react'
import { clamp } from 'lodash'
import Wheel from './Wheel'

const Tempo = ({ tempo, setTempo, toggleMetronome }) => {
	const [tap, setTap] = useState([
		{
			date: 0,
			wait: 0,
		},
	])

	const changeTempo = (amount: number) => setTempo(clamp(amount, 30, 300))

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
			toggleMetronome(true)
		}
	}

	function handleUpdate(res) {
		changeTempo(res + 30)
		toggleMetronome(true)
	}

	return (
		<div className="tempo">
			<Wheel type="tempo" state={tempo} update={res => handleUpdate(res)}></Wheel>
			<button className="tap" onClick={tapTempo}>
				tap
			</button>
		</div>
	)
}

export default Tempo
