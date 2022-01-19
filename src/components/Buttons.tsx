import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop, faRandom } from '@fortawesome/free-solid-svg-icons'
import { isSafari, isIOS } from 'react-device-detect'
import Pizzicato from 'pizzicato'
import { useState } from 'react'

const Buttons = ({ isRunning, toggleMetronome, randomizeLayers }) => {
	const [sndOn, setSndOn] = useState(0)

	const activateSound = () => {
		const sound = new Pizzicato.Sound({
			source: 'wave',
			options: {
				type: 'sine',
				volume: 1,
				frequency: 220,
				attack: 0.03,
				release: 0.2,
			},
		})

		var analyser = Pizzicato.context.createAnalyser()
		sound.connect(analyser)
		sound.play()

		setSndOn(sndOn + 1)
		console.log(analyser)

		setTimeout(() => sound.stop(), 200)
	}
	return (
		<div className="bottom-buttons">
			{/* Users need gesture to activate sound on Apple browsers */}
			{isIOS || isSafari ? (
				<button
					style={{ display: sndOn === 2 ? 'none' : 'flex' }}
					onClick={activateSound}
				>
					<span>{sndOn === 0 ? 'activate sound' : 'click again'}</span>
				</button>
			) : (
				''
			)}

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
