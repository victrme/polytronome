import { useEffect, useRef, useState, useCallback } from 'react'
import propTypes from 'prop-types'
import Pizzicato from 'pizzicato'

const Clicks = ({
	isRunning,
	segment,
	layers,
	setSegment,
	tempoRef,
	isRunningRef,
	startTimeRef,
}) => {
	const clicksRef = useRef(document.createElement('div'))
	const [lateSegmentChange, setLateSegmentChange] = useState(false)
	const [times, setTimes] = useState<number[]>([1, 1, 1, 1, 1])

	const timesRef = useRef(times)
	const segmentRef = useRef(segment)
	const layersRef = useRef(layers)

	timesRef.current = times
	layersRef.current = layers
	segmentRef.current = segment

	const metronomeInterval = (
		fixedTempoMs: number,
		nextDelay: number,
		index: number,
		runId: string
	) => {
		const m_timeout = window.setTimeout(() => {
			//
			// Short name for refs
			const layer = layersRef.current[index]
			const innerTimes = [...timesRef.current]

			// Quit recursion if stopped or removed
			if (isRunningRef.current !== runId || layer === undefined) {
				clearTimeout(m_timeout)
				return
			}

			//
			// Segment count, if on
			//

			if (segmentRef.current.on) {
				const currSeg = segmentRef.current

				// If there are duplicates, do nothing but count duplicates
				if (currSeg.dupCount < currSeg.duplicates[currSeg.count]) currSeg.dupCount++
				else {
					// Reset duplicate count
					// Check for layers.time to know what currSeg should do
					currSeg.dupCount = 1
					const allAtOne = innerTimes.every(t => t === 1)
					const oneAtMax = innerTimes[index] === layer.beats
					currSeg.count = allAtOne ? 1 : oneAtMax ? 0 : currSeg.count + 1
				}

				setSegment({ ...currSeg })
			}

			//
			// Play sound
			//
			const vol =
				layer.type === 'sawtooth' || layer.type === 'square'
					? layer.volume / 3
					: layer.volume

			const note = layer.freq + 12
			const freq = 32.7 * 2 ** (note / 12)
			const wave = new Pizzicato.Sound({
				source: 'wave',
				options: {
					type: layer.type,
					volume: vol,
					frequency: freq,
					attack: 0,
					release: layer.release ? 0.6 : null,
				},
			})

			wave.play()
			setTimeout(() => wave.stop(), layer.duration ? fixedTempoMs * 0.3 : 50)

			//
			// Update beat time
			// Return to 1 if 'time' above 'beats'
			//

			innerTimes[index] = innerTimes[index] >= layer.beats ? 1 : innerTimes[index] + 1
			setTimes([...innerTimes])

			// Calculate latency
			const start = startTimeRef.current
			const latencyOffset = start > 0 ? (Date.now() - start) % fixedTempoMs : 0

			// Recursion
			metronomeInterval(fixedTempoMs, fixedTempoMs - latencyOffset, index, runId)
		}, nextDelay)
	}

	const initSegment = useCallback(() => {
		function getDuplicates(list: number[]) {
			// Creates list of duplicates per division
			// [1, 3, 1 ...]

			const duplicates: number[] = []

			list.forEach((elem, index) =>
				list[index] !== list[index - 1]
					? duplicates.push(1)
					: duplicates[duplicates.length - 1]++
			)

			return duplicates
		}

		function getRatios(list: number[]) {
			// Removes duplicates
			list = [0, ...new Set(list), 1]
			const ratios: number[] = []

			// segment ratio [next - current]
			list.forEach((elem, i) => {
				if (list[i + 1]) ratios.push(list[i + 1] - elem)
			})

			return ratios
		}

		const division: number[] = []

		// Fill with all layers divisions & sort
		layers.forEach(layer => {
			for (let k = 1; k < layer.beats; k++) division.push(k / layer.beats)
		})
		division.sort()

		setSegment({
			...segment,
			ratios: getRatios(division),
			duplicates: getDuplicates(division),
		})
	}, [layers, segment, setSegment])

	//
	//
	// EFFECTS
	//
	//

	useEffect(() => {
		setLateSegmentChange(segment.on)
	}, [segment.on])

	useEffect(() => {
		// Starting
		if (isRunning.length > 0) {
			const calculateTempoMs = (beats: number, tmp: number) => {
				tmp = tmp < 30 ? 30 : tmp > 300 ? 300 : tmp
				return 60000 / ((beats / 4) * tmp)
			}

			setTimes([1, 1, 1, 1, 1])
			layersRef.current.forEach((layer, i) => {
				if (layer.beats > 1) {
					const tempoMs = calculateTempoMs(layer.beats, tempoRef.current)
					metronomeInterval(tempoMs, tempoMs, i, isRunning)
				}
			})
		}

		// Ending
		// eslint-disable-next-line
	}, [isRunning])

	useEffect(() => {
		if (segment.on) initSegment()
		// eslint-disable-next-line
	}, [layers, segment.on])

	//
	//
	// RENDER
	//
	//

	let clicks = <div ref={clicksRef} className="clicks"></div>

	switch (lateSegmentChange) {
		case true:
			clicks = (
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
			)
			break

		case false: {
			clicks = (
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
										(beat >= layer.beats
											? ' off'
											: beat < times[row]
											? ' on'
											: '')
									}
								/>
							)
						}

						// Wrap in rows & return
						return (
							<div
								key={row}
								className={'click-row' + (layer.beats === 1 ? ' off' : '')}
							>
								{children}
							</div>
						)
					})}
				</div>
			)
			break
		}
	}

	return (
		<div ref={clicksRef} className="clicks">
			{clicks}
		</div>
	)
}

Clicks.propTypes = {
	segment: propTypes.any.isRequired,
	setSegment: propTypes.any.isRequired,
	layers: propTypes.any.isRequired,
	isRunning: propTypes.any.isRequired,
	isRunningRef: propTypes.any.isRequired,
	startTimeRef: propTypes.any.isRequired,
	tempoRef: propTypes.any.isRequired,
}

export default Clicks
