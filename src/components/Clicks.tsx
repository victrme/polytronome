import { useEffect, useRef, useState } from 'react'
import propTypes from 'prop-types'
import Pizzicato from 'pizzicato'
import { Layer } from '../Types'

const Clicks = ({ isRunning, segment, layers, setSegment, tempoRef, isRunningRef }) => {
	function usePrevious(value) {
		const ref = useRef()
		useEffect(() => (ref.current = value), [value])
		return ref.current
	}
	const getBeats = () => layers.map((x: Layer) => x.beats)
	const clicksRef = useRef(document.createElement('div'))
	const [lateSegmentChange, setLateSegmentChange] = useState(false)
	const [times, setTimes] = useState<number[]>([1, 1, 1, 1, 1])
	const [segmentPos, setSegmentPos] = useState(0)

	const timesRef = useRef(times)
	const segmentRef = useRef(segment)
	const layersRef = useRef(layers)
	const segmentPosRef = useRef(segmentPos)
	const previousBeats = usePrevious(getBeats()) || [1, 1, 1, 1, 1]

	timesRef.current = times
	layersRef.current = layers
	segmentRef.current = segment
	segmentPosRef.current = segmentPos

	type Timings = [number, number[]][]

	Pizzicato.volume = 0.3

	function playSound(layerArray: Layer[]) {
		const fixedMsSounds: Pizzicato[] = []
		const relativeMsSounds: Pizzicato[] = []

		layerArray.forEach(layer => {
			const isAggressiveType = layer.type === 'sawtooth' || layer.type === 'square'
			const vol = isAggressiveType ? layer.volume / 3 : layer.volume
			const note = layer.freq + 12
			const freq = 32.7 * 2 ** (note / 12)
			const wave = new Pizzicato.Sound({
				source: 'wave',
				options: {
					type: layer.type,
					volume: layer.muted ? 0 : vol,
					frequency: freq,
					attack: 0,
					release: layer.release === 0 ? null : layer.release === 1 ? 0.3 : 0.7,
				},
			})

			if (!layer.duration) fixedMsSounds.push(wave)
			else
				relativeMsSounds.push({
					wave,
					length: (24e4 / tempoRef.current / layer.beats) * 0.3,
				})
		})

		// group and play all fixed timed clicks
		const group = new Pizzicato.Group(fixedMsSounds)
		setTimeout(() => group.stop(), 50)
		group.play()

		// start and stop relatives one by one
		if (relativeMsSounds.length > 0)
			relativeMsSounds.forEach(({ wave, length }) => {
				wave.play()
				setTimeout(() => wave.stop(), length)
			})
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

			// test if timings work before sending
			return timings[position] === undefined ? position - 1 : position
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

		//
		// TODO:
		// Previous layer pour update que
		// quand les beats changent
		//

		let changeClicks = false

		getBeats().forEach((beat, i) => {
			if (beat !== previousBeats[i]) changeClicks = !0
		})

		if (changeClicks) {
			const tempTimes = [...times]
			const concatdTimes = times.reduce((a, b) => a + b)
			const maxTime = layers.map(a => a.beats).reduce((a, b) => a + b)
			const percent = concatdTimes / maxTime
			let rounded = 1

			for (let i = 0; i < times.length; i++) {
				rounded = Math.round(layers[i].beats * percent)
				tempTimes[i] = rounded === 0 ? 1 : rounded
			}

			setTimes([...tempTimes])
		}

		// eslint-disable-next-line
	}, [layers])

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
	tempoRef: propTypes.any.isRequired,
}

export default Clicks
