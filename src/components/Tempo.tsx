import { clamp } from 'lodash'
import Wheel from './Wheel'

const Tempo = ({ tempo, setTempo, tapTempo, toggleMetronome }) => {
	const handleTempo = (res: number) => {
		setTempo(clamp(res + 30, 30, 300))
		toggleMetronome(true)
	}

	return (
		<div className="tempo">
			<Wheel type="tempo" state={tempo} update={res => handleTempo(res)}></Wheel>
			<button className="tap" onClick={tapTempo}>
				tap
			</button>
		</div>
	)
}

export default Tempo
