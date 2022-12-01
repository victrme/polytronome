import clamp from 'lodash/clamp'
import Wheel from './Wheel'
import { tempoList } from '../lib/utils'
import useTempoTap from '../hooks/useTempoTap'
import { useEffect } from 'react'

const Tempo = ({ tempo, setTempo, moreSettings, restartMetronome }) => {
	const [tappedTempo, setTappedTempo] = useTempoTap()

	const handleTempo = (res: number) => {
		setTempo(clamp(res, 0, tempoList.length))
		restartMetronome()
	}

	useEffect(() => {
		if (tappedTempo) {
			setTempo(tappedTempo)
			restartMetronome()
		}
	}, [tappedTempo])

	return (
		<div className="tempo">
			<Wheel
				type="tempo"
				state={tempo}
				animations={moreSettings.animations}
				update={res => handleTempo(res)}
			></Wheel>
			<button className="tap" onClick={() => setTappedTempo()} title="tap tempo">
				tap
			</button>
		</div>
	)
}

export default Tempo
