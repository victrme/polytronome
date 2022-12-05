import { animated, useTransition, config } from '@react-spring/web'
import { useEffect } from 'react'
import Pizzicato from 'pizzicato'

import Dialog from '../public/assets/tutorials/en.json'
import { Stage, Interaction } from '../types/tutorial'

const Tutorial = ({ tutoStage, setTutoStage }) => {
	const toggle = tutoStage !== 'removed'

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

	const transition = useTransition(toggle, {
		from: { scale: 0.9, opacity: 0 },
		enter: { scale: 1, opacity: 1 },
		leave: { scale: 0.9, opacity: 0 },
		reverse: toggle,
		config: config.stiff,
	})

	//
	// Buttons logic

	const stage: Stage = Dialog[tutoStage] || { yes: '', no: '', text: '' }
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

	// Play sound
	useEffect(() => playNotifSound('test'), [tutoStage])

	return transition(
		(styles, item) =>
			item && (
				<animated.div className="tutorial" style={styles}>
					<div className="dialog">
						<p>{stage.text}</p>
					</div>
					<div className="interactions">{buttons}</div>
				</animated.div>
			)
	)
}

export default Tutorial
