import Wheel from '../../inputs/Wheel'
import Range from '../../inputs/Range'
import Octaves from './Octaves'

const ControlRow = ({ layers, setLayers, restartMetronome, easy }) => {
	const changeClickType = (type: string, i: number, sign: number) => {
		const clickTypeList = ['triangle', 'sawtooth', 'square', 'sine']
		const newLayers = [...layers]

		clickTypeList.forEach((x, _i) => {
			if (x === type) {
				const nextIndex = {
					neg: _i === 0 ? clickTypeList.length - 1 : _i - 1,
					pos: _i === clickTypeList.length - 1 ? 0 : _i + 1,
				}

				newLayers[i].type = clickTypeList[sign === -1 ? nextIndex.neg : nextIndex.pos]
				setLayers(newLayers)
			}
		})
	}

	const changeFreqs = (i: number, res?: number) => {
		let newLayers = [...layers]
		newLayers[i].freq = res

		setLayers(newLayers)
	}

	const changeBeats = (res: number, i: number) => {
		let newLayers = [...layers]
		newLayers[i].beats = res + 1

		setLayers([...newLayers])
		restartMetronome()
	}

	const wavetypes = {
		sine: 'M 10 10 Q 20 -6 30 10 V 10 Q 40 26 50 10',
		triangle: 'M 10 10 L 20 2 L 40 18 L 50 10',
		sawtooth: 'M 10 10 L 30 2 V 18 L 50 10',
		square: 'M 10 2 H 30 V 18 H 50',
	}

	const list = layers.map((layer, i) => (
		<div className={'ls-row' + (layer.beats === 1 ? ' off' : '')} key={layer.id}>
			<Wheel beats={layer.beats} update={res => changeBeats(res, i)}></Wheel>

			{easy ? (
				''
			) : (
				<div
					className="ls-type"
					onClick={() => changeClickType(layer.type, i, 1)}
					onContextMenu={e => {
						e.preventDefault()
						changeClickType(layer.type, i, -1)
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
				<div className="ls-note">
					<div className="notes-wrap">
						<div className="note-length">
							<button
								title="Click duration"
								className={layer.duration ? 'on' : ''}
								onClick={() => {
									const newLayers = [...layers]
									newLayers[i].duration = !newLayers[i].duration
									setLayers([...newLayers])
								}}
							>
								∼
							</button>
							<button
								className={layer.release ? 'on' : ''}
								onClick={() => {
									const newLayers = [...layers]
									newLayers[i].release = !newLayers[i].release
									setLayers([...newLayers])
								}}
							>
								↪
							</button>
						</div>

						<Octaves freq={layer.freq}></Octaves>
						<Wheel freq={layer.freq} update={res => changeFreqs(i, res)}></Wheel>
					</div>
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
	))

	return list
}

export default ControlRow
