import { useRef, useState, useEffect, useCallback } from 'react'
import { MoreSettings, Layer, Sounds } from './Types'
import { isMobileOnly } from 'react-device-detect'
import Pizzicato from 'pizzicato'
import Settings from './Settings'
import Clicks from './Clicks'
import Wheel from './Wheel'
import Range from './Range'
import Vectors from './Vectors'
import Octaves from './Octaves'
import Tempo from './Tempo'

const App = (): JSX.Element => {
	//
	// States & Values
	//

	const [times, setTimes] = useState<number[]>([1, 1])
	const [tempo, setTempo] = useState(80)
	const [startTime, setStartTime] = useState(Date.now)
	const [isRunning, setIsRunning] = useState(false)
	const [easy, setEasy] = useState(true)

	const [segment, setSegment] = useState({
		on: false,
		count: 0,
		ratios: [0],
		duplicates: [0],
		dupCount: 1,
	})

	const [moreSettings, setMoreSettings] = useState<MoreSettings>({
		theme: 2,
		fullscreen: false,
		unlimited: false,
		animations: true,
		all: false,
	})

	const [layers, setLayers] = useState<Layer[]>([
		{
			beats: 4,
			freq: {
				wave: 12,
				wood: 0,
				drum: 1,
			},
			type: 'sine',
			volume: 0.4,
		},
		{
			beats: 5,
			freq: {
				wave: 15,
				wood: 1,
				drum: 0,
			},
			type: 'sine',
			volume: 0.3,
		},
	])

	const [sounds, setSounds] = useState<Sounds>()

	const timesRef = useRef(times)
	const tempoRef = useRef(tempo)
	const startTimeRef = useRef(startTime)
	const isRunningRef = useRef(isRunning)
	const segmentRef = useRef(segment)
	const moreSettingsRef = useRef(moreSettings)
	const layersRef = useRef(layers)
	const IsTypingRef = useRef(false)

	timesRef.current = times
	tempoRef.current = tempo
	startTimeRef.current = startTime
	isRunningRef.current = isRunning
	layersRef.current = layers
	segmentRef.current = segment
	moreSettingsRef.current = moreSettings

	//
	//
	// Main functions
	//
	//

	function metronomeInterval(fixedTempoMs: number, nextDelay: number, id: number) {
		const timeoutID = window.setTimeout(() => {
			//
			// Short name for refs
			const layer = layersRef.current[id]
			const t_times = times

			// Quit recursion if stopped or removed
			if (!isRunningRef.current || layer === undefined) {
				clearTimeout(timeoutID)
				return
			}

			//
			// Segment count, if on
			//

			if (segmentRef.current.on) {
				const currSeg = segmentRef.current

				// If there are duplicates, do nothing but count duplicates
				if (currSeg.dupCount < currSeg.duplicates[currSeg.count]) currSeg.dupCount++
				else {
					// Reset duplicate count
					// Check for layers.time to know what currSeg should do
					currSeg.dupCount = 1
					const allAtOne = times.every(t => t === 1)
					const oneAtMax = times[id] === layer.beats
					currSeg.count = allAtOne ? 1 : oneAtMax ? 0 : currSeg.count + 1
				}

				setSegment({ ...currSeg })
			}

			//
			// Play sound
			//

			if (layer.type === 'sine' || layer.type === 'triangle') {
				const note = layer.freq.wave + 12
				const freq = 32.7 * 2 ** (note / 12)
				const wave = new Pizzicato.Sound({
					source: 'wave',
					options: {
						type: layer.type,
						volume: layer.volume,
						frequency: freq,
						attack: 0,
					},
				})

				wave.play()
				setTimeout(() => wave.stop(), 50)
			} else {
				if (sounds) {
					const freq = layer.freq[layer.type]
					const audio = new Audio(sounds[layer.type][freq].default)

					audio.volume = layer.volume
					audio.play()
				}
			}

			//
			// Update beat time
			// Return to 1 if 'time' above 'beats'
			//

			t_times[id] = times[id] >= layer.beats ? 1 : times[id] + 1
			setTimes([...t_times])

			// Calculate latency
			const start = startTimeRef.current
			const latencyOffset = start > 0 ? (Date.now() - start) % fixedTempoMs : 0

			// Recursion
			metronomeInterval(fixedTempoMs, fixedTempoMs - latencyOffset, id)
		}, nextDelay)
	}

	const launchMetronome = (runs: boolean) => {
		function start() {
			const calculateTempoMs = (beats: number, tmp: number) => {
				//
				// Set min / max if limited
				tmp = tmp < 30 ? 30 : tmp > 300 ? 300 : tmp

				return 60000 / ((beats / 4) * tmp)
			}

			layersRef.current.forEach((l, i) => {
				const tempoMs = calculateTempoMs(l.beats, tempoRef.current)
				metronomeInterval(tempoMs, tempoMs, i)
			})

			// Update to start state
			setStartTime(Date.now())
			setIsRunning(true)
		}

		function stop() {
			setSegment({ ...segment, count: 0 })
			setIsRunning(false)
			setStartTime(0)
			setTimes(times.map(x => (x = 1)))
		}

		runs ? stop() : start()
	}

	const restartMetronome = () => {
		if (isRunningRef.current) {
			launchMetronome(true)
			setTimeout(() => {
				if (!isRunningRef.current) launchMetronome(false)
			}, 200)
		}
	}

	const updateLayer = (add: boolean) => {
		const newLayers = [...layers]
		const newTimes = times
		const notes = [16, 19, 24]
		const beats = [5, 7, 10]

		// Remove
		if (!add && newLayers.length > 1) {
			newLayers.splice(-1, 1)
			newTimes.pop()
		}

		// Add Unlimited
		// Add limited
		if (
			(add && moreSettings.unlimited) ||
			(add && !moreSettings.unlimited && newLayers.length < 4)
		) {
			newLayers.push({
				beats: beats[newLayers.length - 1],
				freq: {
					wave: notes[newLayers.length - 1],
					wood: 0,
					drum: 1,
				},
				type: 'sine',
				volume: 0.4,
			})
			newTimes.push(0)
		}

		// Update
		setLayers([...newLayers])
		setTimes(newTimes)
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
		layers.forEach(layer => {
			for (let k = 1; k < layer.beats; k++) division.push(k / layer.beats)
		})
		division.sort()

		setSegment({
			...segment,
			ratios: getRatios(division),
			duplicates: getDuplicates(division),
		})
	}, [layers, segment])

	//
	//
	// More Settings functions
	//
	//

	const randomizeLayers = () => {
		const rand = (a: number, b: number) => Math.random() * (b - a) + a

		setLayers([
			...layersRef.current.map(layer => ({
				...layer,
				beats: +rand(2, 16).toFixed(0),
			})),
		])
		restartMetronome()
	}

	const changeTempo = (amount: number) => {
		const up = amount > tempo
		const max = up ? 300 : 30
		const outOfBound = up ? amount > max : amount < max

		setTempo(outOfBound ? max : amount)
	}

	const changeRange = (index: number, num: number) => {
		const newLayers = [...layers]
		newLayers[index].volume = num
		setLayers(newLayers)
	}

	const changeFreqs = (which: string, i: number) => {
		const newLayers = [...layers]
		newLayers[i].freq[which] = (layers[i].freq[which] + 1) % 3
		setLayers(newLayers)
	}

	const changeClickType = (type: string, i: number) => {
		const clickTypeList = ['wood', 'drum', 'sine', 'triangle']
		const newLayers = [...layers]

		clickTypeList.forEach((x, ii) => {
			if (x === type) {
				newLayers[i].type = clickTypeList[(ii + 1) % clickTypeList.length]
				setLayers(newLayers)
			}
		})
	}

	const LayerType = ({ layer, i }) => {
		let result: any = <div></div>

		if (layer.type === 'wood') {
			result = (
				<div className="woodblocks" onClick={() => changeFreqs('wood', i)}>
					<div className={layer.freq.wood > -1 ? 'on' : ''}></div>
					<div className={layer.freq.wood > 0 ? 'on' : ''}></div>
					<div className={layer.freq.wood > 1 ? 'on' : ''}></div>
				</div>
			)
		}

		if (layer.type === 'drum') {
			result = (
				<div className="drumset" onClick={() => changeFreqs('drum', i)}>
					<div>{layer.freq.drum}</div>
				</div>
			)
		}

		if (layer.type === 'sine' || layer.type === 'triangle') {
			result = (
				<div className="notes-wrap">
					<Wheel
						freq={layer.freq.wave}
						update={result => wheelUpdate('frequency', result, i)}
					></Wheel>
					<Octaves freq={layer.freq.wave}></Octaves>
				</div>
			)
		}

		return result
	}

	//
	//
	// Wheel & Range
	//
	//

	const wheelUpdate = (what: string, el: any, index = 0) => {
		const newLayers = [...layers]

		if (what === 'beats') {
			newLayers[index][what] = el + 2
			setLayers([...newLayers])
		}
		if (what === 'frequency') {
			newLayers[index].freq.wave = el
			setLayers([...newLayers])
		}
		if (what === 'tempo') changeTempo(+el)
		if (what === 'beats') restartMetronome()
	}

	//
	//
	//	Effects
	//
	//

	useEffect(() => {
		document.addEventListener('keydown', (e: KeyboardEvent) => {
			//
			// Lose focus before firing
			if (document.activeElement) {
				const el = document.activeElement as HTMLButtonElement
				el.blur()
			}

			// Spacebar control metronome
			if (e.code === 'Space' && !IsTypingRef.current)
				launchMetronome(isRunningRef.current)

			// Tempo up by 10 if shift
			if (e.code === 'ArrowUp')
				wheelUpdate('tempo', tempoRef.current + (e.shiftKey ? 10 : 1))

			// Tempo down by 10 if shift
			if (e.code === 'ArrowDown')
				wheelUpdate('tempo', tempoRef.current - (e.shiftKey ? 10 : 1))

			e.stopPropagation()
			return false
		})

		// Wake from sleep (if you have slept)
		if (localStorage.sleep) {
			//applySaved(JSON.parse(localStorage.sleep))
		}

		// Updates fullscreen if left by something else than toggle
		document.onfullscreenchange = () => {
			if (document.fullscreenElement === null)
				setMoreSettings(prev => ({
					...prev,
					fullscreen: false,
				}))
		}

		//Init sounds requires
		setSounds(require('./Sounds').default)

		// eslint-disable-next-line
	}, [])

	useEffect(() => {
		initSegment()
		// eslint-disable-next-line
	}, [layers])

	//
	//
	//
	//
	//

	return (
		<div
			className={'polytronome' + (isMobileOnly ? ' mobile' : '') + (easy ? ' easy' : '')}
		>
			<main>
				<div className="title">
					<p>Train your polyrythms</p>
					<h1>Polytronome</h1>
				</div>

				<Clicks times={times} layers={layers} segment={segment}></Clicks>

				<div className="layers-table-wrap">
					<div className="layers-table">
						{easy ? (
							<div className="ls-row ls-labels">
								<div>beats</div>
							</div>
						) : (
							''
						)}

						{layers.map((layer, i) => (
							<div className="ls-row" key={i}>
								<Wheel
									beats={layer.beats}
									update={result => wheelUpdate('beats', result, i)}
								></Wheel>

								{easy ? (
									''
								) : (
									<div className="ls-type">
										<Vectors
											type={layer.type}
											change={() => changeClickType(layer.type, i)}
										></Vectors>
									</div>
								)}

								{easy ? '' : <LayerType layer={layer} i={i}></LayerType>}

								{easy ? (
									''
								) : (
									<div>
										<Range
											volume={layer.volume}
											update={result => changeRange(i, result)}
										></Range>
									</div>
								)}
							</div>
						))}

						{easy ? (
							''
						) : (
							<div className="ls-row ls-labels">
								<div>beats</div>
								<div>type</div>
								<div>note</div>
								<div>volume</div>
							</div>
						)}
					</div>

					<div className="ls-buttons">
						<button className="randomize" onClick={randomizeLayers}>
							{easy ? 'shuffle' : '🎲'}
						</button>
						<div className="plus-minus">
							<button
								className={layers.length === 1 ? 'off' : ''}
								onClick={() => updateLayer(false)}
							>
								-
							</button>
							<button
								className={layers.length === 4 ? 'off' : ''}
								onClick={() => updateLayer(true)}
							>
								+
							</button>
						</div>
					</div>
				</div>

				<div className="tempo-n-start">
					<Tempo
						restart={restartMetronome}
						update={changeTempo}
						wheelUpdate={wheelUpdate}
						tempo={tempo}
						tempoRef={tempoRef}
					></Tempo>

					<div className="start-button">
						<button onMouseDown={() => launchMetronome(isRunning)}>
							{isRunning ? 'Stop' : 'Start'}
						</button>
					</div>
				</div>
			</main>

			<div className="bottom">
				<div className="links">
					<a href="https://docs.polytronome.com">about & docs</a>
					<a href="https://victr.me">created by victr</a>
				</div>
				<div>
					<Settings
						easy={easy}
						segment={segment}
						moreSettings={moreSettings}
						setMoreSettings={setMoreSettings}
						setSegment={setSegment}
						setEasy={setEasy}
					></Settings>
				</div>
			</div>
		</div>
	)
}

export default App
