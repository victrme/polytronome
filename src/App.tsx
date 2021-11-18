import { useRef, useState, useEffect, useCallback } from 'react'
import { useBeforeunload } from 'react-beforeunload'
import { isMobileOnly } from 'react-device-detect'
import LayersTable from './components/LayersTable'
import Header from './components/Header'
import Clicks from './components/Clicks'
import Menu from './components/Menu'
import defaultLayers from './assets/layers.json'
import { MoreSettings, Layer } from './Types'
import { setRandomID, importCode, applyTheme, createExportCode } from './utils'

const App = (): JSX.Element => {
	//
	//
	// States
	//
	//

	//const [exportCode, setExportCode] = useState('')
	const [tempo, setTempo] = useState(80)
	const [startTime, setStartTime] = useState(Date.now)
	const [isRunning, setIsRunning] = useState('')
	const [easy, setEasy] = useState(true)
	const [layers, setLayers] = useState<Layer[]>([...defaultLayers])

	const [segment, setSegment] = useState({
		on: false,
		ratios: [0],
	})

	const [moreSettings, setMoreSettings] = useState<MoreSettings>({
		theme: 2,
		fullscreen: false,
		performance: false,
	})

	const tempoRef = useRef(tempo)
	const startTimeRef = useRef(startTime)
	const isRunningRef = useRef(isRunning)
	const segmentRef = useRef(segment)
	const moreSettingsRef = useRef(moreSettings)
	const IsTypingRef = useRef(false)

	tempoRef.current = tempo
	startTimeRef.current = startTime
	isRunningRef.current = isRunning
	segmentRef.current = segment
	moreSettingsRef.current = moreSettings

	//
	//
	// Handlers
	//
	//

	const startMetronome = useCallback(() => {
		// Update to start state
		setStartTime(Date.now())
		setIsRunning(setRandomID())
	}, [])

	const stopMetronome = () => {
		setIsRunning('')
		setStartTime(0)
	}

	const restartMetronome = useCallback(() => {
		if (isRunning !== '') startMetronome()
	}, [isRunning, startMetronome])

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

	useEffect(() => {
		//
		// Profile save
		sessionStorage.layers = JSON.stringify(layers)

		// Apply saved settings
		if (localStorage.sleep) {
			const savedCode = importCode(JSON.parse(localStorage.sleep))
			setMoreSettings({ ...savedCode.moreSettings })
			setLayers([...savedCode.layers])
			setTempo(savedCode.tempo)
			setEasy(savedCode.easy)
			applyTheme(savedCode.moreSettings.theme)
		} else {
			applyTheme(moreSettings.theme)
		}

		//
		// Window Events

		function cleanupEvents() {
			window.removeEventListener('keydown', handleKeyMapping)
			window.removeEventListener('fullscreenchange', handleFullscreen)
		}

		window.addEventListener('fullscreenchange', handleFullscreen)
		window.addEventListener('keydown', handleKeyMapping)

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
			className={'polytronome' + (isMobileOnly ? ' mobile' : '') + (easy ? ' easy' : '')}
		>
			<Menu
				easy={easy}
				setEasy={setEasy}
				moreSettings={moreSettings}
				setMoreSettings={setMoreSettings}
			></Menu>

			<main>
				<Header
					easy={easy}
					tempo={tempo}
					moreSettings={moreSettings}
					setEasy={setEasy}
					setTempo={setTempo}
					restart={restartMetronome}
					setMoreSettings={setMoreSettings}
				></Header>

				<Clicks
					layers={layers}
					segment={segment}
					tempoRef={tempoRef}
					isRunning={isRunning}
					isRunningRef={isRunningRef}
					setSegment={setSegment}
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
							<button
								className="clickview"
								onClick={() =>
									setSegment(prev => ({
										...prev,
										on: !prev.on,
									}))
								}
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 3.5">
									<path
										d={
											segment.on
												? 'M1 1.75 1.5 1.75M2.5 1.75 4 1.75M5 1.75 6 1.75'
												: 'M1 1 2 1M3 1 4 1M5 1 6 1M1 2.5 3 2.5M4 2.5 6 2.5'
										}
										stroke="var(--accent)"
										strokeWidth="1"
										strokeLinecap="round"
										fill="none"
									/>
								</svg>
								click view
							</button>
						</div>
					)}
				</div>
			</main>
		</div>
	)
}

export default App
