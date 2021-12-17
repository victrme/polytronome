import Wheel from './Wheel'
import Range from './Range'
import { useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeMute, faVolumeUp } from '@fortawesome/free-solid-svg-icons'

const EffectIcon = ({ type }): JSX.Element => {
	const props = {
		release: { view: '1 1 8 6', path: 'M 2 2 V 6 M 2 2 Q 3 6 8 6' },
		duration: { view: '1 1 10 6', path: 'M 2 2 V 6 M 2 4 H 10' },
	}
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox={props[type].view}>
			<path
				d={props[type].path}
				stroke="var(--accent)"
				strokeWidth="1"
				strokeLinecap="round"
				fill="none"
			/>
		</svg>
	)
}

const LayersTable = ({ easy, layers, setLayers, toggleMetronome }) => {
	//

	const release = ['off', 'short', 'long']
	const wavetypes = {
		sine: 'M 10 10 Q 20 -6 30 10 V 10 Q 40 26 50 10',
		triangle: 'M 10 10 L 20 2 L 40 18 L 50 10',
		sawtooth: 'M 10 10 L 30 2 V 18 L 50 10',
		square: 'M 10 2 H 30 V 18 H 50',
	}

	const handleNote = (which: string, i: number) => {
		const newLayers = [...layers]

		if (which === 'release') newLayers[i].release = (newLayers[i].release + 1) % 3
		else newLayers[i].duration = !newLayers[i].duration

		setLayers([...newLayers])
	}

	const handleLayerChange = useCallback(
		(cat: string, result: any, index: number) => {
			let newLayers = [...layers]

			switch (cat) {
				case 'wave': {
					const clickTypeList = ['triangle', 'sawtooth', 'square', 'sine']
					clickTypeList.forEach((x, _i) => {
						if (x === result.type) {
							const nextIndex = {
								neg: _i === 0 ? clickTypeList.length - 1 : _i - 1,
								pos: _i === clickTypeList.length - 1 ? 0 : _i + 1,
							}

							newLayers[index].type =
								clickTypeList[
									result.sign === -1 ? nextIndex.neg : nextIndex.pos
								]
						}
					})
					break
				}

				case 'beats': {
					newLayers[index].beats = result + 1
					break
				}

				case 'freq':
					newLayers[index].freq = result + 1
					break

				case 'mute':
					newLayers[index].muted = !newLayers[index].muted
					break

				case 'vol':
					newLayers[index].volume = result
					break
			}

			setLayers(newLayers)
			if (cat === 'beats') toggleMetronome(true)
		},
		[toggleMetronome, layers, setLayers]
	)

	return (
		<div className="layers-table-wrap">
			<div className="layers-table">
				{layers.map((layer, i) => (
					<div
						className={'ls-row' + (layer.beats === 1 ? ' off' : '')}
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
										{Math.floor(layer.freq / 12) + 1}
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
									onClick={() => handleNote('duration', i)}
								>
									<EffectIcon type={'duration'} />
									{layer.duration ? '⅓ bpm' : '50ms'}
								</button>
								<button
									title="sound release"
									onClick={() => handleNote('release', i)}
								>
									<EffectIcon type={'release'} />
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
										icon={layer.muted ? faVolumeMute : faVolumeUp}
									/>
								</span>
								<Range
									volume={layer.volume}
									muted={layer.muted}
									update={res => handleLayerChange('vol', res, i)}
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
