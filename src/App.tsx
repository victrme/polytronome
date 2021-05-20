import { useRef, useState, useEffect, useCallback } from 'react'
import { MoreSettings, Layer, Sounds } from './Types'
import { isMobileOnly } from 'react-device-detect'
import Pizzicato from 'pizzicato'
import Settings from './Settings'
import Themes from './Themes'
import Principal from './Principal'
import './App.scss'

function App(): JSX.Element {
	//
	// States & Values
	//

	const clickTypeList = ['wood', 'drum', 'sine', 'triangle']

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
	})

	const [times, setTimes] = useState<number[]>([1, 1])
	const [tempo, setTempo] = useState(80)
	const [startTime, setStartTime] = useState(Date.now)
	const [isRunning, setIsRunning] = useState(false)

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
				wave: 19,
				wood: 1,
				drum: 0,
			},
			type: 'triangle',
			volume: 0.3,
		},
	])

	const [sounds, setSounds] = useState<Sounds>()

	// Use Refs for async timeouts
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
	// IsTypingRef.current = IsTyping

	//
	// Small functions
	//

	const calculateTempoMs = (beats: number, tmp: number) => {
		//
		// Set min / max if limited
		if (!moreSettingsRef.current.unlimited) tmp = tmp < 30 ? 30 : tmp > 300 ? 300 : tmp

		return 60000 / ((beats / 4) * tmp)
	}

	function randInInterval(a: number, b: number) {
		return Math.random() * (b - a) + a
	}

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
				beats: 4,
				freq: {
					wave: 12,
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

	const applyTheme = (theme: number) => {
		const root = document.querySelector(':root')! as HTMLBodyElement

		root.style.setProperty('--background', Themes[theme].background)
		root.style.setProperty('--accent', Themes[theme].accent)
		root.style.setProperty('--dim', Themes[theme].dim)
		root.style.setProperty('--dimmer', Themes[theme].dimmer)
		root.style.setProperty('--buttons', Themes[theme].buttons || Themes[theme].dim)
	}

	const randomizeLayers = () => {
		setLayers([
			...layersRef.current.map(layer => ({
				...layer,
				beats: +randInInterval(2, 16).toFixed(0),
			})),
		])
		restartMetronome()
	}

	const changeTheme = (theme: number) => {
		const newTheme = (theme + 1) % Themes.length

		applyTheme(newTheme)

		setMoreSettings(prev => ({ ...prev, theme: newTheme }))
		localStorage.theme = newTheme
	}

	const changeClickType = (type: string, i: number) => {
		const newLayers = [...layers]

		clickTypeList.forEach((x, ii) => {
			if (x === type) {
				newLayers[i].type = clickTypeList[(ii + 1) % clickTypeList.length]

				setLayers([...layers])
			}
		})
	}

	const changeFullscreen = (state: boolean) => {
		if (!state && document.fullscreenElement === null) {
			const wrap = document.querySelector('.settings-wrap') as HTMLDivElement
			document.querySelector('.App')!.requestFullscreen()
			wrap.style.overflowY = 'auto'
		} else if (document.fullscreenElement !== null) {
			document.exitFullscreen()
		}

		setMoreSettings(prev => ({
			...prev,
			fullscreen: !state,
		}))
	}

	const changeAnimations = () => {
		const appDOM = document.querySelector('.App') as HTMLDivElement

		moreSettings.animations
			? appDOM.classList.add('performance')
			: appDOM.classList.remove('performance')

		setMoreSettings(prev => ({
			...prev,
			animations: moreSettings.animations ? false : true,
		}))
	}

	const changeTempo = (amount: number) => {
		const up = amount > tempo
		const max = up ? 300 : 30
		const outOfBound = up ? amount > max : amount < max

		setTempo(outOfBound ? max : amount)
	}

	const changeFreqs = (which: string, i: number) => {
		const newLayers = [...layers]
		newLayers[i].freq[which] = (layers[i].freq[which] + 1) % 3
		setLayers([...newLayers])
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

	const rangeUpdate = (index: number, num: number) => {
		//
		// For defunct release
		//const toSave = what === 'release' ? (num < 0.01 ? 0.01 : num) : num

		const newLayers = [...layers]
		layers[index].volume = num

		setLayers([...newLayers])
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
		<div className={'App ' + (isMobileOnly ? 'mobile' : 'mobile')}>
			<Principal
				times={times}
				layers={layers}
				segment={segment}
				isRunning={isRunning}
				wheelUpdate={wheelUpdate}
				changeFreqs={changeFreqs}
				rangeUpdate={rangeUpdate}
				updateLayer={updateLayer}
				changeClickType={changeClickType}
				launchMetronome={launchMetronome}
				randomizeLayers={randomizeLayers}
			></Principal>

			<Settings
				tempo={tempo}
				segment={segment}
				tempoRef={tempoRef}
				moreSettings={moreSettings}
				setSegment={setSegment}
				changeTempo={changeTempo}
				changeTheme={changeTheme}
				wheelUpdate={wheelUpdate}
				changeAnimations={changeAnimations}
				changeFullscreen={changeFullscreen}
				restartMetronome={restartMetronome}
			></Settings>
		</div>
	)
}

export default App
