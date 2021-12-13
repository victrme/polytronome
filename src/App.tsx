import { useRef, useState, useEffect, useCallback } from 'react'
import { useBeforeunload } from 'react-beforeunload'
import { isMobileOnly } from 'react-device-detect'
import defaultLayers from './assets/layers.json'
import { ResizeObserver } from '@juggle/resize-observer'
import { animated, useSpring, config } from '@react-spring/web'
import useMeasure from 'react-use-measure'

import LayersTable from './components/LayersTable'
import Header from './components/Header'
import Clicks from './components/Clicks'
import Menu from './components/Menu'
import Tutorial from './components/Tutorial'
import Keymapping from './components/Keymapping'
import { MoreSettings, Layer, Code } from './Types'
import { setRandomID, importCode, applyTheme, createExportCode } from './utils'

const App = (): JSX.Element => {
	//
	//
	// States
	//
	//

	const [tempo, setTempo] = useState(80)
	const [startTime, setStartTime] = useState(Date.now)
	const [isRunning, setIsRunning] = useState('')
	const [easy, setEasy] = useState(true)
	const [layers, setLayers] = useState<Layer[]>([...defaultLayers])
	const [tutoStage, setTutoStage] = useState('intro')

	const [moreSettings, setMoreSettings] = useState<MoreSettings>({
		theme: 2,
		fullscreen: false,
		performance: false,
		offset: 0,
		clickType: 0,
	})

	const tempoRef = useRef(tempo)
	const startTimeRef = useRef(startTime)
	const isRunningRef = useRef(isRunning)
	const moreSettingsRef = useRef(moreSettings)

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

			if (tutoStage === 'waitLaunch')
				setTutoStage(`testTempo${tempo > 120 ? 'Down' : 'Up'}`)
		}

		const running = isRunningRef.current !== ''

		if (restart) {
			if (running) start()
		}

		// Not restart, Normal toggle
		else running ? stop() : start()
	}

	const randomizeLayers = () => {
		const rand = (a: number, b: number) => Math.random() * (b - a) + a

		const newLayers = [...layers]
		newLayers.forEach((l, i) => {
			if (l.beats > 1) newLayers[i].beats = +rand(2, 16).toFixed(0)
		})
		setLayers([...newLayers])
		toggleMetronome(true)
	}

	const springProps = { x: 0, y: 0, config: config.stiff }
	const [mainStyles, mainSpring] = useSpring(() => springProps)
	const [mainRef, mainBounds] = useMeasure({ polyfill: ResizeObserver })

	//
	//
	//	Effects
	//
	//

	function handleFullscreen() {
		if (document.fullscreenElement === null)
			setMoreSettings(prev => ({
				...prev,
				fullscreen: false,
			}))
	}

	const setSettingsFromCode = useCallback((code: Code) => {
		setMoreSettings({ ...code.moreSettings })
		setLayers([...code.layers])
		setTempo(code.tempo)
		setEasy(code.easy)
		applyTheme(code.moreSettings.theme)
	}, [])

	//
	// tutorial effects

	useEffect(() => {
		if (tutoStage === 'testBeats') {
			const beats = layers.map(x => x.beats)
			const reduced = beats.reduce((a, b) => a + b)

			if (beats.indexOf(5) !== -1 && beats.indexOf(7) !== -1 && reduced === 15)
				setTutoStage('testLaunch')
		}

		// eslint-disable-next-line
	}, [layers])

	useEffect(() => {
		if (tutoStage.startsWith('testTempo') && tempo === 120) setTutoStage('endEasy')
		// eslint-disable-next-line
	}, [tempo])

	//
	// Main Effect

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

		function cleanupEvents() {
			window.removeEventListener('fullscreenchange', handleFullscreen)
			// window.addEventListener('resize', handleMenuClose)
		}

		window.addEventListener('fullscreenchange', handleFullscreen)
		// window.addEventListener('resize', handleMenuClose)

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

	return (
		<div
			className={
				'polytronome' +
				(isMobileOnly ? ' mobile' : '') +
				(easy ? ' easy ' : ' ') +
				(tutoStage !== 'intro' ? tutoStage : '')
			}
		>
			<Tutorial tutoStage={tutoStage} setTutoStage={setTutoStage}></Tutorial>

			<Keymapping
				setTempo={setTempo}
				tempoRef={tempoRef}
				toggleMetronome={toggleMetronome}
				setMoreSettings={setMoreSettings}
				moreSettings={moreSettingsRef.current}
			></Keymapping>

			<Menu
				easy={easy}
				setEasy={setEasy}
				moreSettings={moreSettings}
				setMoreSettings={setMoreSettings}
				setImport={setSettingsFromCode}
				mainSpring={mainSpring}
				mainBounds={mainBounds}
			></Menu>

			<animated.main ref={mainRef} style={{ x: mainStyles.x }}>
				<Header
					tempo={tempo}
					setTempo={setTempo}
					toggleMetronome={toggleMetronome}
				></Header>

				<Clicks
					layers={layers}
					tempoRef={tempoRef}
					isRunning={isRunning}
					isRunningRef={isRunningRef}
					clickType={moreSettings.clickType}
					offset={moreSettings.offset}
				></Clicks>

				<LayersTable
					easy={easy}
					layers={layers}
					setLayers={setLayers}
					toggleMetronome={toggleMetronome}
				></LayersTable>

				<div className="bottom-buttons">
					<button className="start" onClick={() => toggleMetronome()}>
						{isRunning ? '◼ stop' : '▶ start'}
					</button>

					<div>
						<button className="randomize" onClick={randomizeLayers}>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="3 -1 10 8">
								<path
									d="M4 1C7 1 7 5 10 5M4 5C7 5 7 1 10 1M10 1 10 .5 12 1 10 1.5zM10 5 10 4.5 12 5 10 5.5z"
									stroke="var(--accent)"
									strokeWidth="1"
									strokeLinecap="round"
									fill="none"
								/>
							</svg>
							shuffle
						</button>
					</div>
				</div>
			</animated.main>
			<div></div>
		</div>
	)
}

export default App
