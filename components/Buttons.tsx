import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop, faRandom } from '@fortawesome/free-solid-svg-icons'

const Buttons = ({ toggle, isRunning, toggleMetronome, randomizeLayers }) => {
	return toggle ? (
		<div className="bottom-buttons">
			<button className="start" onClick={() => toggleMetronome()}>
				<FontAwesomeIcon icon={isRunning ? faStop : faPlay} />
				{isRunning ? 'stop' : 'start'}
			</button>

			<div>
				<button className="randomize" onClick={randomizeLayers}>
					<FontAwesomeIcon icon={faRandom} />
					shuffle
				</button>
			</div>
		</div>
	) : (
		<></>
	)
}

export default Buttons
