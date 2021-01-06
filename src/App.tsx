import React, { useRef, useState } from 'react'
import Pizzicato from 'pizzicato'
import './App.css'

function App() {
	const [metronome, setMetronome] = useState({
		numer: 4,
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

	const BPMtoMs = (bpm: number) => Math.floor(60000 / bpm)

	//utiliser ref pour les settimeout async
	const metronomeRef = useRef(metronome)
	metronomeRef.current = metronome

	function metronomeInterval(nextDelay: number, index: number) {
		const current = metronomeRef.current

		//timeout delay control
		//prevent 0 BPM from looping too fast

		const ratioedBPM =
			(current.layers[index].beats / current.numer) * current.tempo
		const tempoMs = ratioedBPM < 1 ? 1800 : BPMtoMs(ratioedBPM)
		const timeoutDelay = nextDelay ? nextDelay : tempoMs

		window.setTimeout(() => {
			// "t_" for timeout
			// because current is now too old
			const t_current = metronomeRef.current

			//update layers
			let array = t_current.layers
			const that = array[index]

			//if more than beats, start over
			array[index].time = that.time >= that.beats ? 1 : that.time + 1

			setMetronome((args) => ({
				...args,
				layers: array,
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
			if (t_current.isRunning === false) return
			else metronomeInterval(tempoMs - latencyOffset, index)
		}, timeoutDelay)
	}

	function startMetronome() {
		if (metronome.isRunning === false) {
			//start a metronome for each layer
			metronome.layers
				.map(
					(layer) => (layer.beats / metronome.numer) * metronome.tempo
				)
				.forEach((delay, i) => metronomeInterval(BPMtoMs(delay), i))

			//update to start state
			setMetronome((args) => ({
				...args,
				isRunning: true,
				startTime: Date.now(),
			}))
		}
	}

	function stopMetronome() {
		if (metronome.isRunning === true) {
			//travail en cours

			type Layers = {
				beats: number
				time: number
			}[]

			let newlayers: Layers = []
			metronome.layers.forEach((l) => {
				l.time = 0
				newlayers.push(l)
			})

			setMetronome((args) => ({
				...args,
				layers: newlayers,
				isRunning: false,
				startTime: 0,
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
		let array = metronome.layers
		array[i].beats = +e.target.value

		setMetronome((prev) => ({
			...prev,
			layers: array,
		}))
	}

	return (
		<div className="App">
			<div className="layers">
				<LayerClicks />
			</div>

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
						</div>
					)
				})}
			</div>

			<div className="global-settings">
				<div className="setting">
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
					<button onMouseDown={startMetronome}>start</button>
					<button onMouseDown={stopMetronome}>stop</button>
					<button onClick={(e) => console.log(metronome)}>
						show stats
					</button>
				</div>
			</div>
		</div>
	)
}

export default App
