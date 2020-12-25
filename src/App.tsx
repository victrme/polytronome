import React, { useRef, useState } from 'react'
import logo from './logo.svg'
import './App.css'

function App() {
	const [metronome, setMetronome] = useState({
		time: 0,
		numer: 4,
		denom: 4,
		timeoutID: 0,
		isRunning: false,
		tempo: 120,
	})

	//utiliser ref pour les settimeout async
	const metronomeRef = useRef(metronome)
	metronomeRef.current = metronome

	function metronomeInterval() {
		const current = metronomeRef.current
		const tID = window.setTimeout(() => {
			//update numerateur
			setMetronome((args) => ({
				...args,
				timeoutID: tID + 1, //saves next timeout
				time: current.time === current.numer ? 1 : current.time + 1,
			}))

			//recursion
			metronomeInterval()

			//prevent low BPM to lag metronome
		}, BPMtoMs(current.tempo < 33 ? 33 : current.tempo))
	}

	function startMetronome() {
		if (metronome.isRunning === false) {
			metronomeInterval()
			setMetronome((args) => ({
				...args,
				isRunning: true,
			}))
		}
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

	const BPMtoMs = (bpm: number) => Math.floor(60000 / bpm)

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<h1>{metronome.time}</h1>

				<div>
					<h3>Time signature</h3>

					<input
						type="number"
						name="numer-num"
						id="numer-num"
						min="1"
						max="16"
						value={metronome.numer}
						onChange={(e) =>
							setMetronome((prev) => ({
								...prev,
								numer: +e.target.value,
							}))
						}
					/>

					<input
						type="range"
						name="numer-range"
						id="numer-range"
						min="1"
						max="16"
						value={metronome.numer}
						onChange={(e) =>
							setMetronome((prev) => ({
								...prev,
								numer: +e.target.value,
							}))
						}
					/>
				</div>

				<div>
					<h3>Tempo</h3>

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

				<div>
					<button onClick={startMetronome}>start</button>
					<button onClick={stopMetronome}>stop</button>
					<button onClick={(e) => console.log(metronome)}>
						show stats
					</button>
				</div>
			</header>
		</div>
	)
}

export default App
