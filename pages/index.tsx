import { useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react'
import { useBeforeunload } from 'react-beforeunload'
import clamp from 'lodash/clamp'

import LayersTable from '../components/LayersTable'
import Keybindings from '../components/Keybindings'
import Buttons from '../components/Buttons'
import Header from '../components/Header'
import Clicks from '../components/Clicks'
import Menu from '../components/Menu'
import Tempo from '../components/Tempo'
import Tutorial from '../components/Tutorial'

import defaultSettings from '../public/assets/settings.json'
import defaultLayers from '../public/assets/layers.json'
import Settings from '../types/settings'
import Layer from '../types/layer'
import Code from '../types/code'

import useEnableBrowserSound from '../hooks/useEnableBrowserSound'
import useIsMobile from '../hooks/useIsMobile'

import { tempoList } from '../lib/utils'
import importCode from '../lib/codeImport'
import exportCode from '../lib/codeExport'
import updateLayers from '../lib/updateLayers'
import randomizeLayers from '../lib/randomizeLayers'
import toggleMetronome from '../lib/toggleMetronome'
import updateMoreSettings from '../lib/updateMoreSettings'

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
	const [layers, setLayers] = useState<Layer[]>([...defaultLayers])
	const [moreSettings, setMoreSettings] = useState<Settings>({ ...defaultSettings })
	const [appClasses, setAppClasses] = useState('polytronome easy')
	const [isForMobile] = useIsMobile()

	const tempoRef = useRef(tempo)
	const isRunningRef = useRef(isRunning)
	const moreSettingsRef = useRef(moreSettings)

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
		setLayers([...updateLayers({ layers, cat, index, val })])
	}

	const handleMoreSettings = ({ cat, theme }: { cat: keyof Settings; theme?: number }) => {
		setMoreSettings({ ...updateMoreSettings({ moreSettings, cat, theme }) })
	}

	const handleTempo = (tempo: number) => {
		setTempo(clamp(tempo, 0, tempoList.length))
		restartMetronome()
	}

	const setSettingsFromCode = (code: Code) => {
		setMoreSettings({ ...code.moreSettings })
		setLayers([...code.layers])
		setTempo(code.tempo)
	}

	const handleClasses = () => {
		const conditions = [
			[isForMobile, 'mobile'],
			[moreSettings.easy, 'easy'],
			[tutoStage !== 'removed', tutoStage],
			[!moreSettings.animations, 'performance'],
		]

		return 'polytronome' + conditions.map(([c, str]) => (c ? ` ${str}` : '')).join('')
	}

	let loadtimeout = setTimeout(() => {})

	function applySavedSettings() {
		try {
			// Apply saved settings
			if (localStorage.sleep) {
				let code = importCode(JSON.parse(localStorage.sleep))

				// Disable animation on load
				let tempAnim = code.moreSettings.animations
				code.moreSettings.animations = false

				setSettingsFromCode(code)

				// timeout to reenable anims to preference
				clearTimeout(loadtimeout)
				loadtimeout = setTimeout(() => {
					if (tempAnim === true) handleMoreSettings({ cat: 'animations' })
				}, 100)
			}
		} catch (error) {
			console.error(error)
		}
	}

	//
	//
	//	Effects
	//
	//

	useEnableBrowserSound()

	//
	// Tutorial
	//

	useEffect(() => {
		// Change mode after following second tutorial
		if (tutoStage === 'startAdvanced') setMoreSettings(prev => ({ ...prev, easy: false }))
	}, [tutoStage])

	useEffect(() => {
		// Select beats for tutorial
		if (tutoStage === 'testBeats') {
			const beats = layers.map(x => x.beats)
			const reduced = beats.reduce((a, b) => a + b)

			if (beats.includes(5) && beats.includes(7) && reduced === 15)
				setTutoStage('testLaunch')
		}
	}, [layers])

	useEffect(() => {
		// Moves tempo for tutorial
		if (tutoStage.startsWith('showTempo')) {
			setTutoStage(isForMobile ? 'endEasy' : 'clickMenu')
		}
	}, [tempo])

	//
	// Classes
	//

	useEffect(() => setAppClasses(handleClasses()), [moreSettings, tutoStage, isForMobile])

	//
	// Startup
	//

	useEffect(() => {
		applySavedSettings()
		document.querySelector('.polytronome').setAttribute('style', 'opacity: 1') // Displays app when loaded ( ugly ? )
	}, [])

	//
	// Settings persistence
	//

	useBeforeunload(() => {
		localStorage.sleep = JSON.stringify(exportCode(tempo, layers, moreSettings))
	})

	return (
		<div className={appClasses}>
			{/* <Keybindings
				layers={layers}
				setTempo={setTempo}
				selected={selected}
				tempoRef={tempoRef}
				setSelected={setSelected}
				updateLayers={updateLayers}
				setMoreSettings={setMoreSettings}
				toggleFullscreen={toggleFullscreen}
				moreSettings={moreSettingsRef.current}
			></Keybindings> */}

			<Menu
				tutoStage={tutoStage}
				setTutoStage={setTutoStage}
				moreSettings={moreSettings}
				setSettingsFromCode={setSettingsFromCode}
				handleMoreSettings={handleMoreSettings}
			/>

			<main>
				<Header>
					<Tutorial tutoStage={tutoStage} setTutoStage={setTutoStage} />
				</Header>

				<Tempo
					tempo={tempo}
					moreSettings={moreSettings}
					handleTempo={handleTempo}
					restartMetronome={restartMetronome}
				/>

				<Clicks
					layers={layers}
					tempoRef={tempoRef}
					isRunning={isRunning}
					moreSettings={moreSettings}
				/>

				<LayersTable
					layers={layers}
					selected={selected}
					moreSettings={moreSettings}
					handleLayerUpdate={handleLayerUpdate}
				/>

				<Buttons
					isRunning={isRunning}
					handleMetronomeToggle={handleMetronomeToggle}
					handleRandomizedLayers={handleRandomizedLayers}
				/>
			</main>

			<div className="spacer"></div>
		</div>
	)
}

export default Main
