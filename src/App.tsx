import { useRef, useState } from 'react'
import Pizzicato from 'pizzicato'
import MoreSettings from './MoreSettings'
import './App.css'

function App(): JSX.Element {
	/**
	 *
	 * States & Values
	 *
	 */

	const Notes = [
		['a', 220.0],
		['a#', 233.08],
		['b', 246.94],
		['c', 261.63],
		['c#', 277.18],
		['d', 293.66],
		['e', 311.13],
		['f', 349.23],
		['f#', 369.99],
		['g', 392.0],
		['g#', 415.3],
	]

	const defaultLayer = {
		id: setRandomID(),
		beats: 4,
		time: 1,
		frequency: 0,
	}

	const [soundOptions, setSoundOptions] = useState({
		type: 'sawtooth',
		attack: 0.01,
		release: 1,
		volume: 0.1,
	})

	const [metronome, setMetronome] = useState({
		layers: [
			{
				id: setRandomID(),
				beats: 4,
				time: 1,
				frequency: 1,
			},
			{
				id: setRandomID(),
				beats: 5,
				time: 1,
				frequency: 5,
			},
		],
		startTime: 0,
		isRunning: false,
		tempo: 80,
		tap: [
			{
				date: 0,
				wait: 0,
			},
		],
	})

	// Use Refs for async timeouts
	const metronomeRef = useRef(metronome)
	metronomeRef.current = metronome

	/**
	 *
	 * Small functions
	 *
	 */

	const getLayerFromId = (id: string) =>
		metronomeRef.current.layers.filter(ll => ll.id === id)[0]

	const calculateTempoMs = (beats: number, tempo: number) =>
		60000 / ((beats / 4) * tempo)

	function setRandomID() {
		let xx = ''
		while (xx.length < 8)
			xx += String.fromCharCode(Math.random() * (122 - 97) + 97)
		return xx
	}

	function changeSoundOptions(e: any, which: string) {
		const opt = soundOptions
		const val = e.target.value
		opt[which] = which === 'type' ? val : +val

		setSoundOptions(opt)
	}

	function CreateSegment() {
		function getSegmentCuts() {
			let division: number[] = []

			metronome.layers.forEach(lay => {
				for (let k = 1; k < lay.beats; k++) {
					division.push(k / lay.beats)
				}
			})

			return [...new Set(division)].sort()
		}

		let spans: JSX.Element[] = []
		const division = getSegmentCuts()
		const width = 300

		for (let i = 0; i < division.length; i++) {
			let size = 0

			if (i === 0) {
				size = division[i] * width
			} else if (i === division.length) {
				size = (1 - division[i]) * width
			} else {
				size = (division[i + 1] - division[i]) * width
			}

			spans.push(
				<span
					key={spans.length + 1}
					className="segment-child"
					style={{ width: size }}
				/>
			)
		}

		return <div className="segment">{spans}</div>
	}

	// let monworker: Worker

	// function changeWorkerTest(which: 'start' | 'stop') {
	// 	if (which === 'start') {
	// 		monworker = new Worker(`${process.env.PUBLIC_URL}/worker.js`)
	// 		monworker.postMessage(calculateTempoMs(4, metronome.tempo))

	// 		monworker.onmessage = function (e) {
	// 			console.log('timeoutID: ', e.data)
	// 		}
	// 	}

	// 	if (which === 'stop' && monworker !== undefined) {
	// 		monworker.terminate()
	// 	}
	// }

	/**
	 *
	 * Main functions
	 *
	 */

	function metronomeInterval(nextDelay: number, id: string) {
		//
		const timeoutID = window.setTimeout(() => {
			const current = metronomeRef.current
			const layer = getLayerFromId(id)

			// Quit recursion if stopped or removed
			if (!current.isRunning || layer === undefined) {
				clearTimeout(timeoutID)
				return
			}

			const tempoMs = calculateTempoMs(layer.beats, current.tempo)

			// Return to 1 if 'time' above 'beats'
			setMetronome(prev => ({
				...prev,
				layers: prev.layers.map(aa =>
					aa.id === id
						? { ...aa, time: aa.time >= aa.beats ? 1 : aa.time + 1 }
						: aa
				),
			}))

			// Play sound
			const wave = new Pizzicato.Sound({
				source: 'wave',
				options: {
					...soundOptions,
					frequency: Notes[layer.frequency][1],
				},
			})
			wave.play()
			setTimeout(() => wave.stop(), 20)

			// Calculate latency
			const latencyOffset =
				current.startTime > 0
					? (Date.now() - current.startTime) % tempoMs
					: 0

			// Recursion
			metronomeInterval(tempoMs - latencyOffset, id)
		}, nextDelay)
	}

	function launchMetronome() {
		if (metronome.isRunning) {
			//
			// Stops
			//
			setMetronome(args => ({
				...args,

				// Each set to new defaults
				layers: metronome.layers.map(l => ({
					...l,
					time: 1,
					id: setRandomID(),
				})),

				isRunning: false,
				startTime: 0,
			}))
		} else {
			//
			// Starts
			//
			metronome.layers.forEach(layer =>
				metronomeInterval(
					calculateTempoMs(layer.beats, metronome.tempo),
					layer.id
				)
			)

			// Update to start state
			setMetronome(args => ({
				...args,
				isRunning: true,
				startTime: Date.now(),
			}))
		}
	}

	const changeLayerBeats = (e: any, i: number) => {
		const val = +e.target.value
		let array = metronome.layers

		// Minimum 2 beats
		array[i].beats = val > 1 ? val : 2

		setMetronome(prev => ({
			...prev,
			layers: array,
		}))
	}

	const changeFrequency = (e: any, i: number) => {
		const layers = metronome.layers
		layers[i].frequency = +e.target.value

		setMetronome(prev => ({ ...prev, layers }))
	}

	const updateLayer = (which: 'remove' | 'add', index?: number) => {
		const layers = metronome.layers

		// Remove
		if (which === 'remove' && layers.length > 1 && index !== undefined)
			layers.splice(index, 1)

		// Add
		if (which === 'add' && layers.length < 4) layers.push(defaultLayer)

		// Update
		setMetronome(prev => ({ ...prev, layers }))
	}

	const tapTempo = () => {
		const tap = metronome.tap

		// Reset tap after 2s
		if (Date.now() - tap[0].date > 2000) {
			setMetronome(prev => ({
				...prev,
				tap: [
					{
						date: Date.now(),
						wait: 0,
					},
				],
			}))
		} else {
			//
			// Wait is offset between two taps
			tap.unshift({
				date: Date.now(),
				wait: Date.now() - metronome.tap[0].date,
			})

			// Array of tap offsets
			const cumul: number[] = []

			// Removes first, only keeps 6 at a time
			tap.forEach((each, i) => {
				if (each.wait > 0) cumul.push(each.wait)
				if (each.wait === 0 || i === 6) tap.pop()
			})

			setMetronome(prev => ({
				...prev,
				tap,

				// Get average tempo
				tempo: Math.floor(
					60000 /
						(cumul.reduce((a: number, b: number) => a + b) /
							cumul.length)
				),
			}))
		}
	}

	return (
		<div className="App">
			<div className="title">
				<h1>Poly-tronome</h1>
				<p>Train your polyrythms</p>
			</div>

			<CreateSegment />

			<div className="layers">
				{metronome.layers.map((layer, jj) => {
					// Add clicks for each layers

					const children: JSX.Element[] = []
					for (let kk = 0; kk < layer.beats; kk++)
						children.push(
							<div
								key={kk}
								className={
									+kk <= layer.time - 1 ? 'click on' : 'click'
								}
							/>
						)

					// Wrap in rows & return
					return (
						<div key={jj} className="clicks-wrap">
							{children}
						</div>
					)
				})}
			</div>

			<div className="settings-wrap">
				<div className="layers-settings">
					{metronome.layers.map((layer, i) => {
						return (
							<div className="setting" key={i}>
								<input
									type="number"
									name="numer-num"
									min="2"
									max="16"
									value={layer.beats}
									key={'number-' + i}
									onChange={e => changeLayerBeats(e, i)}
								/>
								<input
									type="range"
									name="numer-range"
									min="2"
									max="16"
									value={layer.beats}
									key={'numer-range-' + i}
									onChange={e => changeLayerBeats(e, i)}
								/>

								<span className="note">
									{Notes[layer.frequency][0]}
								</span>

								<input
									type="range"
									name="freq-range"
									key={'freq-range-' + i}
									min="0"
									max="10"
									value={layer.frequency}
									onChange={e => changeFrequency(e, i)}
								/>

								<button
									className="suppr-btn"
									onClick={e => updateLayer('remove', i)}
								>
									&times;
								</button>
							</div>
						)
					})}

					<div className="add-layer">
						<button onClick={() => updateLayer('add')}>
							add layer
						</button>
					</div>
				</div>

				<div className="global-settings">
					{/* <MoreSettings
						state={soundOptions}
						change={changeSoundOptions}
					/> */}

					<div className="setting tempo">
						<div>
							<h3>Tempo</h3>
							<button onClick={tapTempo}>tap</button>
						</div>

						<input
							type="range"
							name="tempo-range"
							id="tempo-range"
							min="20"
							max="300"
							value={metronome.tempo}
							onChange={e =>
								setMetronome(args => ({
									...args,
									tempo: +e.target.value,
								}))
							}
						/>
						<input
							type="number"
							name="tempo-num"
							id="tempo-num"
							min="20"
							max="300"
							value={metronome.tempo}
							onChange={e =>
								setMetronome(args => ({
									...args,
									tempo: +e.target.value,
								}))
							}
						/>
					</div>

					<div>
						<button onMouseDown={launchMetronome}>
							{metronome.isRunning ? 'Stop' : 'Start'}
						</button>

						{/* <button onClick={() => console.log(metronome)}>
							state data
						</button> */
						/* <button onClick={() => changeWorkerTest('start')}>
							start Worker Test
						</button>
						<button onClick={() => changeWorkerTest('stop')}>
							stop Worker Test
						</button> */}
					</div>
				</div>
			</div>
		</div>
	)
}

export default App
