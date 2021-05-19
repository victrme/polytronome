import { useRef, useState, useEffect, useCallback } from 'react'
import { MoreSettings, Layer, Sounds } from './Types'
import { isMobileOnly } from 'react-device-detect'
import { useBeforeunload } from 'react-beforeunload'
import Pizzicato from 'pizzicato'
import Wheel from './Wheel'
import Range from './Range'
import Octaves from './Octaves'
import Tempo from './Tempo'
import Waveform from './Waveform'
import Layers from './Layers'
import './App.scss'

function App(): JSX.Element {
	//
	// States & Values
	//

	const ThemeList = [
		{
			name: 'black',
			background: '#000000',
			accent: '#bbbbbb',
			dim: '#dddddd1a',
			dimmer: '#bbbbbb1a',
		},
		{
			name: 'dark',
			background: '#282c34',
			accent: '#ffffff',
			dim: '#5c657736',
			dimmer: '#5c657736',
		},
		{
			name: 'monokai',
			background: '#272822',
			accent: '#a6e22e',
			dim: '#fd971f33',
			dimmer: '#e87d3e22',
			buttons: '#FD971F60',
		},
		{
			name: 'pink',
			background: '#f37f83',
			accent: '#ffdce2',
			dim: '#e53c584d',
			dimmer: '#ffffff2a',
		},

		{
			name: 'coffee',
			background: '#fbefdf',
			accent: '#8d6852',
			dim: '#dac6b5',
			dimmer: '#dac6b52a',
		},
		{
			name: 'beach',
			background: '#fff9e9',
			accent: '#4b9ab4',
			dim: '#f6dbbc',
			dimmer: '#f6dbbc50',
		},
		{
			name: 'contrast',
			background: '#ffffff',
			accent: '#222222',
			dim: '#00000033',
			dimmer: '#00000010',
		},
	]

	const clickTypeList = ['wood', 'drum', 'sine', 'triangle']

	const [moreSettings, setMoreSettings] = useState<MoreSettings>({
		theme: 2,
		segment: {
			on: false,
			count: 0,
			ratios: [0],
			duplicates: [0],
			dupCount: 1,
		},
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
			frequency: 12,
			type: 'sine',
			volume: 0.4,
		},
		{
			beats: 5,
			frequency: 19,
			type: 'triangle',
			volume: 0.3,
		},
	])

	const [sounds, setSounds] = useState<Sounds>()

	const defaultLayer: Layer = {
		beats: 4,
		frequency: 12,
		type: 'sine',
		volume: 0.4,
	}

	// const [selectedProfile, setSelectedProfile] = useState(0)
	// const [IsTyping, setIsTyping] = useState(false)

	// Use Refs for async timeouts
	const timesRef = useRef(times)
	const tempoRef = useRef(tempo)
	const isRunningRef = useRef(isRunning)
	const moreSettingsRef = useRef(moreSettings)
	const layersRef = useRef(layers)
	const IsTypingRef = useRef(false)

	timesRef.current = times
	tempoRef.current = tempo
	isRunningRef.current = isRunning
	layersRef.current = layers
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
			const moreSett = { ...moreSettingsRef.current }
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

			if (moreSett.segment.on) {
				const segment = moreSett.segment

				// If there are duplicates, do nothing but count duplicates
				if (segment.dupCount < segment.duplicates[segment.count]) segment.dupCount++
				else {
					// Reset duplicate count
					// Check for layers.time to know what segment should do
					segment.dupCount = 1
					const allAtOne = times.every(t => t === 1)
					const oneAtMax = times[id] === layer.beats
					segment.count = allAtOne ? 1 : oneAtMax ? 0 : segment.count + 1
				}

				moreSett.segment = segment
				setMoreSettings(moreSett)
			}

			//
			// Play sound
			//

			if (layer.type === 'sine' || layer.type === 'triangle') {
				const note = layer.frequency + 12
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
					const freq = layer.frequency > 2 ? 2 : layer.frequency

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
			const latencyOffset = startTime > 0 ? (Date.now() - startTime) % fixedTempoMs : 0

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
			setMoreSettings(prev => ({
				...prev,
				segment: {
					...prev.segment,
					count: 0,
				},
			}))

			setIsRunning(false)
			setStartTime(0)

			// reset times
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
			newLayers.push(defaultLayer)
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

		// Apply functions
		setMoreSettings(prev => ({
			...prev,
			segment: {
				...prev.segment,
				ratios: getRatios(division),
				duplicates: getDuplicates(division),
			},
		}))
	}, [layers])

	//
	//
	// More Settings functions
	//
	//

	const applyTheme = (theme: number) => {
		const root = document.querySelector(':root')! as HTMLBodyElement

		root.style.setProperty('--background', ThemeList[theme].background)
		root.style.setProperty('--accent', ThemeList[theme].accent)
		root.style.setProperty('--dim', ThemeList[theme].dim)
		root.style.setProperty('--dimmer', ThemeList[theme].dimmer)
		root.style.setProperty('--buttons', ThemeList[theme].buttons || ThemeList[theme].dim)
	}

	const changeTheme = (theme: number) => {
		const newTheme = (theme + 1) % ThemeList.length

		applyTheme(newTheme)

		setMoreSettings(prev => ({ ...prev, theme: newTheme }))
		localStorage.theme = newTheme
	}

	const randomizeLayers = () => {
		const newLayers = [...layers]

		layersRef.current.forEach(layer =>
			newLayers.push({ ...layer, beats: +randInInterval(2, 16).toFixed(0) })
		)

		setLayers([...newLayers])
		restartMetronome()
	}

	const changeClickType = (type: string, i: number) => {
		const newLayers = [...layers]

		clickTypeList.forEach((x, ii) => {
			if (x === type) {
				newLayers[i].type = clickTypeList[(ii + 1) % clickTypeList.length]

				if (type === 'wood') newLayers[i].frequency = 0

				setLayers([...layers])
			}
		})
	}

	const setFullscreen = (state: boolean) => {
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

		if (moreSettings.animations) {
			appDOM.classList.add('performance')
		} else {
			appDOM.classList.remove('performance')
		}

		setMoreSettings(prev => ({
			...prev,
			animations: moreSettings.animations ? false : true,
		}))
	}

	//
	//
	// Tempo
	//
	//

	const changeTempo = (amount: number) => {
		const up = amount > tempo
		const max = up ? 300 : 30
		const outOfBound = up ? amount > max : amount < max

		setTempo(outOfBound ? max : amount)
	}

	//
	//
	// Wheel & Range
	//
	//

	const wheelUpdate = (what: string, el: any, index = 0) => {
		if (['beats', 'frequency'].indexOf(what) !== -1) {
			const newLayers = [...layers]
			const toSave = what === 'beats' ? el + 2 : el

			newLayers[index][what] = toSave
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
	// Profiles
	//
	//

	// const pfStorage = {
	// 	available: () => {
	// 		if (localStorage.profile === undefined || localStorage.profile === '[]')
	// 			return false
	// 		else return true
	// 	},

	// 	get: () => {
	// 		let result: any[] = []

	// 		try {
	// 			result = JSON.parse(localStorage.profile)
	// 		} catch (error) {
	// 			console.log(localStorage.profile, error)
	// 		}

	// 		return result
	// 	},

	// 	set: (a: any) => (localStorage.profile = JSON.stringify(a)),
	// }

	// const exportCode = (extended: boolean) => {
	// 	//
	// 	//	Stackers uses steps for saving different settings in one character
	// 	//
	// 	//	To stack:
	// 	// 	[a.len: 3, b.len: 4] => to get the a[2] and b[1]
	// 	// 	a * b.len + b ---> 3 * 4 + 2 = 14th character
	// 	//
	// 	// 	To destack:
	// 	// 	b: stack % b.length
	// 	// 	a: (stack - b) / b.length
	// 	//
	// 	const mainExport = () => {
	// 		let layers = ''
	// 		layers.forEach(layer => {
	// 			const stack = layer.frequency * 16 + layer.beats
	// 			if (stack > 36) layers += stack.toString(36)
	// 			else layers += '0' + stack.toString(36)
	// 		})
	// 		return tempo.toString(30) + layers
	// 	}
	// 	const settingsExport = () => {
	// 		const waveStacker = () => {
	// 			const form = waveformsList.findIndex(w => w === moreSettings.sound.type)
	// 			const time = moreSettings.sound.duration
	// 			return (form * waveTimeList.length + time).toString(26)
	// 		}
	// 		// times 2 because [true, false].length = 2
	// 		const displayStacker = () =>
	// 			((+moreSettings.animations | 0) * 2 + (+moreSettings.segment.on | 0)).toString(
	// 				26
	// 			)
	// 		return (
	// 			'-' +
	// 			Math.floor(moreSettings.sound.volume * 35).toString(36) +
	// 			Math.floor(moreSettings.sound.release * 35).toString(36) +
	// 			waveStacker() +
	// 			(+moreSettings.theme | 0) +
	// 			displayStacker()
	// 		)
	// 	}
	// 	return mainExport() + (extended ? settingsExport() : '')
	// }

	// const saveWork = () => {
	// 	const importCode = (code: string) => {
	// 		const split = code.split('-')
	// 		const [mainChars, settingsChars] = split

	// 		const mainDecode = () => {
	// 			//
	// 			// 	For amout of layers found (divide by 2 char by layer)
	// 			// 	get 1, 2 char, and step up... 3, 4, etc
	// 			//
	// 			const layersChars = mainChars.slice(2, mainChars.length)
	// 			const newLayers: any[] = []

	// 			for (let ii = 0; ii < layersChars.length / 2; ii++) {
	// 				// 	Takes 2 chars at a time
	// 				const singleLayer = layersChars.slice(ii * 2, ii * 2 + 2)

	// 				//	Apply destackment
	// 				const beats = parseInt(singleLayer, 36) % 16
	// 				const note = (parseInt(singleLayer, 36) - beats) / 16
	// 				newLayers.push({
	// 					beats: beats === 0 ? 16 : beats,
	// 					frequency: note,
	// 				})
	// 			}

	// 			const tempo = parseInt(mainChars.slice(0, 2), 30)

	// 			return {
	// 				layers,
	// 				tempo,
	// 			}
	// 		}

	// 		const settingsDecode = () => {
	// 			const wavetime = parseInt(settingsChars[2], 26) % waveTimeList.length
	// 			const clickType =
	// 				(parseInt(settingsChars[2], 26) - wavetime) / waveTimeList.length

	// 			const segment = parseInt(settingsChars[4], 26) % 2
	// 			const animations = (parseInt(settingsChars[4], 26) - segment) / 2

	// 			return {
	// 				volume: +(parseInt(settingsChars[0], 36) / 35).toFixed(2),
	// 				release: +(parseInt(settingsChars[1], 36) / 35).toFixed(2),
	// 				wavetime: wavetime,
	// 				waveform: clickTypeList[clickType],
	// 				theme: +settingsChars[3],
	// 				segment: !!segment,
	// 				animations: !!animations,
	// 			}
	// 		}

	// 		if (settingsChars === undefined) {
	// 			return mainDecode()
	// 		} else {
	// 			return {
	// 				...mainDecode(),
	// 				...settingsDecode(),
	// 			}
	// 		}
	// 	}

	// 	return {
	// 		name: setRandomID(),
	// 		layers: [...layers],
	// 		tempo: tempo,
	// 		animations: moreSettings.animations,
	// 		theme: moreSettings.theme,
	// 		segment: moreSettings.segment.on,
	// 	}
	// }

	// const applySaved = (data: any) => {
	// 	setMoreSettings(prev => ({
	// 		...prev,
	// 		animations: data.animations,
	// 		theme: data.theme,
	// 		segment: {
	// 			...prev.segment,
	// 			on: data.segment,
	// 		},
	// 		sound: { ...data.sound },
	// 	}))

	// 	setLayers([...data.layers])
	// 	setTempo(data.tempo)
	// 	applyTheme(data.theme)
	// }

	// const addProfiles = () => {
	// 	const profiles = pfStorage.get()

	// 	if (profiles.length < 5) {
	// 		// Nested objects need to be saved like this
	// 		// (layers, sound, etc.)

	// 		profiles.push(saveWork())

	// 		pfStorage.set(profiles)
	// 		setSelectedProfile(profiles.length - 1)
	// 	}
	// }

	// const selectProfile = (selection: number) => {
	// 	const profile = JSON.parse(localStorage.profile)[selection]

	// 	applySaved(profile)
	// 	setSelectedProfile(selection)
	// 	//setExportInput(exportCode(true))
	// }

	// const deleteProfile = () => {
	// 	const i = selectedProfile
	// 	const p = pfStorage.get()

	// 	p.splice(i, 1)
	// 	pfStorage.set(p)

	// 	let newSelection = 0

	// 	if (i === 0 || p.length === i) newSelection = i
	// 	else newSelection = i - 1

	// 	setSelectedProfile(newSelection)
	// }

	//
	//
	//	JSXs
	//
	//

	// const ProfileList = () => {
	// 	const list = pfStorage.get()
	// 	const [renamingInput, setRenamingInput] = useState(list[selectedProfile].name)

	// 	let result = (
	// 		<div className="profile-bank">
	// 			<div className="profile" onClick={addProfiles}>
	// 				<span>+</span>
	// 			</div>
	// 		</div>
	// 	)

	// 	if (pfStorage.available()) {
	// 		result = (
	// 			<div className="profile-bank">
	// 				{pfStorage.get().map((pf, i) => (
	// 					<div
	// 						key={i}
	// 						className={'profile' + (selectedProfile === i ? ' selected' : '')}
	// 						onClick={() =>
	// 							selectedProfile === i ? setIsTyping(true) : selectProfile(i)
	// 						}
	// 					>
	// 						<div
	// 							className={
	// 								'profile-name' +
	// 								(selectedProfile === i && IsTyping ? ' edit' : '')
	// 							}
	// 						>
	// 							<input
	// 								name="profile-name"
	// 								type="text"
	// 								value={renamingInput}
	// 								onChange={e => {
	// 									if (e.target.value.length < 12) {
	// 										setRenamingInput(e.target.value)
	// 										list[selectedProfile].name = e.target.value
	// 										pfStorage.set(list)
	// 									}
	// 								}}
	// 								onKeyPress={e =>
	// 									e.key === 'Enter' ? setIsTyping(false) : ''
	// 								}
	// 							/>
	// 							<span>{pf.name}</span>
	// 						</div>
	// 					</div>
	// 				))}

	// 				<div className="profile" onClick={addProfiles}>
	// 					<span>+</span>
	// 				</div>
	// 			</div>
	// 		)
	// 	}

	// 	return result
	// }

	//
	//
	//	Effects
	//
	//

	// Automaticaly saves before exiting
	useBeforeunload(event => {
		localStorage.bite = Date.now
		// localStorage.sleep = JSON.stringify(saveWork())
	})

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
			<div className="principal">
				<div className="title">
					<p>Train your polyrythms</p>
					<h1>Polytronome</h1>
				</div>

				<Layers times={times} layers={layers} moreSettings={moreSettings}></Layers>

				<div className="start-button">
					<button onMouseDown={() => launchMetronome(isRunning)}>
						{isRunning ? 'Stop' : 'Start'}
					</button>
				</div>

				<div className="layers-table-wrap">
					<div className="layers-table">
						{layers.map((layer, i) => (
							<div className="ls-row" key={i}>
								<Wheel
									beats={layer.beats}
									update={result => wheelUpdate('beats', result, i)}
								></Wheel>

								<div className="ls-type">
									<Waveform
										type={layer.type}
										change={() => changeClickType(layer.type, i)}
									></Waveform>
								</div>

								{layer.type === 'wood' ? (
									<div
										className="woodblocks"
										onClick={() => {
											const newLayers = [...layers]
											newLayers[i].frequency =
												(layers[i].frequency + 1) % 3
											setLayers([...newLayers])
										}}
									>
										<div className={layer.frequency > -1 ? 'on' : ''}></div>
										<div className={layer.frequency > 0 ? 'on' : ''}></div>
										<div className={layer.frequency > 1 ? 'on' : ''}></div>
									</div>
								) : layer.type === 'drum' ? (
									<div
										className="drumset"
										onClick={() => {
											const newLayers = [...layers]
											newLayers[i].frequency =
												(layers[i].frequency + 1) % 3
											setLayers([...newLayers])
										}}
									>
										{/* <div className="hat"></div>
										<div className="kick"></div>
										<div className="snare"></div> */}
										<div>{layer.frequency}</div>
									</div>
								) : (
									<div className="notes-wrap">
										<Wheel
											freq={layer.beats}
											update={result =>
												wheelUpdate('frequency', result, i)
											}
										></Wheel>
										<Octaves freq={layer.frequency}></Octaves>
									</div>
								)}

								<div>
									<Range
										volume={layer.volume}
										update={result => rangeUpdate(i, result)}
									></Range>
								</div>
							</div>
						))}

						<div className="ls-row ls-labels">
							<div>beats</div>
							<div>type</div>
							<div>note</div>
							<div>volume</div>
						</div>
					</div>

					<div className="ls-buttons">
						<div className="layers-amount">
							<button onClick={() => updateLayer(false)}>-</button>
							<button onClick={() => updateLayer(true)}>+</button>
						</div>

						<button className="randomize" onClick={randomizeLayers}>
							⚂
						</button>
					</div>
				</div>
			</div>

			<div className="settings-wrap">
				<Tempo
					restart={restartMetronome}
					update={changeTempo}
					wheelUpdate={wheelUpdate}
					tempo={tempo}
				></Tempo>

				<div className="other-settings">
					<h3>Display</h3>
					<div className="setting display">
						<h4>Clicks</h4>

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
							{moreSettings.segment.on ? 'segmented' : 'layered'}
						</button>
					</div>

					<div className="setting fullscreen">
						<h4>Fullscreen</h4>

						<button
							name="fullscreen"
							id="fullscreen"
							onClick={() => setFullscreen(moreSettings.fullscreen)}
						>
							{moreSettings.fullscreen ? 'on' : 'off'}
						</button>
					</div>

					<div className="setting animations">
						<div>
							<h4>Animations</h4>
						</div>

						<button name="animations" id="animations" onClick={changeAnimations}>
							{moreSettingsRef.current.animations ? 'on' : 'off'}
						</button>
					</div>

					<div className="setting theme">
						<div>
							<h4>Theme</h4>
						</div>
						<div
							className="theme-preview"
							onClick={() => changeTheme(moreSettings.theme)}
						>
							<div className={moreSettings.theme >= 0 ? 'on' : ''}></div>
							<div className={moreSettings.theme >= 1 ? 'on' : ''}></div>
							<div className={moreSettings.theme >= 2 ? 'on' : ''}></div>
							<div className={moreSettings.theme >= 3 ? 'on' : ''}></div>
							<div className={moreSettings.theme >= 4 ? 'on' : ''}></div>
							<div className={moreSettings.theme >= 5 ? 'on' : ''}></div>
							<div className={moreSettings.theme >= 6 ? 'on' : ''}></div>
						</div>
					</div>

					{/* <div className="setting unlimited">
						<div>
							<h4>Unlimited</h4>
						</div>

						<button
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
					
					<div className="setting debug">
						<h4>Debug button</h4>

						<button onClick={saveWork}>click</button>
					</div> */}
				</div>

				<div className="saved-profiles">
					<h3>Profiles</h3>

					<div className="profile-wrap">
						{/* <ProfileList></ProfileList> */}

						{/* <div className="profile-bank">
							<div className="profile">
								<span>Profile 1</span>
							</div>
							<div className="profile">
								<span>Profile 2</span>
							</div>
							<div className="pfb-btns">
								<div className="profile">
									<span>+</span>
								</div>
								<div className="profile">
									<span>↧</span>
								</div>
							</div>
						</div>

						<div className="profile-focus">
							<h4>Profile 1</h4>
							<div className="export-code">
								<span>43ko7u-001f</span>
							</div>

							<div className="profile-mgmt">
								<button onClick={() => setIsTyping(!IsTyping)}>Rename</button>
								<br />
								<button onClick={deleteProfile}>Delete</button>
							</div>
							<div className="export">
								<input
									type="text"
									className="shown"
									value={exportInput}
									readOnly
								/>
								<span className={'export-choice'}>full</span>
							</div>
						</div> */}
					</div>
				</div>

				<div className="links">
					<h3>Links</h3>
					<div>
						<a href="#docs">documentation</a>
						<br />
						<a href="https://github.com/victorazevedo-me/polytronome">
							source code
						</a>
						<br />
						<span>Arranged by </span>
						<a href="https://victr.me/">victor azevedo</a>
					</div>

					<div></div>
				</div>
			</div>
		</div>
	)
}

export default App
