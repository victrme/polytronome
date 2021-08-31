import Wheel from '../../inputs/Wheel'
import Range from '../../inputs/Range'
import Vectors from './Vectors'
import Octaves from './Octaves'

const ControlRow = ({ layers, setLayers, easy }) => {
	const changeClickType = (type: string, i: number) => {
		const clickTypeList = ['wood', 'drum', 'sine', 'triangle']
		const newLayers = [...layers]

		clickTypeList.forEach((x, ii) => {
			if (x === type) {
				newLayers[i].type = clickTypeList[(ii + 1) % clickTypeList.length]
				setLayers(newLayers)
			}
		})
	}

	const changeFreqs = (which: string, i: number, res?: number) => {
		const newLayers = [...layers]

		if (which === 'wave') newLayers[i].freq[which] = res
		else newLayers[i].freq[which] = (layers[i].freq[which] + 1) % 3

		setLayers(newLayers)
	}

	const list = layers.map((layer, i) => (
		<div className="ls-row" key={layer.id}>
			<Wheel
				beats={layer.beats}
				update={res => {
					const newLayers = [...layers]
					newLayers[i].beats = res + 1
					setLayers([...newLayers])
				}}
			></Wheel>

			{easy ? (
				''
			) : (
				<div className="ls-type">
					<Vectors
						type={layer.type}
						change={() => changeClickType(layer.type, i)}
					></Vectors>
				</div>
			)}

			{easy ? (
				''
			) : (
				<div className="ls-note">
					{layer.type === 'wood' ? (
						<div className="woodblocks" onClick={() => changeFreqs('wood', i)}>
							<div className={layer.freq.wood > -1 ? 'on' : ''}></div>
							<div className={layer.freq.wood > 0 ? 'on' : ''}></div>
							<div className={layer.freq.wood > 1 ? 'on' : ''}></div>
						</div>
					) : layer.type === 'drum' ? (
						<div className="drumset" onClick={() => changeFreqs('drum', i)}>
							<div>{layer.freq.drum}</div>
						</div>
					) : (
						<div className="notes-wrap">
							<Octaves freq={layer.freq.wave}></Octaves>
							<Wheel
								freq={layer.freq.wave}
								update={res => changeFreqs('wave', i, res)}
							></Wheel>

							<div className="note-length">
								<button
									title="Click duration"
									onClick={() => {
										const newLayers = [...layers]
										newLayers[i].duration = !newLayers[i].duration
										setLayers([...newLayers])
									}}
								>
									{layer.duration ? '.3*bpm' : '50ms'}
								</button>
								<button
									className={layer.release ? 'on' : ''}
									onClick={() => {
										const newLayers = [...layers]
										newLayers[i].release = !newLayers[i].release
										setLayers([...newLayers])
									}}
								>
									release
								</button>
							</div>
						</div>
					)}
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
