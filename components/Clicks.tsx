import { useEffect, useRef, useState } from 'react'
import Pizzicato from 'pizzicato'
import Layer from '../types/layer'

import { tempoList } from '../lib/utils'

const Clicks = ({ layers, tempoRef, isRunning, isRunningRef, moreSettings }) => {
	function usePrevious(value: any) {
		const ref = useRef()
		useEffect(() => (ref.current = value), [value])
		return ref.current
	}

	const getBeats = (): number[] => layers.map((x: Layer) => x.beats)
	const clicksRef = useRef<any>()

	const [times, setTimes] = useState<number[]>([1, 1, 1, 1, 1])
	const [offsetTimes, setOffsetTimes] = useState([1, 1, 1, 1, 1])
	const [offsetSegmentPos, setOffsetSegmentPos] = useState(0)
	const [segmentPos, setSegmentPos] = useState(0)
	const [segmentRatio, setSegmentRatio] = useState([0])
	const [mockAmount, setMockAmount] = useState(0)

	const timesRef = useRef(times)
	const mockRef = useRef(mockAmount)
	const layersRef = useRef(layers)
	const previousBeats = usePrevious(getBeats()) || [1, 1, 1, 1, 1]

	mockRef.current = mockAmount
	timesRef.current = times
	layersRef.current = layers

	const { offset, clickType } = moreSettings

	type Timings = [number, number[]][]

	Pizzicato.volume = 0.3

	function playSound(layerArray: Layer[]) {
		const soundList: Pizzicato[] = []
		const waveformsList = ['sine', 'triangle', 'sawtooth', 'square']

		layerArray.forEach(layer => {
			const vol = layer.type >= 2 ? layer.volume * 0.6 : layer.volume
			const note = layer.freq + 12
			const freq = 32.7 * 2 ** (note / 12)
			const wave = new Pizzicato.Sound({
				source: 'wave',
				options: {
					type: waveformsList[layer.type],
					volume: layer.muted ? 0 : vol,
					frequency: freq,
					attack: 0,
					release: layer.release === 0 ? null : layer.release === 1 ? 0.3 : 0.7,
				},
			})

			soundList.push({
				wave,
				length:
					layer.duration === 50
						? 50
						: (24e4 / tempoList[tempoRef.current] / layer.beats) * layer.duration,
			})
		})

		soundList.forEach(({ wave, length }) => {
			wave.play()
			setTimeout(() => {
				wave.stop()
				// wave.disconnect()
			}, length)
		})
	}

	function metronome(timings: Timings, runId: string) {
		function runRecursion(nextDelay: number, position: number): void {
			const m_timeout = window.setTimeout(function callRecursion() {
				const perfStart = performance.now()
				//
				// Quit recursion if stopped or removed
				if (isRunningRef.current !== runId) {
					return clearTimeout(m_timeout)
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

				if (clickType > 0) setSegmentPos(position)

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
		const mesureLength = 24e4 / tempoList[tempoRef.current]
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

		timings.forEach(click =>
			ratiosOnly.push(click[0] / (24e4 / tempoList[tempoRef.current]))
		)
		setSegmentRatio(ratiosOnly)
	}

	//
	// Force sound on input
	//

	const playSilentSound = () => {
		const silentSound = new Pizzicato.Sound({
			source: 'wave',
			options: {
				type: 'square',
				volume: 0.01,
				frequency: 1,
				attack: 0,
				release: 0,
			},
		})

		if (mockRef.current < 2) {
			silentSound.play()
			setMockAmount(mockRef.current + 1)
			setTimeout(() => silentSound.stop(), 200)
		} else silentSound.disconnect()
	}

	// Forces Safari to play sounds without "real" user gestures
	useEffect(() => {
		document.body.addEventListener('click', () => playSilentSound())
		document.body.addEventListener('keypress', () => playSilentSound())

		return () => {
			document.body.removeEventListener('click', () => playSilentSound())
			document.body.removeEventListener('keypress', () => playSilentSound())
		}
	}, [])

	useEffect(() => {
		//
		// Start Metronome
		if (isRunning.length > 0) {
			metronome(getMetronomeTimings(), isRunningRef.current)
		}
	}, [isRunning])

	useEffect(() => {
		if (clickType === 0) {
			//
			// This averages clicks on beat change
			// to prevent skipping beats on restart
			//

			// Only updates clicks if beats are changed
			let changeClicks = false
			getBeats().forEach((beat, i) =>
				beat !== previousBeats[i] ? (changeClicks = !0) : ''
			)

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
		} else if (clickType === 1) {
			initSegment()
		}
	}, [layers, clickType])

	useEffect(() => {
		//
		// Sound latency
		// assign times to another identical state
		// after a setTimeout (if not zero)
		//

		const updateTimes = () => {
			!clickType ? setOffsetTimes([...times]) : setOffsetSegmentPos(segmentPos)
		}

		if (offset !== 0) setTimeout(updateTimes, offset)
		else updateTimes()

		// eslint-disable-next-line
	}, [times, segmentPos])

	//
	//
	// RENDER
	//
	//

	let clicks = <div ref={clicksRef} className="clicks"></div>

	switch (clickType) {
		case 0: {
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
											: beat < offsetTimes[row]
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

		case 1:
			clicks = (
				<div className="segment">
					<div className="click-row">
						{segmentRatio.map((ratio, i) => (
							<span
								key={i}
								className={'click' + (offsetSegmentPos === i ? ' on' : '')}
								style={{
									width: `calc(${ratio * 100}% - .3em)`,
								}}
							/>
						))}
					</div>
				</div>
			)
			break

		case 2:
			clicks = (
				<div className="block">
					<div className="click-row">
						<span
							className={'click' + (offsetSegmentPos % 2 === 0 ? ' on' : '')}
							style={{ width: `100%` }}
						/>
					</div>
				</div>
			)
			break
	}

	return (
		<div ref={clicksRef} className="clicks">
			{clicks}
		</div>
	)
}

export default Clicks
