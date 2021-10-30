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

	//
	//
	// FAIRE
	// TIMEOUT
	// LINEAIRE
	//
	//

	//
	// TODO
	// Sort division hash table directement

	const calculateTempoMs = (beats: number, tmp: number) => {
		tmp = tmp < 30 ? 30 : tmp > 300 ? 300 : tmp
		return 60000 / ((beats / 4) * tmp)
	}

	const metronomeInterval = (
		timingsList: number[][],
		nextDelay: number,
		index: number,
		runId: string
	) => {
		const m_timeout = window.setTimeout(function callMetronome() {
			//
			// Short name for refs
			const layer = layersRef.current[index]
			const innerTimes = timesRef.current

			// Quit recursion if stopped or removed
			if (isRunningRef.current !== runId || layer === undefined) {
				clearTimeout(m_timeout)
				return
			}

			//
			// Segment count, if on
			//

			// if (segmentRef.current.on) {
			// 	const currSeg = segmentRef.current

			// 	// If there are duplicates, do nothing but count duplicates
			// 	if (currSeg.dupCount < currSeg.duplicates[currSeg.count]) currSeg.dupCount++
			// 	else {
			// 		// Reset duplicate count
			// 		// Check for layers.time to know what currSeg should do
			// 		currSeg.dupCount = 1
			// 		const allAtOne = innerTimes.every(t => t === 1)
			// 		const oneAtMax = innerTimes[index] === layer.beats
			// 		currSeg.count = allAtOne ? 1 : oneAtMax ? 0 : currSeg.count + 1
			// 	}

			// 	setSegment({ ...currSeg })
			// }

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
			setTimeout(() => wave.stop(), 50) //layer.duration ? fixedTempoMs * 0.3 : 50)

			//
			// Update beat time
			// Return to 1 if 'time' above 'beats'
			//

			// innerTimes[index] = innerTimes[index] >= layer.beats ? 1 : innerTimes[index] + 1
			// setTimes([...innerTimes])

			// Calculate latency
			// const start = startTimeRef.current
			//const latencyOffset = start > 0 ? (Date.now() - start) % fixedTempoMs : 0

			// Recursion
			//metronomeInterval(fixedTempoMs, fixedTempoMs - latencyOffset, index, runId)
		}, nextDelay)
	}

	function miniMetronomeTest(timingsList: number[][], nextDelay: number) {
		const m_timeout = window.setTimeout(function callMetronome() {
			//
			// Current metronome position counts number of times in array,
			// minus default: [2, 3, 3, 2, 1] = 6 ... [1, 1, 1, 1, 1] = 0
			//
			const currentPos = timesRef.current.reduce((a, b) => a + b) - 5
			const currentTiming = timingsList[currentPos]
			const times = [...timesRef.current]
			let nextpos = 0

			// Bump time in correct layer
			times[currentTiming[1]]++

			// Save times and change position
			const hasNextClick = timingsList[currentPos + 1] !== undefined
			setTimes(hasNextClick ? [...times] : [1, 1, 1, 1, 1])
			nextpos = hasNextClick ? timingsList[currentPos + 1][0] : timingsList[0][0]

			miniMetronomeTest(timingsList, nextpos)
		}, nextDelay)
	}

	function getMetronomeTimings() {
		const mesureLength = 24e4 / tempoRef.current
		const division: any[] = []
		let result: any[] = []

		// Fill with all layers divisions
		layers.forEach((layer, index) => {
			for (let beat = 1; beat < layer.beats; beat++) {
				division.push({ ratio: beat / layer.beats, layer: index })
			}
		})

		// Sort: slower latency first, regardless of layer
		division.sort((a, b) => a.ratio - b.ratio)

		// Substract time from last click to get click interval
		let lastClickLength = 0
		division.forEach(elem => {
			const clickLength = mesureLength * elem.ratio
			const interval = clickLength - lastClickLength

			result.push([interval, elem.layer])
			lastClickLength = clickLength
		})

		// Subsctract from last click
		result.push([mesureLength - lastClickLength, result[result.length - 1][1]])

		return result
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

		const division: number[] = []

		// Fill with all layers divisions & sort
		layers.forEach((layer, index) => {
			for (let beat = 1; beat < layer.beats; beat++) {
				division.push(beat / layer.beats)
			}
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
			setTimes([1, 1, 1, 1, 1])
			layersRef.current.forEach((layer, i) => {
				if (layer.beats > 1) {
					const tempoMs = calculateTempoMs(layer.beats, tempoRef.current)
					const timings = getMetronomeTimings()
					metronomeInterval(timings, tempoMs, i, isRunning)
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
			<button onClick={() => getMetronomeTimings()}>timings</button>
			<button onClick={() => miniMetronomeTest(getMetronomeTimings(), 10)}>start</button>
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
