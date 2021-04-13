import Pizzicato from 'pizzicato'

export default function actionSound() {
	const wave = new Pizzicato.Sound({
		source: 'wave',
		options: {
			type: 'sine',
			release: 0.05,
			volume: 0.1,
			frequency: 135,
			attack: 0,
		},
	})

	wave.play()
	setTimeout(() => wave.stop(), 20)
}
