import Layer from '../types/layer'
import { setRandomID } from './utils'

export default function toggleMetronome({
	restart,
	isRunning,
	layers,
}: {
	layers: Layer[]
	isRunning: string
	restart?: boolean
}) {
	// const start = () => {
	// setIsRunning(setRandomID())
	// if (tutoStage === 'testLaunch') setTutoStage('waitLaunch')
	// }

	// const stop = () => {
	// if (tutoStage === 'waitLaunch') setTutoStage('showTempo')
	// }

	const beatsCounts = layers.map(l => l.beats).reduce((a, b) => a + b) - 5

	// No beats, only stops
	if (beatsCounts === 0) return ''

	// Restart, start on top of previous
	if (restart && isRunning) return setRandomID()

	// Simple toggle
	return isRunning === '' ? setRandomID() : ''
}
