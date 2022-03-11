import { useRef, useState, useEffect, useCallback } from 'react'
import { useBeforeunload } from 'react-beforeunload'
import clamp from 'lodash/clamp'
import mean from 'lodash/mean'

import Themes from '../public/assets/themes.json'
import defaultSettings from '../public/assets/settings.json'
import defaultLayers from '../public/assets/layers.json'
import LayersTable from '../components/LayersTable'
import Keybindings from '../components/Keybindings'
import Buttons from '../components/Buttons'
import Header from '../components/Header'
import Clicks from '../components/Clicks'
import Menu from '../components/Menu'
import Tempo from '../components/Tempo'

import Settings from '../types/settings'
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

	const [tempo, setTempo] = useState(21)
	const [tap, setTap] = useState<Tap>([{ date: Date.now(), wait: 0 }])
	const [selected, setSelected] = useState(-1)
	const [isRunning, setIsRunning] = useState('')
	const [tutoStage, setTutoStage] = useState('removed')
	const [startTime, setStartTime] = useState(Date.now)
	const [layers, setLayers] = useState<Layer[]>([...defaultLayers])
	const [moreSettings, setMoreSettings] = useState<Settings>({ ...defaultSettings })
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

	const toggleMetronome = (restart?: boolean) => {
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
		const beatsCounts = layers.map(l => l.beats).reduce((a, b) => a + b) - 5

		// No beats, only stops
		// Restart, start on top of previous
		// Not restart, simple toggle

		if (beatsCounts === 0) stop()
		else if (restart && running) start()
		else if (!restart) running ? stop() : start()
	}

	const updateLayers = (cat: string, val: any, index: number) => {
		let newLayers = [...layers]
		const durationsList = [50, 0.25, 0.33, 0.5, 0.75, 0.97]

		switch (cat) {
			case 'wave':
				newLayers[index].type = (newLayers[index].type + val) % 4
				break

			case 'beats':
				newLayers[index].beats = val + 1
				break

			case 'freq':
				newLayers[index].freq = val
				break

			case 'duration': {
				const curr = durationsList.indexOf(val)
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
				newLayers[index].volume = val
				break
		}

		setLayers([...newLayers])
		if (cat === 'beats') toggleMetronome(true)
	}

	const randomizeLayers = () => {
		// Only randomizes activated layers
		const randBeats = () => +(Math.random() * (16 - 2) + 2).toFixed(0)
		setLayers([...layers].map(l => (l.beats > 1 ? { ...l, beats: randBeats() } : { ...l })))

		toggleMetronome(true)
	}

	const tapTempo = () => {
		const now = Date.now()
		const taps = [...tapRef.current]

		// Reset tap after 2s
		if (now - taps[0].date > 2000) {
			setTap([{ date: now, wait: 0 }])
		} else {
			// Adds current
			taps.unshift({ date: now, wait: now - tapRef.current[0].date })

			// if theres still default or too long, removes
			if (taps[1].wait === 0 || taps.length > 6) taps.pop()

			// Array of taps in milliseconds, transform to BPM
			const tappedMs: number[] = taps.map(tap => tap.wait)
			const averageBPM = clamp(Math.floor(60000 / mean(tappedMs)), 30, 252)

			// Stops index search to nearest BPM in list
			let closestIndex = 0
			while (tempoList[closestIndex] < averageBPM) closestIndex++

			// Saves
			setTap(taps)
			setTempo(closestIndex)
			toggleMetronome(true)
		}
	}

	const setSettingsFromCode = (code: Code) => {
		setMoreSettings({ ...code.moreSettings })
		setLayers([...code.layers])
		setTempo(code.tempo)
	}

	const exitFullscreenOnResize = () => {
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
		const conditions = [
			[isForMobile, 'mobile'],
			[moreSettings.easy, 'easy'],
			[tutoStage !== 'removed', tutoStage],
			[!moreSettings.animations, 'performance'],
		]

		let res = 'polytronome'
		conditions.forEach(([condition, str]) => {
			if (condition) res += ` ${str}`
		})

		return res
	}

	//
	//
	//	Effects
	//
	//

	// Change mode after following second tutorial
	useEffect(() => {
		if (tutoStage === 'startAdvanced') setMoreSettings(prev => ({ ...prev, easy: false }))
	}, [tutoStage])

	// Select beats for tutorial
	useEffect(() => {
		if (tutoStage === 'testBeats') {
			const beats = layers.map(x => x.beats)
			const reduced = beats.reduce((a, b) => a + b)

			if (beats.includes(5) && beats.includes(7) && reduced === 15)
				setTutoStage('testLaunch')
		}
	}, [layers])

	// Moves tempo for tutorial
	useEffect(() => {
		if (tutoStage.startsWith('showTempo')) {
			setTutoStage(isForMobile ? 'endEasy' : 'clickMenu')
		}
	}, [tempo])

	// Update theme
	useEffect(() => {
		applyTheme(moreSettings.theme, moreSettings.animations)
	}, [moreSettings.theme])

	// CSS classes control
	useEffect(() => {
		setAppClasses(handleClasses())
	}, [moreSettings, tutoStage, isForMobile])

	// On mount
	useEffect(() => {
		try {
			// Apply saved settings
			if (localStorage.sleep) {
				setSettingsFromCode(importCode(JSON.parse(localStorage.sleep)))
				applyTheme(moreSettings.theme, false)
			}
		} catch (error) {
			console.error(error)
		}

		// First time tutorial activation
		let tutoWillStart = false
		const activateTutorial = () => {
			if (!localStorage.hadTutorial && !tutoWillStart && moreSettings.easy) {
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
		window.addEventListener('fullscreenchange', exitFullscreenOnResize)
		window.addEventListener('resize', handleMobileView)

		return () => {
			window.removeEventListener('click', activateTutorial)
			window.removeEventListener('fullscreenchange', exitFullscreenOnResize)
			window.addEventListener('resize', handleMobileView)
		}
	}, [])

	// Save profile
	useBeforeunload(() => {
		localStorage.sleep = JSON.stringify(createExportCode(tempo, layers, moreSettings))
	})

	const TempoElem = (
		<Tempo
			tempo={tempo}
			setTempo={setTempo}
			tapTempo={tapTempo}
			moreSettings={moreSettings}
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
				updateLayers={updateLayers}
				randomizeLayers={randomizeLayers}
				toggleMetronome={toggleMetronome}
				setMoreSettings={setMoreSettings}
				changeFullscreen={changeFullscreen}
				moreSettings={moreSettingsRef.current}
			></Keybindings>

			<Menu
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
					moreSettings={moreSettings}
				></Clicks>

				{isForMobile && (
					<Buttons
						isRunning={isRunning}
						randomizeLayers={randomizeLayers}
						toggleMetronome={toggleMetronome}
					></Buttons>
				)}

				<LayersTable
					layers={layers}
					Tempo={TempoElem}
					selected={selected}
					isForMobile={isForMobile}
					moreSettings={moreSettings}
					updateLayers={updateLayers}
				></LayersTable>

				{!isForMobile && (
					<Buttons
						isRunning={isRunning}
						randomizeLayers={randomizeLayers}
						toggleMetronome={toggleMetronome}
					></Buttons>
				)}
			</main>

			<div className="spacer"></div>
		</div>
	)
}

export default Main
