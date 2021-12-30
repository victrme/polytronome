import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faVolumeMute,
	faVolumeUp,
	faVolumeDown,
	faVolumeOff,
	IconDefinition,
} from '@fortawesome/free-solid-svg-icons'

import Wheel from './Wheel'
import Range from './Range'

const LayersTable = ({ easy, layers, selected, handleLayerChange }) => {
	//

	const release = ['off', 'short', 'long']
	const wavetypes = {
		sine: 'M 10 10 Q 20 -6 30 10 V 10 Q 40 26 50 10',
		triangle: 'M 10 10 L 20 2 L 40 18 L 50 10',
		sawtooth: 'M 10 10 L 30 2 V 18 L 50 10',
		square: 'M 10 2 H 30 V 18 H 50',
	}

	const volumeIconControl = (volume: number, muted: boolean): IconDefinition => {
		let icon = faVolumeUp

		if (muted) icon = faVolumeMute
		else if (volume < 0.2) icon = faVolumeOff
		else if (volume < 0.6) icon = faVolumeDown

		return icon
	}

	return (
		<div className="layers-table-wrap">
			<div className="layers-table">
				{layers.map((layer, i) => (
					<div
						className={
							'ls-row' +
							(selected === i ? ' selected ' : ' ') +
							(layer.beats === 0 ? ' off' : '')
						}
						key={layer.id}
					>
						<Wheel
							type="beats"
							state={layer.beats}
							update={(res: number) => handleLayerChange('beats', res, i)}
						></Wheel>

						{easy ? (
							''
						) : (
							<div className="ls-note">
								<div className="notes-wrap">
									<Wheel
										type="freq"
										state={layer.freq}
										update={res => handleLayerChange('freq', res, i)}
									></Wheel>
									<pre className="octave">
										{Math.floor((layer.freq - 1) / 12) + 1}
									</pre>
								</div>
							</div>
						)}

						{easy ? (
							''
						) : (
							<div
								title={'sound type'}
								className="ls-type"
								onClick={() =>
									handleLayerChange('wave', { type: layer.type, sign: 1 }, i)
								}
								onContextMenu={e => {
									e.preventDefault()
									handleLayerChange('wave', { type: layer.type, sign: -1 }, i)
								}}
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

						{easy ? (
							''
						) : (
							<div className="note-length">
								<button
									title="sound duration"
									onClick={() => handleLayerChange('duration', null, i)}
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
									{layer.duration ? '⅓ bpm' : '50ms'}
								</button>
								<button
									title="sound release"
									onClick={() => handleLayerChange('release', null, i)}
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

						{easy ? (
							''
						) : (
							<div title={'volume: ' + layer.volume} className="note-volume">
								<span
									title="mute"
									className="mute"
									onClick={() => handleLayerChange('mute', null, i)}
								>
									<FontAwesomeIcon
										icon={volumeIconControl(layer.volume, layer.muted)}
									/>
								</span>
								<Range
									volume={layer.volume}
									muted={layer.muted}
									update={(res: number) => handleLayerChange('vol', res, i)}
								></Range>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	)
}

export default LayersTable
