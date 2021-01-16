import { useRef, useState } from 'react'
import Pizzicato from 'pizzicato'
import './App.css'

// type Metronome = {
// layers: {
// time: number
// beats: number
// }[]
// numer: number
// startTime: number
// isRunning: boolean
// tempo: number
// }

type Layers = {
	beats: number
	time: number
}[]

function App(): JSX.Element {
	const [metronome, setMetronome] = useState({
		layers: [
			{
				time: 1,
				beats: 4,
			},
			{
				time: 1,
				beats: 5,
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

	//utiliser ref pour les settimeout async
	const metronomeRef = useRef(metronome)
	metronomeRef.current = metronome

	const calculateTempoMs = (beats: number, tempo: number) =>
		60000 / ((beats / 4) * tempo)

	function metronomeInterval(nextDelay: number, index: number) {
		const tempoMs = calculateTempoMs(
			metronomeRef.current.layers[index].beats,
			metronomeRef.current.tempo
		)

		const timeoutID = window.setTimeout(() => {
			const t_current = metronomeRef.current

			//quit recursion if stopped or removed
			if (!t_current.isRunning || t_current.layers[index] === undefined) {
				clearTimeout(timeoutID)
				return
			}

			//return to 1 if 'time' above 'beats'
			setMetronome(prev => ({
				...prev,
				layers: prev.layers.map((x, i) =>
					i === index
						? { ...x, time: x.time >= x.beats ? 1 : x.time + 1 }
						: x
				),
			}))

			//play sound
			const wave = new Pizzicato.Sound({
				source: 'wave',
				options: {
					attack: 0.01,
					release: 0.2,
					frequency: 100 + 50 * index,
				},
			})
			wave.play()
			wave.on(
				'play',
				setTimeout(() => wave.stop(), 20)
			)

			//calculate latency
			const latencyOffset =
				t_current.startTime > 0
					? (Date.now() - t_current.startTime) % tempoMs
					: 0

			//recursion
			metronomeInterval(tempoMs - latencyOffset, index)
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
			metronome.layers
				.map(layer => calculateTempoMs(layer.beats, metronome.tempo))
				.forEach((d, i) => metronomeInterval(d, i))

			//update to start state
			setMetronome(args => ({
				...args,
				isRunning: true,
				startTime: Date.now(),
			}))
		}
	}

	const changeTempo = (e: any) => {
		let newlayers: Layers = []
		metronome.layers.forEach(l => {
			l.time = 1
			newlayers.push(l)
		})

		setMetronome(args => ({
			...args,
			tempo: +e.target.value,
			layers: newlayers,
		}))
	}

	const changeLayerBeats = (e: any, i: number) => {
		const val = +e.target.value
		let array = metronome.layers

		// minimum 2 beats
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
			array.push({ beats: 4, time: 1 })
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

		console.log(tap)
	}

	return (
		<div className="App">
			<div className="title">
				<h1>Poly-tronome</h1>
				<p>Train your polyrythms</p>
			</div>

			<div className="layers">
				{metronome.layers.map((layer, jj) => {
					//add clicks for each layers

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

					//wrap in rows & return
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
