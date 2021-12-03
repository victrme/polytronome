import { useEffect, useState } from 'react'
import Pizzicato from 'pizzicato'

const Tutorial = ({ tutoStage, setTutoStage }) => {
	const [removeTuto, setRemoveTuto] = useState(false)

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

	const tutorial: any = {
		intro: {
			text: "Salut 👋 C'est ta premiere fois ici ?",
			yes: { to: 'nextIntro', text: 'Oui !' },
			no: { to: 'leaveIntro', text: 'Non' },
		},
		leaveIntro: {
			text: 'Ok, amuse-toi bien !',
			yes: { to: false, text: 'Merci' },
		},
		nextIntro: {
			text: "Tu veux que je t'explique comment ca marche ?",
			yes: { to: 'explainGoal', text: 'Je veux bien' },
			no: { to: 'leaveNextIntro', text: "Non c'est cool" },
		},
		leaveNextIntro: {
			text: 'Pas de soucis, tu peux toujours me retrouver dans le menu',
			yes: { to: false, text: 'Ok merci' },
		},
		explainGoal: {
			text: "Polytronome t'aide a visualiser different rythmes en meme temps",
			yes: { to: 'explainWheel', text: "D'accord" },
			no: { to: 'explainRythms', text: 'Comment ?' },
		},
		explainRythms: {
			text: 'Avec les cliques que tu vois juste la au milieu, les lignes se remplissent a la meme vitesse',
			yes: { to: 'explainWheel', text: "Ah d'accord c'est cool" },
			no: { to: 'explainBeep', text: 'Toujours pas compris' },
		},
		explainBeep: {
			text: 'Ca fait beep boop, beep beep beep quoi',
			yes: { to: 'explainWheel', text: 'merci compris a 100%' },
			no: { to: 'explainEnerve', text: 'hmm...' },
		},
		explainEnerve: {
			text: 'Genre ta pas compris ?',
			yes: { to: 'explainBeep', text: 'je te jure' },
			no: { to: 'explainOk', text: 'C bon je te taquine' },
		},
		explainOk: {
			text: 'ok 😭',
		},
		explainWheel: {
			text: 'Tu peux changer de temps en faisant dérouler les chiffres plus bas',
			yes: { to: 'testBeats', text: 'Compris' },
		},
		testBeats: {
			text: 'Pour commencer, fais moi donc un 5 temps sur 7',
		},
		testLaunch: { text: 'Parfait 😄 Lance le metronome !' },
		waitLaunch: { text: 'Parfait 😄 Lance le metronome !' },
		testTempo: { text: 'Tu aussi modifier le tempo, tu peux le baisser à 60 ?' },
		endEasy: {
			text: 'Voila pour les bases ! Tu peux tirer les boutons à gauche pour acceder au menu',
			yes: { to: false, text: 'Merci, a plus' },
		},
	}

	useEffect(() => {
		if (tutoStage === 'explainOk') setTimeout(() => setRemoveTuto(true), 1000)
		playNotifSound('test')
	}, [tutoStage, setTutoStage])

	const { yes, no, text } = tutorial[tutoStage] || { yes: '', no: '', text: '' }
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
		<div className="tutorial" style={{ display: removeTuto ? 'none' : 'flex' }}>
			<div className="dialog">
				<p>{text}</p>
			</div>
			<div className="interactions">{buttons}</div>
		</div>
	)
}

export default Tutorial
