import { useEffect, useState } from 'react'
import Pizzicato from 'pizzicato'
import TutoFR from '../assets/tutorials/fr.json'

const Tutorial = ({ tutoStage, setTutoStage }) => {
	const [removeTuto, setRemoveTuto] = useState(false)

	const doNotShowTuto = () => removeTuto || (tutoStage === 'intro' && localStorage.sleep)

	const playNotifSound = (from: 'yes' | 'no' | 'test') => {
		const wave = new Pizzicato.Sound({
			source: 'wave',
			options: {
				type: 'sine',
				volume: 0.4,
				frequency: from === 'yes' ? 220 : from === 'no' ? 140 : 180,
				attack: 0.04,
				release: 0.4,
			},
		})

		wave.play()
		setTimeout(() => wave.stop(), 50)
	}

	useEffect(() => {
		if (tutoStage === 'explainOk') setTimeout(() => setRemoveTuto(true), 1000)
		playNotifSound('test')
	}, [tutoStage, setTutoStage])

	const { yes, no, text } = TutoFR[tutoStage] || { yes: '', no: '', text: '' }
	const buttons: JSX.Element[] = []

	const handleYay = () => {
		if (yes) {
			if (yes.to === false) setRemoveTuto(true)
			else setTutoStage(yes.to)
		}
	}

	const handleNay = () => {
		if (no) setTutoStage(no.to)
	}

	if (yes)
		buttons.push(
			<button key={'yes'} onClick={handleYay}>
				{yes.text}
			</button>
		)
	if (no)
		buttons.push(
			<button key={'no'} onClick={handleNay}>
				{no.text}
			</button>
		)

	return (
		<div className="tutorial" style={{ display: doNotShowTuto() ? 'none' : 'flex' }}>
			<div className="dialog">
				<p>{text}</p>
			</div>
			<div className="interactions">{buttons}</div>
		</div>
	)
}

export default Tutorial
