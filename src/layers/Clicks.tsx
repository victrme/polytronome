import propTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'

const Clicks = ({ segment, layers, times }) => {
	const clicksRef = useRef(document.createElement('div'))
	const [lateSegmentChange, setLateSegmentChange] = useState(false)

	const result = lateSegmentChange ? (
		<div className="segment">
			<div className="click-row">
				{segment.ratios.map((ratio, i) => (
					<span
						key={i}
						className={'click' + (segment.count === i ? ' on' : '')}
						style={{
							width: `calc(${ratio * 100}% - 10px)`,
						}}
					/>
				))}
			</div>
		</div>
	) : (
		<div className="layers">
			{layers.map((layer, row) => {
				// Add clicks for each layers

				const children: JSX.Element[] = []
				for (let beat = 0; beat < 16; beat++) {
					children.push(
						<div
							key={beat}
							className={
								'click' +
								(beat >= layer.beats ? ' off' : beat < times[row] ? ' on' : '')
							}
						/>
					)
				}

				// Wrap in rows & return
				return (
					<div key={row} className={'click-row' + (layer.beats === 1 ? ' off' : '')}>
						{children}
					</div>
				)
			})}
		</div>
	)

	useEffect(() => {
		clicksRef.current.style.opacity = '0'
		setTimeout(() => {
			clicksRef.current.style.opacity = '1'
			setLateSegmentChange(segment.on)
		}, 120)
	}, [segment.on])

	return (
		<div ref={clicksRef} className="clicks">
			{result}
		</div>
	)
}

Clicks.propTypes = {
	times: propTypes.array.isRequired,
	segment: propTypes.any.isRequired,
	layers: propTypes.any.isRequired,
}

export default Clicks
