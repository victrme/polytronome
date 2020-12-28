import React, { useRef, useState } from 'react'
import './App.css'

type Testouille = {
	habitation: number
	estHabite: boolean
}

function App() {
	const [metronome, setMetronome] = useState({
		time: 0,
		numer: 4,
		layers: [
			{
				tID: 0,
				time: 0,
				beats: 4,
			},
			{
				tID: 0,
				time: 0,
				beats: 5,
			},
		],
		timeoutID: 0,
		startTime: 0,
		isRunning: false,
		tempo: 120,
	})

	// time [3, 2]
	// sig  [4, 5]

	//utiliser ref pour les settimeout async
	const metronomeRef = useRef(metronome)
	metronomeRef.current = metronome

	function metronomeInterval(nextDelay?: number) {
		const current = metronomeRef.current

		//timeout delay control
		//prevent 0 BPM from looping too fast
		const BPMtoMs = (bpm: number) => Math.floor(60000 / bpm)
		const tempoMs = current.tempo < 1 ? 1800 : BPMtoMs(current.tempo)
		const timeoutDelay = nextDelay ? nextDelay : tempoMs

		const tID = window.setTimeout(() => {
			//update numerateur
			setMetronome((args) => ({
				...args,
				timeoutID: tID + 1, //saves next timeout
				time: current.time >= current.numer ? 1 : current.time + 1,
			}))

			//calculate latency
			const latencyOffset =
				current.startTime > 0
					? (Date.now() - current.startTime) % tempoMs
					: 0

			//console.log(latencyOffset)

			//recursion
			metronomeInterval(tempoMs - latencyOffset)
		}, timeoutDelay)
	}

	function startMetronome() {
		if (metronome.isRunning === false) {
			metronomeInterval()
			setMetronome((args) => ({
				...args,
				isRunning: true,
				startTime: Date.now(),
			}))
		}
	}

	function LayerClicks() {
		let listClicks: JSX.Element[] = []

		for (let index = 0; index < metronome.numer; index++) {
			listClicks.push(
				<div
					key={index}
					className={
						index <= metronome.time - 1 ? 'click on' : 'click'
					}
				/>
			)
		}

		return <div className="clicks-wrap">{listClicks}</div>
	}

	function LayerSettings() {
		const change = (e: any, i: number) => {
			let tempLayers = metronome.layers
			tempLayers[i].beats = +e.target.value

			setMetronome((a) => ({
				...a,
				layers: tempLayers,
			}))
		}

		let inputs: JSX.Element[] = []

		for (let index = 0; index < metronome.layers.length; index++) {
			let layer = metronome.layers[index]

			console.log(layer)

			inputs.push(
				<input
					type="number"
					name="numer-num"
					min="2"
					max="16"
					value={layer.beats}
					onChange={(e) => change(e, index)}
				/>,
				<input
					type="range"
					name="numer-range"
					min="2"
					max="16"
					value={layer.beats}
					onChange={(e) => change(e, index)}
				/>
			)
		}

		return <div className="setting">{inputs}</div>
	}

	function stopMetronome() {
		if (metronome.isRunning === true) {
			clearTimeout(metronome.timeoutID)
			setMetronome((args) => ({
				...args,
				isRunning: false,
			}))
		}
	}

	return (
		<div className="App">
			<div className="layer">
				<LayerClicks />
				{/* <LayerSettings /> */}
			</div>

			<div className="setting">
				<input
					type="number"
					name="numer-num"
					min="2"
					max="16"
					value={metronome.numer}
					onChange={(e) =>
						setMetronome((args) => ({
							...args,
							numer: +e.target.value,
						}))
					}
				/>
				,
				<input
					type="range"
					name="numer-range"
					min="2"
					max="16"
					value={metronome.numer}
					onChange={(e) =>
						setMetronome((args) => ({
							...args,
							numer: +e.target.value,
						}))
					}
				/>
				<input
					type="number"
					name="tempo-num"
					id="tempo-num"
					min="33"
					max="333"
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
					min="33"
					max="333"
					value={metronome.tempo}
					onChange={(e) =>
						setMetronome((args) => ({
							...args,
							tempo: +e.target.value,
						}))
					}
				/>
			</div>

			<br />
			<br />
			<br />

			<div>
				<button onClick={startMetronome}>start</button>
				<button onClick={stopMetronome}>stop</button>
				<button onClick={(e) => console.log(metronome)}>
					show stats
				</button>
			</div>
		</div>
	)
}

export default App
