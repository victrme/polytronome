import { useRef, useState, useEffect, useCallback } from 'react'
import { useBeforeunload } from 'react-beforeunload'
import clamp from 'lodash/clamp'

import defaultSettings from '../public/assets/settings.json'
import defaultLayers from '../public/assets/layers.json'
import LayersTable from '../components/LayersTable'
import Keybindings from '../components/Keybindings'
import Buttons from '../components/Buttons'
import Header from '../components/Header'
import Clicks from '../components/Clicks'
import Menu from '../components/Menu'
import Tempo from '../components/Tempo'

import MoreSettings from '../types/moreSettings'
import { Tap } from '../types/options'
import Layer from '../types/layer'
import Code from '../types/code'

import { tempoList, importCode, applyTheme, setRandomID, createExportCode } from '../lib/utils'

const Main = (): JSX.Element => {
	//
	//
	// States & Refs
	//
	//

	const [easy, setEasy] = useState(true)
	const [tempo, setTempo] = useState(21)
	const [tap, setTap] = useState<Tap>([{ date: Date.now(), wait: 0 }])
	const [selected, setSelected] = useState(-1)
	const [isRunning, setIsRunning] = useState('')
	const [tutoStage, setTutoStage] = useState('removed')
	const [startTime, setStartTime] = useState(Date.now)
	const [layers, setLayers] = useState<Layer[]>([...defaultLayers])
	const [moreSettings, setMoreSettings] = useState<MoreSettings>({ ...defaultSettings })
	const [fullscreen, setFullscreen] = useState(false)

	const [appClasses, setAppClasses] = useState('polytronome easy loading')
	const [isForMobile, setIsForMobile] = useState(false)

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

			// If not restart, Normal toggle
			if (restart) {
				if (running) start()
			} else {
				running ? stop() : start()
			}
		},
		[tutoStage, layers]
	)

	const handleLayerChange = (cat: string, result: any, index: number) => {
		let newLayers = [...layers]
		const durationsList = [50, 0.25, 0.33, 0.5, 0.75, 0.97]

		switch (cat) {
			case 'wave':
				newLayers[index].type = (newLayers[index].type + result) % 4
				break

			case 'beats': {
				const beatsTotal = newLayers.map(l => l.beats).reduce((a, b) => a + b) - 5
				if (result === 0 && beatsTotal === 1) return false

				newLayers[index].beats = result + 1

				console.log(beatsTotal, result)

				break
			}

			case 'freq':
				newLayers[index].freq = result
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

	const randomizeLayers = () => {
		toggleMetronome(true)

		// Only randomizes activated layers
		const randBeats = () => +(Math.random() * (16 - 2) + 2).toFixed(0)
		setLayers([...layers].map(l => (l.beats > 1 ? { ...l, beats: randBeats() } : { ...l })))
	}

	const tapTempo = () => {
		const now = Date.now()
		const taps = [...tapRef.current]

		// Reset tap after 2s
		if (now - taps[0].date > 2000) setTap([{ date: now, wait: 0 }])
		else {
			//
			// Adds current
			taps.unshift({ date: now, wait: now - tapRef.current[0].date })

			// if theres still default or too long, removes
			if (taps[1].wait === 0 || taps.length > 6) taps.pop()

			// Array of taps in milliseconds
			const tappedMs: number[] = taps.map(tap => tap.wait)
			const averageMs = tappedMs.reduce((a, b) => a + b) / tappedMs.length

			const averageInBPM = clamp(
				Math.floor(60000 / averageMs),
				tempoList[0],
				tempoList[tempoList.length - 1]
			)

			setTempo(
				tempoList.reduce((a, b) =>
					Math.abs(b - averageInBPM) < Math.abs(a - averageInBPM) ? b : a
				)
			)
			toggleMetronome(true)
			setTap(taps)
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

		if (isForMobile) result += ' mobile'
		if (easy) result += ' easy'
		if (tutoStage !== 'removed') result += ` ${tutoStage}`
		if (!moreSettings.animations) result += ' performance'

		return result
	}

	//
	//
	//	Effects
	//
	//

	// Change mode after following second tutorial
	useEffect(() => {
		if (tutoStage === 'startAdvanced') setEasy(false)
	}, [tutoStage])

	// Select beats for tutorial
	useEffect(() => {
		if (tutoStage === 'testBeats') {
			const beats = layers.map(x => x.beats)
			const reduced = beats.reduce((a, b) => a + b)

			if (beats.includes(5) && beats.includes(7) && reduced === 15)
				setTutoStage('testLaunch')
		}

		// stops metronome if empty
		if (isRunning) toggleMetronome()
	}, [layers])

	// Moves tempo for tutorial
	useEffect(() => {
		if (tutoStage.startsWith('showTempo'))
			setTutoStage(isForMobile ? 'endEasy' : 'clickMenu')
	}, [tempo])

	// CSS classes control
	useEffect(() => {
		setAppClasses(handleClasses())
		return () => setAppClasses('polytronome easy')
	}, [easy, moreSettings, tutoStage, isForMobile])

	// componentDidMount
	useEffect(() => {
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

		// First time tutorial activation
		let tutoWillStart = false
		const activateTutorial = () => {
			if (!localStorage.hadTutorial && !tutoWillStart && easy) {
				tutoWillStart = true
				setTimeout(() => {
					setTutoStage('intro')
					localStorage.hadTutorial = true
				}, 10000)
			}
		}

		// Displays app when loaded ( ugly ? )
		document.querySelector('.polytronome').setAttribute('style', 'opacity: 1')

		// Changes mobile view
		const handleMobileView = () => {
			setIsForMobile(window.visualViewport && window.visualViewport.width < 450)
		}

		handleMobileView()

		// Window Events
		window.addEventListener('click', activateTutorial)
		window.addEventListener('fullscreenchange', handleFullscreen)
		window.addEventListener('resize', handleMobileView)

		return () => {
			window.removeEventListener('click', activateTutorial)
			window.removeEventListener('fullscreenchange', handleFullscreen)
			window.addEventListener('resize', handleMobileView)
		}
	}, [])

	// Save profile
	useBeforeunload(() => {
		localStorage.sleep = JSON.stringify(createExportCode(tempo, layers, moreSettings, easy))
	})

	const TempoElem = (
		<Tempo
			tempo={tempo}
			moreSettings={moreSettings}
			setTempo={setTempo}
			tapTempo={tapTempo}
			toggleMetronome={toggleMetronome}
		/>
	)

	return (
		<div className={appClasses}>
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
				isForMobile={isForMobile}
				moreSettings={moreSettings}
				setTutoStage={setTutoStage}
				setImport={setSettingsFromCode}
				setMoreSettings={setMoreSettings}
				changeFullscreen={changeFullscreen}
			></Menu>

			<main>
				<Header
					Tempo={TempoElem}
					tutoStage={tutoStage}
					isForMobile={isForMobile}
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

				<Buttons
					toggle={isForMobile}
					isRunning={isRunning}
					randomizeLayers={randomizeLayers}
					toggleMetronome={toggleMetronome}
				></Buttons>

				<LayersTable
					easy={easy}
					layers={layers}
					Tempo={TempoElem}
					selected={selected}
					isForMobile={isForMobile}
					animations={moreSettings.animations}
					handleLayerChange={handleLayerChange}
				></LayersTable>

				<Buttons
					toggle={!isForMobile}
					isRunning={isRunning}
					randomizeLayers={randomizeLayers}
					toggleMetronome={toggleMetronome}
				></Buttons>
			</main>

			<div className="spacer"></div>
		</div>
	)
}

export default Main
