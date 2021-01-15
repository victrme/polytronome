import { useRef, useState } from 'react'
import Pizzicato from 'pizzicato'
import './App.css'

// type Metronome = {
// 	layers: {
// 		time: number
// 		beats: number
// 	}[]
// 	numer: number
// 	startTime: number
// 	isRunning: boolean
// 	tempo: number
// }

function App(): JSX.Element {
	const [metronome, setMetronome] = useState({
		layers: [
			{
				time: 1,
				beats: 4,
			},
			{
				time: 1,
				beats: 6,
			},
		],
		startTime: 0,
		isRunning: false,
		tempo: 120,
	})

	const BPMtoMs = (bpm: number) => 60000 / bpm

	//utiliser ref pour les settimeout async
	const metronomeRef = useRef(metronome)
	metronomeRef.current = metronome

	function metronomeInterval(nextDelay: number, index: number) {
		const current = metronomeRef.current

		//timeout delay control
		//prevent 0 BPM from looping too fast

		const ratioedBPM = (current.layers[index].beats / 4) * current.tempo
		const tempoMs = ratioedBPM < 1 ? 1800 : BPMtoMs(ratioedBPM)
		const timeoutDelay = nextDelay ? nextDelay : tempoMs

		const timeoutID = window.setTimeout(() => {
			// "t_" for timeout
			// because current is now too old
			const t_current = metronomeRef.current

			//quit recursion if stopped or removed
			if (!t_current.isRunning || t_current.layers[index] === undefined) {
				clearTimeout(timeoutID)
				return
			}

			setMetronome((prev) => ({
				...prev,
				//return to 1 if 'time' above 'beats'
				layers: prev.layers.map((x, i) =>
					i === index
						? { ...x, time: x.time >= x.beats ? 1 : x.time + 1 }
						: x
				),
			}))

			//play sound for 20ms
			const sineWave = new Pizzicato.Sound({
				source: 'wave',
				options: {
					attack: 0,
					frequency: 50 + 50 * index,
				},
			})

			sineWave.play()
			setTimeout(() => sineWave.stop(), 20)

			//calculate latency
			const latencyOffset =
				t_current.startTime > 0
					? (Date.now() - t_current.startTime) % tempoMs
					: 0

			//recursion
			metronomeInterval(tempoMs - latencyOffset, index)
		}, timeoutDelay)
	}

	function launchMetronome() {
		//stops
		if (metronome.isRunning) {
			type Layers = {
				beats: number
				time: number
			}[]

			let newlayers: Layers = []
			metronome.layers.forEach((l) => {
				l.time = 1
				newlayers.push(l)
			})

			setMetronome((args) => ({
				...args,
				layers: newlayers,
				isRunning: false,
				startTime: 0,
			}))

			//starts
		} else {

			metronome.layers
				.map((layer) => BPMtoMs((layer.beats / 4) * metronome.tempo))
				.forEach((d, i) => metronomeInterval(d, i))	

			//update to start state
			setMetronome((args) => ({
				...args,
				isRunning: true,
				startTime: Date.now(),
			}))
		}
	}

	function LayerClicks() {
		let parent: JSX.Element[] = []

		//loop for each time signatures
		for (let k in metronome.layers) {
			//
			//add clicks for each layers
			let children: JSX.Element[] = []
			const currLayer = metronome.layers[+k]

			for (let j = 0; j < currLayer.beats; j++) {
				//
				//update click when time changes
				const onOff = j <= currLayer.time - 1 ? 'click on' : 'click'
				children.push(<div key={j} className={onOff} />)
			}

			//wrap in rows & return
			parent.push(
				<div key={+k} className="clicks-wrap">
					{children}
				</div>
			)
		}

		return <div>{parent}</div>
	}

	const changeLayerSettings = (e: any, i: number) => {
		const val = +e.target.value
		let array = metronome.layers

		array[i].beats = val > 1 ? val : 2

		setMetronome((prev) => ({
			...prev,
			layers: array,
		}))
	}

	const removeLayer = (index: number) => {
		let array = metronome.layers

		if (array.length > 1) {
			array.splice(index, 1)
			setMetronome((prev) => ({
				...prev,
				layers: array,
			}))
		}
	}

	const addLayer = () => {
		let array = metronome.layers

		if (array.length < 4) {
			array.push({ beats: 4, time: 1 })
			setMetronome((prev) => ({
				...prev,
				layers: array,
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
				<LayerClicks />
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
									onChange={(e) => changeLayerSettings(e, i)}
								/>
								<input
									type="range"
									name="numer-range"
									min="2"
									max="16"
									value={layer.beats}
									key={'range-' + i}
									onChange={(e) => changeLayerSettings(e, i)}
								/>

								<button
									className="suppr-btn"
									onClick={(e) => removeLayer(i)}
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
							max="600"
							value={metronome.tempo}
							onChange={(e) =>
								setMetronome((args) => ({
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
							max="600"
							value={metronome.tempo}
							onChange={(e) =>
								setMetronome((args) => ({
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
					</div>
				</div>
			</div>
		</div>
	)
}

export default App
