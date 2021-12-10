import { useRef, useState, useEffect, useCallback } from 'react'
import { useBeforeunload } from 'react-beforeunload'
import { isMobileOnly } from 'react-device-detect'
import LayersTable from './components/LayersTable'
import Header from './components/Header'
import Clicks from './components/Clicks'
import Menu from './components/Menu'
import defaultLayers from './assets/layers.json'
import { MoreSettings, Layer, Code } from './Types'
import { setRandomID, importCode, applyTheme, createExportCode } from './utils'
import { useDrag } from '@use-gesture/react'
import { animated, useSpring, config } from '@react-spring/web'
import useMeasure from 'react-use-measure'
import { ResizeObserver } from '@juggle/resize-observer'
import Tutorial from './components/Tutorial'

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
	const IsTypingRef = useRef(false)

	tempoRef.current = tempo
	startTimeRef.current = startTime
	isRunningRef.current = isRunning
	moreSettingsRef.current = moreSettings

	//
	//
	// Handlers
	//
	//

	const startMetronome = () => {
		// Update to start state
		setStartTime(Date.now())
		setIsRunning(setRandomID())

		if (tutoStage === 'testLaunch') setTutoStage('waitLaunch')
	}

	const stopMetronome = () => {
		setIsRunning('')
		setStartTime(0)

		if (tutoStage === 'waitLaunch') setTutoStage('testTempo')
	}

	const restartMetronome = () => {
		if (isRunning !== '') startMetronome()
	}

	const randomizeLayers = () => {
		const rand = (a: number, b: number) => Math.random() * (b - a) + a

		const newLayers = [...layers]
		newLayers.forEach((l, i) => {
			if (l.beats > 1) newLayers[i].beats = +rand(2, 16).toFixed(0)
		})
		setLayers([...newLayers])
		restartMetronome()
	}

	//
	//
	//	Effects
	//
	//

	function handleKeyMapping(e: KeyboardEvent) {
		//
		// Lose focus before firing
		if (document.activeElement) {
			const el = document.activeElement as HTMLButtonElement
			el.blur()
		}

		// Spacebar control metronome
		if (e.code === 'Space' && !IsTypingRef.current)
			isRunningRef.current ? stopMetronome() : startMetronome()

		// Tempo up by 10 if shift
		// Tempo down by 10 if shift
		if (e.code === 'ArrowUp') setTempo(tempoRef.current + (e.shiftKey ? 10 : 1))
		if (e.code === 'ArrowDown') setTempo(tempoRef.current - (e.shiftKey ? 10 : 1))

		e.stopPropagation()
	}

	function handleFullscreen() {
		if (document.fullscreenElement === null)
			setMoreSettings(prev => ({
				...prev,
				fullscreen: false,
			}))
	}

	function handleMenuClose() {
		menuSpring.start({ x: 0 })
		mainSpring.start({ x: 0 })
	}

	// eslint-disable-next-line
	const springProps = { x: 0, y: 0, config: config.stiff }
	const [menuStyles, menuSpring] = useSpring(() => springProps)
	const [mainStyles, mainSpring] = useSpring(() => springProps)
	const [mainRef, mainBounds] = useMeasure({ polyfill: ResizeObserver })

	const menuSize = 360
	const padding = 60

	// Ugly session storage to always save main left position
	// EXCEPT when App redraws main while menu is open
	// (because main left would be set to 420px or menuSize + padding)
	useEffect(() => {
		if (mainBounds.left !== menuSize + padding) sessionStorage.leftBound = mainBounds.left
	}, [mainBounds])

	const drag = useDrag(
		({ active, offset: [ox], tap }) => {
			// Moves main and menu together
			const moveElements = (moves: number[]) => {
				menuSpring.start({ x: moves[0] })
				mainSpring.start({ x: moves[1] })
			}

			// sets offsets between main and menu
			const left = sessionStorage.leftBound || 0
			const dragMainOffest = Math.max(0, ox + padding - left)
			const clickMainOffset = Math.max(0, menuSize + padding - left)

			// moves on drag
			moveElements([ox, dragMainOffest < 0 ? 0 : dragMainOffest])

			// release drag, finds rest position
			if (!active) moveElements(ox > menuSize / 2 ? [menuSize, clickMainOffset] : [0, 0])

			// clicking dragbar, === 0 is click to open
			// if (tap)
			// moveElements(menuStyles.x.get() === 0 ? [menuSize, clickMainOffset] : [0, 0])
		},
		{
			axis: 'x',
			rubberband: 0.1,
			filterTaps: true,
			bounds: { left: 0, right: menuSize },
		}
	)

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
		if (tutoStage === 'testTempo' && tempo === 60) setTutoStage('endEasy')
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
			window.removeEventListener('keydown', handleKeyMapping)
			window.removeEventListener('fullscreenchange', handleFullscreen)
			window.addEventListener('resize', handleMenuClose)
		}

		window.addEventListener('fullscreenchange', handleFullscreen)
		window.addEventListener('keydown', handleKeyMapping)
		window.addEventListener('resize', handleMenuClose)

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

			<div>
				<Menu
					easy={easy}
					setEasy={setEasy}
					dragX={menuStyles.x}
					moreSettings={moreSettings}
					setMoreSettings={setMoreSettings}
					setImport={setSettingsFromCode}
				></Menu>

				<animated.div {...drag()} className="settings-drag" style={{ x: menuStyles.x }}>
					<span></span>
				</animated.div>
			</div>

			<animated.main ref={mainRef} style={{ x: mainStyles.x }}>
				<Header tempo={tempo} setTempo={setTempo} restart={restartMetronome}></Header>

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
					moreSettings={moreSettings}
					restartMetronome={restartMetronome}
				></LayersTable>

				<div className="bottom-buttons">
					<button
						className="start"
						onClick={() => (isRunning ? stopMetronome() : startMetronome())}
					>
						{isRunning ? '◼' : '▶'}
					</button>

					{easy ? (
						''
					) : (
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
					)}
				</div>
			</animated.main>
			<div></div>
		</div>
	)
}

export default App
