import { useRef, useState, useEffect, useCallback } from 'react'
import Pizzicato from 'pizzicato'
import Wheel from './Wheel'
import Range from './Range'
import './App.css'

function App(): JSX.Element {
	/**
	 *
	 * States & Values
	 *
	 */

	const defaultLayer = {
		id: setRandomID(),
		beats: 4,
		time: 1,
		frequency: 0,
		octave: 3,
	}

	const [tempoInput, setTempoInput] = useState(80)
	const [moreSettings, setMoreSettings] = useState({
		theme: 'lightgreen',
		sound: {
			type: 'sawtooth',
			release: 0.1,
			volume: 0.1,
		},
		segment: {
			on: false,
			count: 0,
			ratios: [0],
			duplicates: [0],
			dupCount: 1,
		},

		unlimited: false,
	})

	const [metronome, setMetronome] = useState({
		layers: [
			{
				id: setRandomID(),
				beats: 4,
				time: 1,
				frequency: 0,
				octave: 3,
			},
			{
				id: setRandomID(),
				beats: 5,
				time: 1,
				frequency: 7,
				octave: 3,
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
	const moreSettingsRef = useRef(moreSettings)
	const tempoInputRef = useRef(tempoInput)
	const metronomeRef = useRef(metronome)

	metronomeRef.current = metronome
	tempoInputRef.current = tempoInput
	moreSettingsRef.current = moreSettings

	/**
	 *
	 * Small functions
	 *
	 */

	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent
	)

	const getLayerFromId = (id: string) =>
		metronomeRef.current.layers.filter(ll => ll.id === id)[0]

	const calculateTempoMs = (beats: number, tempo: number) => {
		const crazy = moreSettingsRef.current.unlimited
		const change = (n: number) => {
			setTempoInput(n)
			tempo = n
		}

		if (!crazy && tempo < 33) change(33)
		if (!crazy && tempo > 250) change(250)

		return 60000 / ((beats / 4) * tempo)
	}

	function randInInterval(a: number, b: number) {
		return Math.random() * (b - a) + a
	}

	function setRandomID() {
		let xx = ''
		while (xx.length < 8) xx += String.fromCharCode(randInInterval(97, 122))
		return xx
	}

	const initSegment = useCallback(() => {
		function getDuplicates(list: number[]) {
			// Creates list of duplicates per division
			// [1, 3, 1 ...]

			const duplicates: number[] = []

			list.forEach((elem, index) =>
				list[index] !== list[index - 1]
					? duplicates.push(1)
					: duplicates[duplicates.length - 1]++
			)

			return duplicates
		}

		function getRatios(list: number[]) {
			// Removes duplicates
			list = [0, ...new Set(list), 1]
			const ratios: number[] = []

			// segment ratio [next - current]
			list.forEach((elem, i) => {
				if (list[i + 1]) ratios.push(list[i + 1] - elem)
			})

			return ratios
		}

		const division: number[] = []

		// Fill with all layers divisions & sort
		metronome.layers.forEach(layer => {
			for (let k = 1; k < layer.beats; k++) division.push(k / layer.beats)
		})
		division.sort()

		// Apply functions
		setMoreSettings(prev => ({
			...prev,
			segment: {
				...prev.segment,
				ratios: getRatios(division),
				duplicates: getDuplicates(division),
			},
		}))
	}, [metronome.layers])

	useEffect(() => {
		// Add Spacebar to control metronome
		document.addEventListener('keydown', (e: KeyboardEvent) => {
			if (e.code === 'Space') {
				launchMetronome(metronomeRef.current.isRunning)
				e.preventDefault()
				return false
			}
		})

		// eslint-disable-next-line
	}, [])

	useEffect(() => {
		if (!metronome.isRunning) initSegment()
	}, [initSegment, metronome])

	//
	//
	// Main functions
	//
	//

	function metronomeInterval(nextDelay: number, id: string) {
		//
		const timeoutID = window.setTimeout(() => {
			const current = { ...metronomeRef.current }
			const layer = { ...getLayerFromId(id) }

			// Quit recursion if stopped or removed
			if (!current.isRunning || layer === undefined) {
				clearTimeout(timeoutID)
				return
			}

			const tempoMs = calculateTempoMs(layer.beats, current.tempo)
			const time = layer.time >= layer.beats ? 1 : layer.time + 1

			// Update beat time
			// Return to 1 if 'time' above 'beats'
			setMetronome(prev => ({
				...prev,
				layers: prev.layers.map(layer =>
					layer.id === id ? { ...layer, time } : layer
				),
			}))

			// Update Segment Count, if its on
			const segment = { ...moreSettingsRef.current.segment }

			if (segment.on) {
				//
				let segmentTemp = segment

				if (segment.dupCount < segment.duplicates[segment.count]) {
					// If duplicates, don't move count
					segmentTemp.dupCount++
				} else {
					segmentTemp.dupCount = 1

					// Control count interval edges
					// Conditions for [0 ... n]
					const allAtOne = current.layers.every(l => l.time === 1)
					const oneAtMax = layer.time === layer.beats
					segmentTemp.count = allAtOne ? 1 : oneAtMax ? 0 : segment.count + 1
				}

				setMoreSettings(prev => ({
					...prev,
					segment: segmentTemp,
				}))
			}

			//
			// Play sound
			//
			const note = layer.frequency + 12 * layer.octave
			const freq = 16.35 * 2 ** (note / 12)
			const wave = new Pizzicato.Sound({
				source: 'wave',
				options: {
					...moreSettingsRef.current.sound,
					frequency: freq,
					attack: 0,
				},
			})
			wave.play()
			setTimeout(() => wave.stop(), 20)

			// Calculate latency
			const latencyOffset =
				current.startTime > 0 ? (Date.now() - current.startTime) % tempoMs : 0

			// Recursion
			metronomeInterval(tempoMs - latencyOffset, id)
		}, nextDelay)
	}

	function launchMetronome(runs: boolean) {
		const current = { ...metronomeRef.current }

		if (runs) {
			//
			// Stops
			//
			setMoreSettings(prev => ({
				...prev,
				segment: {
					...prev.segment,
					count: 0,
				},
			}))
			setMetronome(args => ({
				...args,

				// Each set to new defaults
				layers: current.layers.map(l => ({
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
			current.layers.forEach(layer =>
				metronomeInterval(calculateTempoMs(layer.beats, current.tempo), layer.id)
			)
			// Update to start state
			setMetronome(args => ({
				...args,
				isRunning: true,
				startTime: Date.now(),
			}))
		}
	}

	const randomizeLayers = () => {
		const layers: any[] = []

		metronomeRef.current.layers.forEach(layer => {
			layers.push({ ...layer, beats: +randInInterval(2, 16).toFixed(0) })
		})

		setMetronome(prev => ({ ...prev, layers }))
	}

	const wheelUpdate = (what: string, el: any, index: number) => {
		const newLayers = [...metronome.layers]
		newLayers[index][what] = what === 'beats' ? el + 2 : el

		setMetronome(prev => ({ ...prev, layers: newLayers }))
	}

	const updateLayer = (add: boolean, index: number = 0) => {
		const newLayers = [...metronome.layers]

		// Remove
		if (!add && newLayers.length > 1) newLayers.splice(index, 1)

		// Add Unlimited
		// Add limited
		if (
			(add && moreSettings.unlimited) ||
			(add && !moreSettings.unlimited && newLayers.length < 3)
		)
			newLayers.push(defaultLayer)

		// Update
		setMetronome(prev => ({ ...prev, layers: newLayers }))
	}

	const updateTempo = (tempo: number) => {
		if (isNaN(tempo) || tempo.toString().length > 6) return
		else {
			setTempoInput(tempo)
			setMetronome(args => ({ ...args, tempo }))
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

			const averageTempo = Math.floor(
				60000 / (cumul.reduce((a: number, b: number) => a + b) / cumul.length)
			)

			setTempoInput(averageTempo)
			setMetronome(prev => ({ ...prev, tap, tempo: averageTempo }))
		}
	}

	return (
		<div className={'App ' + moreSettings.theme}>
			<div className="principal">
				<div className="sticky">
					<div className="title">
						<p>Train your polyrythms</p>
						<h1>Polytronome</h1>
					</div>

					<div
						className={`clicks ${
							moreSettingsRef.current.segment.on ? 'isSegment' : 'isLayers'
						}`}
					>
						<div className="segment">
							<div className="click-row">
								{moreSettings.segment.ratios.map((ratio, i) => (
									<span
										key={i}
										className={
											'click' +
											(moreSettings.segment.count === i ? ' on' : '')
										}
										style={{
											width: `calc(${ratio * 100}% - 10px)`,
										}}
									/>
								))}
							</div>
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
									<div key={jj} className="click-row">
										{children}
									</div>
								)
							})}
						</div>
					</div>

					<div className="start-button">
						<button onMouseDown={() => launchMetronome(metronome.isRunning)}>
							{metronome.isRunning ? 'Stop' : 'Start'}
						</button>
					</div>
				</div>
			</div>

			<div className="settings-wrap">
				<div className="setting boxed tempo">
					<div>
						<h3>Tempo</h3>
						<button onClick={tapTempo}>tap</button>
					</div>

					<Range></Range>

					{/* <div>
						<button onClick={() => updateTempo(metronome.tempo - 1)}>-</button>
						<input
							type="range"
							name="tempo-range"
							id="tempo-range"
							min="33"
							max="250"
							value={metronome.tempo}
							onChange={e => updateTempo(+e.target.value)}
						/>
						<button onClick={() => updateTempo(metronome.tempo + 1)}>+</button>
						<input
							type="text"
							name="tempo-text"
							id="tempo-text"
							value={tempoInput}
							onChange={e => updateTempo(+e.target.value)}
						/>
					</div> */}
				</div>

				<div className="boxed">
					<h3>Beats & Notes</h3>

					{metronome.layers.map((l, i) => (
						<div className="setting layer" key={i}>
							<Wheel
								index={i}
								what={'beats'}
								metronome={metronome}
								update={result => wheelUpdate('beats', result, i)}
							></Wheel>

							<div className="notes-wrap">
								<Wheel
									index={i}
									what={'frequency'}
									metronome={metronome}
									update={result => wheelUpdate('frequency', result, i)}
								></Wheel>

								<Wheel
									index={i}
									what={'octave'}
									metronome={metronome}
									update={result => wheelUpdate('octave', result, i)}
								></Wheel>
							</div>

							<button className="suppr-btn" onClick={() => updateLayer(false, i)}>
								&times;
							</button>
						</div>
					))}

					<div className="add-layer">
						<button
							className={
								!moreSettings.unlimited && metronome.layers.length === 3
									? 'off'
									: ''
							}
							onClick={() => updateLayer(true)}
						>
							add
						</button>
					</div>
				</div>

				<div className="setting boxed sound">
					<h3>Click Sound</h3>

					<div className="sliders">
						<div className="release">
							<h5>Release</h5>
							<Range></Range>
						</div>

						<div className="volume">
							<h5>Volume</h5>
							<Range></Range>
						</div>

						<div className="waveform">
							<h5>Waveform</h5>
							<select
								id="waveform"
								name="waveform"
								value={moreSettings.sound.type}
								onChange={e =>
									setMoreSettings(prev => ({
										...prev,
										sound: { ...prev.sound, type: e.target.value },
									}))
								}
							>
								<option value="sine">sine</option>
								<option value="triangle">triangle</option>
								<option value="sawtooth">sawtooth</option>
								<option value="square">square</option>
							</select>
						</div>

						{/* <label>
							<input
								type="range"
								name="release-range"
								key={'release-range'}
								min="0"
								max="1"
								step="0.01"
								value={moreSettings.sound.release}
								onChange={e =>
									setMoreSettings(prev => ({
										...prev,
										sound: { ...prev.sound, release: +e.target.value },
									}))
								}
							/>
						</label>
					</div>

					<div className="volume">
						<label>
							<p>volume</p>
							<input
								type="range"
								name="volume-range"
								key={'volume-range'}
								min="0.01"
								max="1"
								step="0.01"
								value={moreSettings.sound.volume}
								onChange={e =>
									setMoreSettings(prev => ({
										...prev,
										sound: { ...prev.sound, volume: +e.target.value },
									}))
								}
							/>
							<p>volume</p>
						</label> */}
					</div>
				</div>

				<div className="setting theme">
					<h5>Theme</h5>
				</div>

				<div className="theme-preview">
					<div className="tp-dark">
						<div className="tp-mini-click"></div>
						<div className="tp-mini-click"></div>
						<div className="tp-mini-click"></div>
					</div>
					<div className="tp-light">
						<div className="tp-mini-click"></div>
						<div className="tp-mini-click"></div>
						<div className="tp-mini-click"></div>
					</div>
					<div className="tp-black">
						<div className="tp-mini-click"></div>
						<div className="tp-mini-click"></div>
						<div className="tp-mini-click"></div>
					</div>
					<div className="tp-coffee">
						<div className="tp-mini-click"></div>
						<div className="tp-mini-click"></div>
						<div className="tp-mini-click"></div>
					</div>
					<div className="tp-pink">
						<div className="tp-mini-click"></div>
						<div className="tp-mini-click"></div>
						<div className="tp-mini-click"></div>
					</div>

					<div className="tp-monokai">
						<div className="tp-mini-click"></div>
						<div className="tp-mini-click"></div>
						<div className="tp-mini-click"></div>
					</div>
				</div>

				<div className="setting randomize">
					<button name="display" id="display" onClick={randomizeLayers}>
						Randomize
					</button>
				</div>

				<div className="setting fullscreen">
					<button name="display" id="display" onClick={() => console.log('soon')}>
						fullscreen
					</button>
				</div>

				<div className="setting display">
					<h5>Click display</h5>

					<button
						name="display"
						id="display"
						onClick={() =>
							setMoreSettings(prev => ({
								...prev,
								segment: {
									...prev.segment,
									on: moreSettings.segment.on ? false : true,
								},
							}))
						}
					>
						{moreSettings.segment.on ? 'segment' : 'layers'}
					</button>
				</div>

				<div className="setting unlimited">
					<div>
						<h5>Unlimited Mode</h5>
						<small>
							⚠️ This can slow down your {isMobile ? 'phone' : 'computer'}
						</small>
					</div>

					<button
						name="unlimited"
						id="unlimited"
						onClick={() =>
							setMoreSettings(prev => ({
								...prev,
								unlimited: moreSettings.unlimited ? false : true,
							}))
						}
					>
						{moreSettingsRef.current.unlimited ? 'on' : 'off'}
					</button>
				</div>
			</div>
		</div>
	)
}

export default App
