import Wheel from './Wheel'
import Range from './Range'
import { useCallback } from 'react'

const LayersTable = ({ easy, layers, setLayers, restartMetronome }) => {
	//

	const wavetypes = {
		sine: 'M 10 10 Q 20 -6 30 10 V 10 Q 40 26 50 10',
		triangle: 'M 10 10 L 20 2 L 40 18 L 50 10',
		sawtooth: 'M 10 10 L 30 2 V 18 L 50 10',
		square: 'M 10 2 H 30 V 18 H 50',
	}

	const handleLayerChange = useCallback(
		(cat: 'wave' | 'beats' | 'freq', res: any, index: number) => {
			let newLayers = [...layers]

			switch (cat) {
				case 'wave': {
					const clickTypeList = ['triangle', 'sawtooth', 'square', 'sine']
					clickTypeList.forEach((x, _i) => {
						if (x === res.type) {
							const nextIndex = {
								neg: _i === 0 ? clickTypeList.length - 1 : _i - 1,
								pos: _i === clickTypeList.length - 1 ? 0 : _i + 1,
							}

							newLayers[index].type =
								clickTypeList[res.sign === -1 ? nextIndex.neg : nextIndex.pos]
						}
					})
					break
				}

				case 'beats': {
					newLayers[index].beats = res + 1
					break
				}

				case 'freq':
					newLayers[index].freq = res
					break
			}

			setLayers(newLayers)
			if (cat === 'beats') restartMetronome()
		},
		[layers, setLayers, restartMetronome]
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
							beats={layer.beats}
							update={res => handleLayerChange('beats', res, i)}
						></Wheel>

						{easy ? (
							''
						) : (
							<div className="ls-note">
								<div className="notes-wrap">
									<Wheel
										freq={layer.freq}
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
								className="ls-type"
								onClick={() =>
									handleLayerChange('wave', { type: layer.type, sign: 1 }, i)
								}
								onContextMenu={e => {
									e.preventDefault()
									handleLayerChange('wave', { type: layer.type, sign: -1 }, i)
								}}
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="8 0 44 20">
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
									title="Click duration"
									onClick={() => {
										const newLayers = [...layers]
										newLayers[i].duration = !newLayers[i].duration
										setLayers([...newLayers])
									}}
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
									className={layer.release ? 'on' : ''}
									onClick={() => {
										const newLayers = [...layers]
										newLayers[i].release = !newLayers[i].release
										setLayers([...newLayers])
									}}
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
									{layer.release ? 'on' : 'off'}
								</button>
							</div>
						)}

						{easy ? (
							''
						) : (
							<div>
								<Range
									volume={layer.volume}
									setLayers={setLayers}
									layers={layers}
									i={i}
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
