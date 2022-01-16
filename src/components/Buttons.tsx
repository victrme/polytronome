import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop, faRandom } from '@fortawesome/free-solid-svg-icons'
import { isMobileOnly } from 'react-device-detect'
import Tempo from './Tempo'

const Buttons = ({ isRunning, tempoProps, toggleMetronome, randomizeLayers }) => {
	return (
		<div className="bottom-buttons">
			{isMobileOnly ? <Tempo {...tempoProps}></Tempo> : ''}

			<button className="start" onClick={() => toggleMetronome()}>
				<FontAwesomeIcon icon={isRunning ? faStop : faPlay} />
				<span>{isRunning ? 'stop' : 'start'}</span>
			</button>

			<div>
				<button className="randomize" onClick={randomizeLayers}>
					<FontAwesomeIcon icon={faRandom} />
					<span>shuffle</span>
				</button>
			</div>
		</div>
	)
}

export default Buttons
