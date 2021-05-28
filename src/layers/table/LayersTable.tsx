import ControlRow from './ControlRow'

const LayersTable = ({ easy, layers, setLayers, updateLayer, restartMetronome }) => {
	const randomizeLayers = () => {
		const rand = (a: number, b: number) => Math.random() * (b - a) + a

		const newLayers = [...layers]
		newLayers.forEach((l, i) => (newLayers[i].beats = +rand(2, 16).toFixed(0)))
		setLayers([...newLayers])
		restartMetronome()
	}

	return (
		<div className="layers-table-wrap">
			<div className="layers-table">
				{easy ? (
					<div className="ls-row ls-labels">
						<div>beats</div>
					</div>
				) : (
					''
				)}

				<ControlRow layers={layers} setLayers={setLayers} easy={easy}></ControlRow>

				{easy ? (
					''
				) : (
					<div className="ls-row ls-labels">
						<div>beats</div>
						<div>type</div>
						<div>note</div>
						<div>volume</div>
					</div>
				)}
			</div>

			<div className="ls-buttons">
				<button className="randomize" onClick={randomizeLayers}>
					{easy ? 'shuffle' : '🎲'}
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
	)
}

export default LayersTable
