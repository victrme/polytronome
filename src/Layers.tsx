import propTypes from 'prop-types'

const Layers = ({ moreSettings, layers, times }) => {
	return (
		<div className={`clicks ${moreSettings.segment.on ? 'isSegment' : 'isLayers'}`}>
			<div className="segment">
				<div className="click-row">
					{moreSettings.segment.ratios.map((ratio, i) => (
						<span
							key={i}
							className={
								'click' + (moreSettings.segment.count === i ? ' on' : '')
							}
							style={{
								width: `calc(${ratio * 100}% - 10px)`,
							}}
						/>
					))}
				</div>
			</div>
			<div className="layers">
				{layers.map((layer, row) => {
					// Add clicks for each layers

					const children: JSX.Element[] = []
					for (let beat = 0; beat < layer.beats; beat++) {
						children.push(
							<div
								key={beat}
								className={'click' + (beat < times[row] ? ' on' : '')}
							/>
						)
					}

					// Wrap in rows & return
					return (
						<div key={row} className="click-row">
							{children}
						</div>
					)
				})}
			</div>
		</div>
	)
}

Layers.propTypes = {
	times: propTypes.array.isRequired,
	moreSettings: propTypes.any.isRequired,
	layers: propTypes.any.isRequired,
}

export default Layers