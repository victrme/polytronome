import clamp from 'lodash/clamp'
import Wheel from './Wheel'

const Tempo = ({ tempo, setTempo, tapTempo, toggleMetronome, moreSettings }) => {
	const handleTempo = (res: number) => {
		setTempo(clamp(res + 30, 30, 300))
		toggleMetronome(true)
	}

	return (
		<div className="tempo">
			<Wheel
				type="tempo"
				state={tempo}
				noAnim={moreSettings.animations}
				update={res => handleTempo(res)}
			></Wheel>
			<button className="tap" onClick={tapTempo}>
				tap
			</button>
		</div>
	)
}

export default Tempo
