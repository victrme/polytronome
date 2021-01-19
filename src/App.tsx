import { useRef, useState } from 'react'
import Pizzicato from 'pizzicato'
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

	const [metronome, setMetronome] = useState({
		layers: [
			{
				id: setRandomID(),
				beats: 4,
				time: 1,
				frequency: 0,
			},
			{
				id: setRandomID(),
				beats: 5,
				time: 1,
				frequency: 1,
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

	// const [moreSettings, setMoreSettings] = useState({
	// 	theme: {
	// 		current: 0,
	// 		name: ['dark', 'light', 'coffee', 'contrast'],
	// 	},
	// 	sound: {
	// 		layersDiff: true,
	// 		options: {
	// 			type: 'sine',
	// 			attack: 0.001,
	// 			release: 0.01,
	// 			frequency: 150,
	// 		},
	// 	},
	// 	fullscreen: false,
	// 	unlimited: false,
	// })
	// const moreSettingsRef = useRef(moreSettings)
	// moreSettingsRef.current = moreSettings

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
					type: 'sine',
					attack: 0.001,
					release: 0.01,
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
						<button onClick={() => updateLayer('add')}>+</button>
					</div>
				</div>

				<div className="global-settings">
					<div className="setting">
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
						<button onClick={tapTempo}>tap</button>
					</div>

					<div>
						<button onMouseDown={launchMetronome}>
							{metronome.isRunning ? 'Stop' : 'Start'}
						</button>
						<button onClick={() => console.log(metronome)}>
							state data
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default App
