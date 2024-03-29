import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop, faRandom } from '@fortawesome/free-solid-svg-icons'

const Buttons = ({
	isRunning,
	handleMetronomeToggle,
	handleRandomizedLayers,
}: {
	isRunning: string
	handleMetronomeToggle: Function
	handleRandomizedLayers: Function
}) => {
	return (
		<div className="bottom-buttons">
			<button
				className="start"
				onClick={() => handleMetronomeToggle()}
				title={(isRunning ? 'stop' : 'start') + ' metronome'}
			>
				<FontAwesomeIcon icon={isRunning ? faStop : faPlay} />
				{isRunning ? 'stop' : 'start'}
			</button>

			<button
				className="randomize"
				title="shuffle metronome"
				onClick={() => handleRandomizedLayers()}
			>
				<FontAwesomeIcon icon={faRandom} />
				shuffle
			</button>
		</div>
	)
}

export default Buttons
