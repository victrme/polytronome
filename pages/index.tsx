import { useRef, useState, useEffect, useCallback } from 'react'
import { useBeforeunload } from 'react-beforeunload'

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
import Layer from '../types/layer'
import Code from '../types/code'

import { importCode, applyTheme, createExportCode } from '../lib/utils'
import toggleMetronome from '../lib/toggleMetronome'
import useIsMobile from '../hooks/useIsMobile'
import randomizeLayers from '../lib/randomizeLayers'
import updateLayers from '../lib/updateLayers'

const Main = (): JSX.Element => {
	//
	//
	// States & Refs
	//
	//

	const [tempo, setTempo] = useState(21)
	const [selected, setSelected] = useState(-1)
	const [isRunning, setIsRunning] = useState('')
	const [tutoStage, setTutoStage] = useState('removed')
	const [isForMobile] = useIsMobile()

	const [layers, setLayers] = useState<Layer[]>([...defaultLayers])
	const [moreSettings, setMoreSettings] = useState<Settings>({ ...defaultSettings })
	const [fullscreen, setFullscreen] = useState(false)

	const [appClasses, setAppClasses] = useState('polytronome easy')

	const tempoRef = useRef(tempo)
	const isRunningRef = useRef(isRunning)
	const moreSettingsRef = useRef(moreSettings)

	let loadtimeout
	tempoRef.current = tempo
	isRunningRef.current = isRunning
	moreSettingsRef.current = moreSettings

	//
	//
	// Handlers
	//
	//

	const restartMetronome = () => {
		setIsRunning(toggleMetronome({ restart: true, isRunning, layers }))
	}

	const handleMetronomeToggle = () => {
		setIsRunning(toggleMetronome({ isRunning, layers }))
	}

	const handleRandomizedLayers = () => {
		setLayers(randomizeLayers({ layers }))
		restartMetronome()
	}

	const handleLayerUpdate = (cat: string, index: number, val: number) => {
		setLayers(updateLayers({ layers, cat, index, val }))
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
				let code = importCode(JSON.parse(localStorage.sleep))
				let temp = code.moreSettings.animations

				// Disable animation on load
				code.moreSettings.animations = false
				setSettingsFromCode(code)

				// timeout to reenable anims to preference
				clearTimeout(loadtimeout)
				loadtimeout = setTimeout(() => {
					code.moreSettings.animations = temp
					setSettingsFromCode(code)
				}, 100)

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

		// First time theme selection
		if (!localStorage.sleep && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			setMoreSettings(prev => ({ ...prev, theme: 0 }))
		}

		// Displays app when loaded ( ugly ? )
		document.querySelector('.polytronome').setAttribute('style', 'opacity: 1')

		// Window Events
		window.addEventListener('click', activateTutorial)
		window.addEventListener('fullscreenchange', exitFullscreenOnResize)

		return () => {
			window.removeEventListener('click', activateTutorial)
			window.removeEventListener('fullscreenchange', exitFullscreenOnResize)
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
			moreSettings={moreSettings}
			restartMetronome={restartMetronome}
		/>
	)

	const ButtonElem = (
		<Buttons
			isRunning={isRunning}
			handleMetronomeToggle={handleMetronomeToggle}
			handleRandomizedLayers={handleRandomizedLayers}
		></Buttons>
	)

	return (
		<div className={appClasses}>
			<Keybindings
				layers={layers}
				setTempo={setTempo}
				selected={selected}
				tempoRef={tempoRef}
				setSelected={setSelected}
				updateLayers={updateLayers}
				setMoreSettings={setMoreSettings}
				changeFullscreen={changeFullscreen}
				moreSettings={moreSettingsRef.current}
			></Keybindings>

			<Menu
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
					Tempo={TempoElem}
					tutoStage={tutoStage}
					setTutoStage={setTutoStage}
				></Header>

				<Clicks
					layers={layers}
					tempoRef={tempoRef}
					isRunning={isRunning}
					moreSettings={moreSettings}
				></Clicks>

				{isForMobile && ButtonElem}

				<LayersTable
					layers={layers}
					Tempo={TempoElem}
					selected={selected}
					moreSettings={moreSettings}
					handleLayerUpdate={handleLayerUpdate}
				></LayersTable>

				{!isForMobile && ButtonElem}
			</main>

			<div className="spacer"></div>
		</div>
	)
}

export default Main
