import { useEffect, useState, useCallback } from 'react'
import { clamp } from 'lodash'
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

	const handleLayerChange = useCallback(
		(cat: string, result: any, index: number) => {
			let newLayers = [...layers]
			let thisLayer = newLayers[index]

			if (thisLayer) {
				switch (cat) {
					case 'wave': {
						const clickTypeList = ['triangle', 'sawtooth', 'square', 'sine']
						clickTypeList.forEach((x, _i) => {
							if (x === result.type) {
								const nextIndex = {
									neg: _i === 0 ? clickTypeList.length - 1 : _i - 1,
									pos: _i === clickTypeList.length - 1 ? 0 : _i + 1,
								}

								thisLayer.type =
									clickTypeList[
										result.sign === -1 ? nextIndex.neg : nextIndex.pos
									]
							}
						})
						break
					}

					case 'beats': {
						thisLayer.beats = result + 1
						break
					}

					case 'freq':
						thisLayer.freq = result + 1
						break

					case 'duration':
						thisLayer.duration = !thisLayer.duration
						break

					case 'release':
						thisLayer.release = (thisLayer.release + 1) % 3
						break

					case 'mute':
						thisLayer.muted = !thisLayer.muted
						break

					case 'vol':
						thisLayer.volume = result
						break
				}

				newLayers[index] = thisLayer
				setLayers(newLayers)
				if (cat === 'beats') toggleMetronome(true)
			}
		},
		[toggleMetronome, layers, setLayers]
	)

	//
	// Keybinds
	//

	const [selected, setSelected] = useState(-1)

	useEffect(() => {
		function handleKeyMapping(e: KeyboardEvent) {
			// Lose focus before firing, (like a preventDefault)
			// Not preventDefault, because it would prevent
			// Browser accessibility keybindings
			if (document.activeElement) {
				const el = document.activeElement as HTMLButtonElement
				el.blur()
			}

			console.log(e.code)

			const bindings = [
				{ key: 'Escape', cat: 'select', val: -1 },
				{ key: 'Digit1', cat: 'select', val: 0 },
				{ key: 'Digit2', cat: 'select', val: 1 },
				{ key: 'Digit3', cat: 'select', val: 2 },
				{ key: 'Digit4', cat: 'select', val: 3 },
				{ key: 'Digit5', cat: 'select', val: 4 },
				{ key: 'ArrowRight', cat: 'select', val: (selected + 1) % 5 },
				{ key: 'ArrowLeft', cat: 'select', val: selected === 0 ? 4 : selected - 1 },
				{ key: 'KeyA', cat: 'freq', val: 0 },
				{ key: 'KeyW', cat: 'freq', val: 1 },
				{ key: 'KeyS', cat: 'freq', val: 2 },
				{ key: 'KeyE', cat: 'freq', val: 3 },
				{ key: 'KeyD', cat: 'freq', val: 4 },
				{ key: 'KeyF', cat: 'freq', val: 5 },
				{ key: 'KeyT', cat: 'freq', val: 6 },
				{ key: 'KeyG', cat: 'freq', val: 7 },
				{ key: 'KeyY', cat: 'freq', val: 8 },
				{ key: 'KeyH', cat: 'freq', val: 9 },
				{ key: 'KeyU', cat: 'freq', val: 10 },
				{ key: 'KeyJ', cat: 'freq', val: 11 },
				{ key: 'KeyZ', cat: 'octave', val: -1 },
				{ key: 'KeyX', cat: 'octave', val: 1 },
				{ key: 'KeyB', cat: 'volume', val: -0.1 },
				{ key: 'KeyN', cat: 'volume', val: 0.1 },
				{ key: 'KeyM', cat: 'mute', val: 1 },
				{ key: 'ArrowUp', cat: 'beats', val: 1 },
				{ key: 'ArrowDown', cat: 'beats', val: -1 },
			]

			// Finds corresponding key
			const hitKey = bindings.filter(elem => elem.key === e.code)[0]
			if (hitKey !== undefined) {
				//
				// Keybinds when focused on layers
				if (selected > -1) {
					let layer = layers[selected]

					// 0, 12, 24 ...etc
					const octavedFreq = Math.floor((layer.freq - 1) / 12) * 12

					const filteredVals = {
						beats: clamp(layer.beats - 1 + hitKey.val, 0, 15),
						freq: clamp(octavedFreq + hitKey.val, 0, 47),
						octave: clamp(12 * hitKey.val + layer.freq - 1, 0, 47),
						volume: clamp(layer.volume + hitKey.val, 0, 1),
						mute: !layer.muted,
					}

					handleLayerChange(hitKey.cat, filteredVals[hitKey.cat], selected)
				}

				// (Maybe) Keybinds only used when not focused on layers
				else {
				}

				// Keybinds that works anywhere
				if (hitKey.cat === 'select') setSelected(hitKey.val)
			}
		}

		// Retire event when effect dies
		const removeEvent = () => window.removeEventListener('keydown', handleKeyMapping)
		window.addEventListener('keydown', handleKeyMapping)
		return removeEvent

		// eslint-disable-next-line
	}, [selected, layers])

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
							(layer.beats === 1 ? ' off' : '')
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
									<EffectIcon type={'duration'} />
									{layer.duration ? '⅓ bpm' : '50ms'}
								</button>
								<button
									title="sound release"
									onClick={() => handleLayerChange('release', null, i)}
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
