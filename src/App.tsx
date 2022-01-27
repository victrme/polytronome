import { useRef, useState, useEffect, useCallback } from 'react'
import { useBeforeunload } from 'react-beforeunload'
import { isMobileOnly } from 'react-device-detect'
import { clamp } from 'lodash'

import defaultSettings from './assets/settings.json'
import defaultLayers from './assets/layers.json'
import LayersTable from './components/LayersTable'
import Keybindings from './components/Keybindings'
import Header from './components/Header'
import Clicks from './components/Clicks'
import Menu from './components/Menu'
import { MoreSettings, Layer, Code } from './Types'
import { setRandomID, importCode, applyTheme, createExportCode } from './utils'
import Buttons from './components/Buttons'

const App = (): JSX.Element => {
	//
	//
	// States & Refs
	//
	//

	const [easy, setEasy] = useState(true)
	const [tempo, setTempo] = useState(80)
	const [tap, setTap] = useState([{ date: 0, wait: 600 }])
	const [selected, setSelected] = useState(-1)
	const [isRunning, setIsRunning] = useState('')
	const [tutoStage, setTutoStage] = useState('removed')
	const [startTime, setStartTime] = useState(Date.now)
	const [layers, setLayers] = useState<Layer[]>([...defaultLayers])
	const [moreSettings, setMoreSettings] = useState<MoreSettings>({ ...defaultSettings })
	const [fullscreen, setFullscreen] = useState(false)

	const tempoRef = useRef(tempo)
	const tapRef = useRef(tap)
	const startTimeRef = useRef(startTime)
	const isRunningRef = useRef(isRunning)
	const moreSettingsRef = useRef(moreSettings)

	tapRef.current = tap
	tempoRef.current = tempo
	startTimeRef.current = startTime
	isRunningRef.current = isRunning
	moreSettingsRef.current = moreSettings

	//
	//
	// Handlers
	//
	//

	const toggleMetronome = useCallback(
		(restart?: boolean) => {
			const start = () => {
				setStartTime(Date.now())
				setIsRunning(setRandomID())
				if (tutoStage === 'testLaunch') setTutoStage('waitLaunch')
			}

			const stop = () => {
				setIsRunning('')
				setStartTime(0)
				if (tutoStage === 'waitLaunch') setTutoStage('showTempo')
			}

			const running = isRunningRef.current !== ''

			if (restart) {
				if (running) start()
			}

			// Not restart, Normal toggle
			else running ? stop() : start()
		},
		[tutoStage]
	)

	const randomizeLayers = () => {
		toggleMetronome(true)

		// Only randomizes activated layers
		const randBeats = () => +(Math.random() * (16 - 2) + 2).toFixed(0)
		setLayers([...layers].map(l => (l.beats > 1 ? { ...l, beats: randBeats() } : { ...l })))
	}

	const handleLayerChange = (cat: string, result: any, index: number) => {
		let newLayers = [...layers]
		const durationsList = [0.25, 0.33, 0.5, 0.75, 0.95]

		switch (cat) {
			case 'wave':
				newLayers[index].type = (newLayers[index].type + result) % 4
				break

			case 'beats':
				newLayers[index].beats = result + 1
				break

			case 'freq':
				newLayers[index].freq = result + 1
				break

			case 'duration': {
				const curr = durationsList.indexOf(result)
				newLayers[index].duration = durationsList[(curr + 1) % durationsList.length]
				break
			}

			case 'release':
				newLayers[index].release = (newLayers[index].release + 1) % 3
				break

			case 'mute':
				newLayers[index].muted = !newLayers[index].muted
				break

			case 'vol':
				newLayers[index].volume = result
				break
		}

		setLayers([...newLayers])
		if (cat === 'beats') toggleMetronome(true)
	}

	const tapTempo = () => {
		const now = Date.now()

		// Reset tap after 2s
		if (now - tapRef.current[0].date > 2000) {
			setTap([{ date: now, wait: 600 }])
		}

		// Wait is offset between two taps
		else {
			const tempTap = [...tapRef.current]
			tempTap.unshift({ date: now, wait: now - tapRef.current[0].date })

			// Array of taps in milliseconds
			const tappedMs: number[] = tempTap.map(tap => tap.wait).slice(0, 5)
			const averageMs = tappedMs.reduce((a, b) => a + b) / tappedMs.length

			setTap(tempTap)
			setTempo(clamp(Math.floor(60000 / averageMs), 30, 300))
			toggleMetronome(true)
		}
	}

	const setSettingsFromCode = useCallback((code: Code) => {
		setMoreSettings({ ...code.moreSettings })
		setLayers([...code.layers])
		setTempo(code.tempo)
		setEasy(code.easy)
		applyTheme(code.moreSettings.theme)
	}, [])

	const handleFullscreen = () => {
		if (document.fullscreenElement === null)
			setMoreSettings(prev => ({
				...prev,
				fullscreen: false,
			}))
	}

	const changeFullscreen = () => {
		if (!moreSettings.fullscreen && document.fullscreenElement === null) {
			document.body!.requestFullscreen()
			setFullscreen(true)
		} else if (document.fullscreenElement !== null) {
			document.exitFullscreen()
			setFullscreen(false)
		}
	}

	const handleClasses = () => {
		let result = 'polytronome'

		if (isMobileOnly) result += ' mobile'
		if (easy) result += ' easy'
		if (tutoStage !== 'removed') result += ` ${tutoStage}`
		if (moreSettings.animations) result += ' performance'

		return result
	}

	const tempoProps = {
		tempo,
		setTempo,
		tapTempo,
		toggleMetronome,
	}

	//
	//
	//	Effects
	//
	//

	useEffect(() => {
		if (tutoStage === 'startAdvanced') setEasy(false)
	}, [tutoStage])

	// tutorial
	useEffect(() => {
		if (tutoStage === 'testBeats') {
			const beats = layers.map(x => x.beats)
			const reduced = beats.reduce((a, b) => a + b)

			if (beats.includes(5) && beats.includes(7) && reduced === 15)
				setTutoStage('testLaunch')
		}

		// eslint-disable-next-line
	}, [layers])

	useEffect(() => {
		if (tutoStage.startsWith('showTempo'))
			setTutoStage(isMobileOnly ? 'endEasy' : 'clickMenu')
		// eslint-disable-next-line
	}, [tempo])

	// Main
	useEffect(() => {
		//
		// Profile save
		sessionStorage.layers = JSON.stringify(layers)

		// Apply saved settings
		try {
			if (localStorage.sleep)
				setSettingsFromCode(importCode(JSON.parse(localStorage.sleep)))
			else applyTheme(moreSettings.theme)
		} catch (error) {
			localStorage.removeItem('sleep')
			applyTheme(moreSettings.theme)
		}

		//
		// Window Events

		const cleanupEvents = () =>
			window.removeEventListener('fullscreenchange', handleFullscreen)
		window.addEventListener('fullscreenchange', handleFullscreen)
		return cleanupEvents

		// eslint-disable-next-line
	}, [])

	useBeforeunload(() => {
		localStorage.sleep = JSON.stringify(createExportCode(tempo, layers, moreSettings, easy))
	})

	//
	//
	// Render
	//
	//

	const StartButtons = () => (
		<Buttons
			isRunning={isRunning}
			randomizeLayers={randomizeLayers}
			toggleMetronome={toggleMetronome}
		></Buttons>
	)

	return (
		<div className={handleClasses()}>
			<Keybindings
				layers={layers}
				setTempo={setTempo}
				tapTempo={tapTempo}
				selected={selected}
				tempoRef={tempoRef}
				setSelected={setSelected}
				randomizeLayers={randomizeLayers}
				toggleMetronome={toggleMetronome}
				setMoreSettings={setMoreSettings}
				changeFullscreen={changeFullscreen}
				handleLayerChange={handleLayerChange}
				moreSettings={moreSettingsRef.current}
			></Keybindings>

			<Menu
				easy={easy}
				setEasy={setEasy}
				tutoStage={tutoStage}
				fullscreen={fullscreen}
				moreSettings={moreSettings}
				setTutoStage={setTutoStage}
				setImport={setSettingsFromCode}
				setMoreSettings={setMoreSettings}
				changeFullscreen={changeFullscreen}
			></Menu>

			<main>
				<Header
					tutoStage={tutoStage}
					tempoProps={tempoProps}
					setTutoStage={setTutoStage}
				></Header>

				<Clicks
					layers={layers}
					tempoRef={tempoRef}
					isRunning={isRunning}
					isRunningRef={isRunningRef}
					offset={moreSettings.offset}
					clickType={moreSettings.clickType}
				></Clicks>

				{isMobileOnly ? <StartButtons /> : ''}

				<LayersTable
					easy={easy}
					layers={layers}
					selected={selected}
					tempoProps={tempoProps}
					handleLayerChange={handleLayerChange}
				></LayersTable>

				{!isMobileOnly ? <StartButtons /> : ''}
			</main>

			<div className="spacer"></div>
		</div>
	)
}

export default App
