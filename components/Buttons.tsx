import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop, faRandom } from '@fortawesome/free-solid-svg-icons'

const Buttons = ({ isRunning, toggleMetronome, randomizeLayers }) => {
	return (
		<div className="bottom-buttons">
			<button
				className="start"
				onClick={() => toggleMetronome()}
				title={(isRunning ? 'stop' : 'start') + ' metronome'}
			>
				<FontAwesomeIcon icon={isRunning ? faStop : faPlay} />
				{isRunning ? 'stop' : 'start'}
			</button>

			<button className="randomize" onClick={randomizeLayers} title="shuffle metronome">
				<FontAwesomeIcon icon={faRandom} />
				shuffle
			</button>
		</div>
	)
}

export default Buttons
