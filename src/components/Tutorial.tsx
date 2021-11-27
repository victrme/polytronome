import { useState } from 'react'

const Tutorial = ({ tutoStage, setTutoStage }) => {
	const [leave, setLeave] = useState(false)
	const tutorial: {
		text: string
		yay?: string
		nay?: string
		leave?: number
	}[] = [
		{
			text: "Salut 👋 C'est ta premiere fois ici ?",
			yay: 'Oui !',
			nay: 'Non',
			leave: 0,
		},
		{
			text: "Tu veux que je t'explique comment ca marche ?",
			yay: 'Je veux bien',
			nay: "Non c'est cool",
			leave: 1,
		},
		{ text: "Polyrtonome t'aide a visualiser les polytythmes", yay: "D'accord" },
		{
			text: 'Tu peux changer de temps en faisant dérouler les chiffres plus bas',
			yay: 'Compris',
		},
		{ text: 'Pour commencer, fais moi donc un 5 temps sur 7' },
		{ text: 'Parfait, lance le metronome. Stop quand tu veux' },
		{ text: 'Le tempo est à gauche, tu peux le baisser à 60 ?' },
		{ text: 'Rajoute maintenant un rhytme de 12 temps, et ecoutons ca' },
		{ text: 'Tu peux tirer les boutons à gauche pour acceder au menu' },
	]

	const tutoLeave = [
		'Ok, amuse-toi bien !',
		'Pas de soucis, tu peux toujours me retrouver dans le menu',
		"C'est pas exactement ça",
	]

	// useEffect(() => {
	// 	if (leave) setLeave(false)
	// }, [leave])

	return (
		<div className="tutorial">
			<div className="dialog">
				<p>
					{leave
						? tutoLeave[tutorial[tutoStage].leave || 0]
						: tutorial[tutoStage].text}
				</p>
			</div>
			{leave ? (
				''
			) : (
				<div className="interactions">
					{tutorial[tutoStage].yay ? (
						<button onClick={() => setTutoStage(tutoStage + 1)}>
							{tutorial[tutoStage].yay}
						</button>
					) : (
						''
					)}
					{tutorial[tutoStage].nay ? (
						<button onClick={() => setLeave(true)}>
							{tutorial[tutoStage].nay}
						</button>
					) : (
						''
					)}
				</div>
			)}
		</div>
	)
}

export default Tutorial
