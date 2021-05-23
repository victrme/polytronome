import Layers from './Layers'
import propTypes from 'prop-types'
import Wheel from './Wheel'
import Range from './Range'
import Vectors from './Vectors'
import Octaves from './Octaves'
import Tempo from './Tempo'

const Principal = ({
	segment,
	layers,
	times,
	isRunning,
	launchMetronome,
	moreSettings,
	wheelUpdate,
	setLayers,
	updateLayer,
	randomizeLayers,
	restartMetronome,
	changeTempo,
	tempo,
	tempoRef,
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

	const LayerType = ({ layer, i }) => {
		let result: any = <div></div>

		if (layer.type === 'wood') {
			result = (
				<div className="woodblocks" onClick={() => changeFreqs('wood', i)}>
					<div className={layer.freq.wood > -1 ? 'on' : ''}></div>
					<div className={layer.freq.wood > 0 ? 'on' : ''}></div>
					<div className={layer.freq.wood > 1 ? 'on' : ''}></div>
				</div>
			)
		}

		if (layer.type === 'drum') {
			result = (
				<div className="drumset" onClick={() => changeFreqs('drum', i)}>
					<div>{layer.freq.drum}</div>
				</div>
			)
		}

		if (layer.type === 'sine' || layer.type === 'triangle') {
			result = (
				<div className="notes-wrap">
					<Wheel
						freq={layer.freq.wave}
						update={result => wheelUpdate('frequency', result, i)}
					></Wheel>
					<Octaves freq={layer.freq.wave}></Octaves>
				</div>
			)
		}

		return result
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
					{moreSettings.all ? (
						''
					) : (
						<div className="ls-row ls-labels">
							<div>beats</div>
						</div>
					)}

					{layers.map((layer, i) => (
						<div className="ls-row" key={i}>
							<Wheel
								beats={layer.beats}
								update={result => wheelUpdate('beats', result, i)}
							></Wheel>

							{moreSettings.all ? (
								<div className="ls-type">
									<Vectors
										type={layer.type}
										change={() => changeClickType(layer.type, i)}
									></Vectors>
								</div>
							) : (
								''
							)}

							{moreSettings.all ? (
								<LayerType layer={layer} i={i}></LayerType>
							) : (
								''
							)}

							{moreSettings.all ? (
								<div>
									<Range
										volume={layer.volume}
										update={result => changeRange(i, result)}
									></Range>
								</div>
							) : (
								''
							)}
						</div>
					))}

					{moreSettings.all ? (
						<div className="ls-row ls-labels">
							<div>beats</div>
							<div>type</div>
							<div>note</div>
							<div>volume</div>
						</div>
					) : (
						''
					)}
				</div>

				<div className="ls-buttons">
					<button className="randomize" onClick={randomizeLayers}>
						shuffle
					</button>
					<div className="plus-minus">
						<button
							className={layers.length === 1 ? 'off' : ''}
							onClick={() => updateLayer(false)}
						>
							-
						</button>
						<button
							className={layers.length === 4 ? 'off' : ''}
							onClick={() => updateLayer(true)}
						>
							+
						</button>
					</div>
				</div>
			</div>

			<div className="tempo-n-start">
				<Tempo
					restart={restartMetronome}
					update={changeTempo}
					wheelUpdate={wheelUpdate}
					tempo={tempo}
					tempoRef={tempoRef}
				></Tempo>

				<div className="start-button">
					<button onMouseDown={() => launchMetronome(isRunning)}>
						{isRunning ? 'Stop' : 'Start'}
					</button>
				</div>
			</div>

			<div className="links">
				<a href="https://docs.polytronome.com">documentation</a>
				<a href="https://github.com/victrme/polytronome">source code</a>
				<a href="https://victr.me">created by victr.me</a>
			</div>
		</div>
	)
}

Principal.propTypes = {
	isRunning: propTypes.bool.isRequired,
	times: propTypes.array.isRequired,
	segment: propTypes.object.isRequired,
	layers: propTypes.array.isRequired,
	moreSettings: propTypes.object.isRequired,
	launchMetronome: propTypes.func,
	wheelUpdate: propTypes.func.isRequired,
	updateLayer: propTypes.func.isRequired,
	setLayers: propTypes.func.isRequired,
	randomizeLayers: propTypes.func.isRequired,
	restartMetronome: propTypes.func.isRequired,
	changeTempo: propTypes.func.isRequired,
	tempo: propTypes.number.isRequired,
	tempoRef: propTypes.object.isRequired,
}

export default Principal
