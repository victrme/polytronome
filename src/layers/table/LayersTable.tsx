import ControlRow from './ControlRow'

const LayersTable = ({ easy, layers, setLayers, restartMetronome }) => {
	return (
		<div className="layers-table-wrap">
			<div className="layers-table">
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

				<ControlRow
					layers={layers}
					setLayers={setLayers}
					restartMetronome={restartMetronome}
					easy={easy}
				></ControlRow>
			</div>
		</div>
	)
}

export default LayersTable
