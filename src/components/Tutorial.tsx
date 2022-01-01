import { useEffect } from 'react'
import Pizzicato from 'pizzicato'
import { Stage, Interaction } from '../Types'
import TutoFR from '../assets/tutorials/fr.json'

const Tutorial = ({ tutoStage, setTutoStage }) => {
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

	//
	// Buttons logic

	const stage: Stage = TutoFR[tutoStage] || { yes: '', no: '', text: '' }
	const buttons: JSX.Element[] = []

	const interactionButton = (choice: Interaction) => (
		<button key={choice.text} onClick={() => setTutoStage(choice.to)}>
			{choice.text}
		</button>
	)

	if (stage.yes) buttons.push(interactionButton(stage.yes))
	if (stage.no) buttons.push(interactionButton(stage.no))

	//
	// Effects

	// Play sound & remove tuto if necessary
	useEffect(() => {
		if (tutoStage === 'explainOk') setTimeout(() => setTutoStage('removed'), 1000)
		playNotifSound('test')
	}, [tutoStage, setTutoStage])

	// Only show tutorial if first time polytronoming
	useEffect(() => {
		if (!localStorage.sleep) setTimeout(() => setTutoStage('intro'), 1000)
		// eslint-disable-next-line
	}, [])

	return (
		<div
			className="tutorial"
			style={{ display: tutoStage === 'removed' ? 'none' : 'flex' }}
		>
			<div className="dialog">
				<p>{stage.text}</p>
			</div>
			<div className="interactions">{buttons}</div>
		</div>
	)
}

export default Tutorial
