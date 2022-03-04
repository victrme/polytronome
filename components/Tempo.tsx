import clamp from 'lodash/clamp'
import Wheel from './Wheel'

import { tempoList } from '../lib/utils'

const Tempo = ({ tempo, setTempo, tapTempo, toggleMetronome, moreSettings }) => {
	const handleTempo = (res: number) => {
		setTempo(clamp(res, 0, tempoList.length))
		toggleMetronome(true)
	}

	return (
		<div className="tempo">
			<Wheel
				type="tempo"
				state={tempo}
				animations={moreSettings.animations}
				update={res => handleTempo(res)}
			></Wheel>
			<button className="tap" onClick={tapTempo}>
				tap
			</button>
		</div>
	)
}

export default Tempo
