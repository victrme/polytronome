import { useRef, useState } from 'react'
import Pizzicato from 'pizzicato'
import './App.css'

type Layers = {
	beats: number
	time: number
	id: string
}[]

function App(): JSX.Element {
	/**
	 *
	 * State & small functions
	 *
	 */

	const setRandomID = () => {
		let xx = ''
		while (xx.length < 8)
			xx += String.fromCharCode(Math.random() * (122 - 97) + 97)
		return xx
	}

	const [metronome, setMetronome] = useState({
		layers: [
			{
				id: setRandomID(),
				beats: 4,
				time: 1,
			},
			{
				id: setRandomID(),
				beats: 5,
				time: 1,
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

	// Use Refs for async timeouts
	const metronomeRef = useRef(metronome)
	metronomeRef.current = metronome

	const getLayerFromId = (id: string) =>
		metronomeRef.current.layers.filter(ll => ll.id === id)[0]

	const calculateTempoMs = (beats: number, tempo: number) =>
		60000 / ((beats / 4) * tempo)

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

					// WTF
					frequency: 100 + id.charCodeAt(0) / 2,
				},
			})
			wave.play()
			wave.on(
				'play',
				setTimeout(() => wave.stop(), 20)
			)

			// Calculate latency
			const latencyOffset =
				current.startTime > 0
					? (Date.now() - current.startTime) % tempoMs
					: 0

			// Recursion
			metronomeInterval(tempoMs - latencyOffset, id)
		}, nextDelay)
	}

	function stopMetronome(stops: boolean) {
		if (stops) {
			const newlayers: Layers = []
			metronome.layers.forEach(l => {
				l.time = 1
				newlayers.push(l)
			})

			setMetronome(args => ({
				...args,
				layers: newlayers,
				isRunning: false,
				startTime: 0,
			}))
		} else {
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

	const changeTempo = (e: any) => {
		setMetronome(args => ({
			...args,
			tempo: +e.target.value,
		}))
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

	const removeLayer = (index: number) => {
		let array = metronome.layers

		if (array.length > 1) {
			array.splice(index, 1)
			setMetronome(prev => ({
				...prev,
				layers: array,
			}))

			if (index === array.length - 1) {
				stopMetronome(true)
			}
		}
	}

	const addLayer = () => {
		let array = metronome.layers

		if (array.length < 4) {
			array.push({ id: setRandomID(), beats: 4, time: 1 })
			setMetronome(prev => ({
				...prev,
				layers: array,
			}))
		}
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
									key={'range-' + i}
									onChange={e => changeLayerBeats(e, i)}
								/>

								<button
									className="suppr-btn"
									onClick={e => removeLayer(i)}
								>
									&times;
								</button>
							</div>
						)
					})}

					<div className="add-layer">
						<button onClick={addLayer}>+</button>
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
							onChange={e => changeTempo(e)}
						/>
						<button onClick={tapTempo}>tap</button>
					</div>

					<div>
						<button
							onMouseDown={() =>
								stopMetronome(metronome.isRunning)
							}
						>
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
