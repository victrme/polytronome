import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faVolumeMute,
	faVolumeUp,
	faVolumeDown,
	faVolumeOff,
} from '@fortawesome/free-solid-svg-icons'

import Wheel from './Wheel'
import Range from './Range'
import Layer from '../types/layer'

const LayersTable = ({ Tempo, layers, selected, isForMobile, updateLayers, moreSettings }) => {
	const { easy, animations } = moreSettings
	const release = ['off', 'short', 'long']
	const wavetypes = [
		'M 10 10 Q 20 -6 30 10 V 10 Q 40 26 50 10', // sine
		'M 10 10 L 20 2 L 40 18 L 50 10', // triangle
		'M 10 10 L 30 2 V 18 L 50 10', // sawtooth
		'M 10 2 H 30 V 18 H 50', // square
	]
	const durations = {
		'50': '50ms',
		'0.25': '1/4',
		'0.33': '1/3',
		'0.5': 'half',
		'0.75': '3/4',
		'0.97': 'full',
	}

	return (
		<>
			<div className="layers-table">
				{layers.map((layer: Layer, i: number) => (
					<div
						className={
							'ls-row' +
							(selected === i ? ' selected ' : ' ') +
							(layer.beats === 1 ? ' off' : '')
						}
						key={layer.id}
					>
						<div className="ls-beats">
							<Wheel
								type="beats"
								animations={animations}
								state={layer.beats}
								update={(res: number) => updateLayers('beats', res, i)}
							></Wheel>
						</div>

						{!easy && (
							<div className="ls-note">
								<div className="notes-wrap">
									<Wheel
										type="freq"
										animations={animations}
										state={layer.freq}
										update={res => updateLayers('freq', res, i)}
									></Wheel>
									<pre className="octave">
										{Math.floor(layer.freq / 12) + 1}
									</pre>
								</div>
							</div>
						)}

						{!easy && (
							<div
								title="sound type"
								className="ls-type"
								onClick={() => updateLayers('wave', 1, i)}
							>
								<svg
									type="svg"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="8 0 44 20"
								>
									<path
										d={wavetypes[layer.type]}
										fill="none"
										stroke="var(--accent)"
										strokeWidth="4"
										strokeLinecap="round"
									/>
								</svg>
							</div>
						)}

						{!easy && (
							<div className="ls-effects">
								<button
									title="sound duration"
									onClick={() => updateLayers('duration', layer.duration, i)}
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="1 1 10 6">
										<path
											d="M 2 2 V 6 M 2 4 H 10"
											stroke="var(--accent)"
											strokeWidth="1"
											strokeLinecap="round"
											fill="none"
										/>
									</svg>
									{durations[layer.duration]}
								</button>
								<button
									title="sound release"
									onClick={() => updateLayers('release', null, i)}
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="1 1 8 6">
										<path
											d="M 2 2 V 6 M 2 2 Q 3 6 8 6"
											stroke="var(--accent)"
											strokeWidth="1"
											strokeLinecap="round"
											fill="none"
										/>
									</svg>
									{release[layer.release]}
								</button>
							</div>
						)}

						{!easy && (
							<div title={'volume: ' + layer.volume} className="ls-volume">
								<span
									title="mute"
									className="mute"
									onClick={() => updateLayers('mute', null, i)}
								>
									<FontAwesomeIcon
										icon={
											layer.muted
												? faVolumeMute
												: layer.volume < 0.2
												? faVolumeOff
												: layer.volume < 0.6
												? faVolumeDown
												: faVolumeUp
										}
									/>
								</span>
								<Range
									volume={layer.volume}
									muted={layer.muted}
									update={(res: number) => updateLayers('vol', res, i)}
								></Range>
							</div>
						)}
					</div>
				))}
			</div>

			{isForMobile && Tempo}
		</>
	)
}

export default LayersTable
