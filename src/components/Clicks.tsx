import { useEffect, useRef, useState } from 'react'
import propTypes from 'prop-types'
import Pizzicato from 'pizzicato'
import { Layer } from '../Types'

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
	const [segmentPos, setSegmentPos] = useState(0)

	const timesRef = useRef(times)
	const segmentRef = useRef(segment)
	const layersRef = useRef(layers)
	const segmentPosRef = useRef(segmentPos)

	timesRef.current = times
	layersRef.current = layers
	segmentRef.current = segment
	segmentPosRef.current = segmentPos

	type Timings = [number, number[]][]

	function playSound(layerArray: Layer[]) {
		const sounds: Pizzicato[] = []

		layerArray.forEach(layer => {
			const isAggressiveType = layer.type === 'sawtooth' || layer.type === 'square'
			const vol = isAggressiveType ? layer.volume / 3 : layer.volume
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

			sounds.push(wave)
		})

		const group = new Pizzicato.Group(sounds)
		group.play()
		setTimeout(() => group.stop(), 50) //layer.duration ? fixedTempoMs * 0.3 : 50)
	}

	function metronome(timings: Timings, runId: string) {
		function runRecursion(nextDelay: number, position: number): void {
			const m_timeout = window.setTimeout(function callRecursion() {
				const perfStart = performance.now()
				//
				// Quit recursion if stopped or removed
				if (isRunningRef.current !== runId) {
					clearTimeout(m_timeout)
					return false
				}

				const currentTiming = timings[position]
				const times = [...timesRef.current]

				// Bump time in correct layer
				currentTiming[1].forEach(index => times[index]++)

				// Play specific layers
				const layersToPlay = layers.filter((x, i) => currentTiming[1].indexOf(i) !== -1)
				playSound(layersToPlay)

				// When mesure is not over
				if (timings[position + 1] !== undefined) {
					setTimes([...times])
					nextDelay = timings[position + 1][0]
					position++
				}
				// Last mesure (or first w/e)
				else {
					playSound(activeLayers())
					setTimes([1, 1, 1, 1, 1])
					nextDelay = timings[0][0]
					position = 0
				}

				if (segmentRef.current.on) setSegmentPos(position)

				runRecursion(preventLatency(nextDelay, perfStart), position)
			}, nextDelay)
		}

		const findLastPosition = () => {
			//
			// Simulate last mesure and
			// stops when times corresponds
			const concatdTimes = times.reduce((a, b) => a + b) - 5
			let simulatedTimes = 0
			let position = 0

			timings.forEach(click => {
				if (concatdTimes > simulatedTimes) {
					simulatedTimes += click[1].length
					position++
				}
			})

			return position
		}

		const lastPos = findLastPosition()
		const layers: Layer[] = [...layersRef.current]
		const activeLayers = () => layers.filter(layer => layer.beats > 1)
		const preventLatency = (delay: number, startWatch: number) =>
			delay - (performance.now() - startWatch)

		runRecursion(timings[lastPos][0], lastPos)
	}

	function getMetronomeTimings() {
		const mesureLength = 24e4 / tempoRef.current
		const result: Timings = []
		const division: any[] = []
		let rawTimings: any[] = []

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

			rawTimings.push([interval, elem.layer])
			lastClickLength = clickLength
		})

		// Subsctract from last click
		rawTimings.push([mesureLength - lastClickLength, rawTimings[rawTimings.length - 1][1]])

		// Add 0 timed layer index to last timing
		// Or push a new timing
		rawTimings.forEach(([time, layer]) => {
			if (time === 0) result[result.length - 1][1].push(layer)
			else result.push([time, [layer]])
		})

		return result
	}

	const initSegment = () => {
		const timings = getMetronomeTimings()
		const ratiosOnly: number[] = []

		timings.forEach(click => ratiosOnly.push(click[0] / (24e4 / tempoRef.current)))
		setSegment({ ...segment, ratios: ratiosOnly })

		// eslint-disable-next-line
	}

	//
	//
	// EFFECTS
	//
	//

	useEffect(() => {
		setLateSegmentChange(segment.on)
	}, [segment.on])

	// Starting
	useEffect(() => {
		if (isRunning.length > 0) metronome(getMetronomeTimings(), isRunningRef.current)
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
								className={'click' + (segmentPos === i ? ' on' : '')}
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
