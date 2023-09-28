import Wheel from './Wheel'
import useTempoTap from '../hooks/useTempoTap'
import { useEffect } from 'react'

const Tempo = ({ tempo, handleTempo, moreSettings }) => {
	const [tappedTempo, setTappedTempo] = useTempoTap()

	useEffect(() => {
		if (tappedTempo) handleTempo(tappedTempo)
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
