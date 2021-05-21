import Layers from './Layers'
import propTypes from 'prop-types'
import Wheel from './Wheel'
import Range from './Range'
import Vectors from './Vectors'
import Octaves from './Octaves'

const Principal = ({
	segment,
	layers,
	times,
	isRunning,
	launchMetronome,
	wheelUpdate,
	setLayers,
	updateLayer,
	randomizeLayers,
}) => {
	const changeRange = (index: number, num: number) => {
		const newLayers = [...layers]
		newLayers[index].volume = num
		setLayers(newLayers)
	}

	const changeFreqs = (which: string, i: number) => {
		const newLayers = [...layers]
		newLayers[i].freq[which] = (layers[i].freq[which] + 1) % 3
		setLayers(newLayers)
	}

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

	return (
		<div className="principal">
			<div className="title">
				<p>Train your polyrythms</p>
				<h1>Polytronome</h1>
			</div>

			<Layers times={times} layers={layers} segment={segment}></Layers>

			<div className="layers-table-wrap">
				<div className="layers-table">
					{layers.map((layer, i) => (
						<div className="ls-row" key={i}>
							<Wheel
								beats={layer.beats}
								update={result => wheelUpdate('beats', result, i)}
							></Wheel>

							<div className="ls-type">
								<Vectors
									type={layer.type}
									change={() => changeClickType(layer.type, i)}
								></Vectors>
							</div>

							{layer.type === 'wood' ? (
								<div
									className="woodblocks"
									onClick={() => changeFreqs('wood', i)}
								>
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
									<Wheel
										freq={layer.freq.wave}
										update={result => wheelUpdate('frequency', result, i)}
									></Wheel>
									<Octaves freq={layer.freq.wave}></Octaves>
								</div>
							)}

							<div>
								<Range
									volume={layer.volume}
									update={result => changeRange(i, result)}
								></Range>
							</div>
						</div>
					))}

					<div className="ls-row ls-labels">
						<div>beats</div>
						<div>type</div>
						<div>note</div>
						<div>volume</div>
					</div>
				</div>

				<div className="ls-buttons">
					<div className="layers-amount">
						<button onClick={() => updateLayer(false)}>-</button>
						<button onClick={() => updateLayer(true)}>+</button>
					</div>

					<button className="randomize" onClick={randomizeLayers}>
						⚂
					</button>
				</div>
			</div>

			<div className="start-button">
				<button onMouseDown={() => launchMetronome(isRunning)}>
					{isRunning ? 'Stop' : 'Start'}
				</button>
			</div>
		</div>
	)
}

Principal.propTypes = {
	isRunning: propTypes.bool.isRequired,
	times: propTypes.array.isRequired,
	segment: propTypes.any.isRequired,
	layers: propTypes.any.isRequired,
	launchMetronome: propTypes.func,
	wheelUpdate: propTypes.func.isRequired,
	updateLayer: propTypes.func.isRequired,
	setLayers: propTypes.func.isRequired,
	randomizeLayers: propTypes.func.isRequired,
}

export default Principal
