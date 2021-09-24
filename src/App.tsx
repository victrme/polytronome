import { useRef, useState, useEffect, useCallback } from 'react'
import { MoreSettings, Layer } from './Types'
import { isMobileOnly } from 'react-device-detect'
import LayersTable from './components/LayersTable'
import Header from './components/Header'
import Clicks from './components/Clicks'

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

	const [segment, setSegment] = useState({
		on: false,
		count: 0,
		ratios: [0],
		duplicates: [0],
		dupCount: 1,
	})

	const [moreSettings, setMoreSettings] = useState<MoreSettings>({
		theme: 1,
		fullscreen: false,
		unlimited: false,
		animations: true,
		all: false,
	})

	const [layers, setLayers] = useState<Layer[]>([
		{
			id: 'xjxexbmx',
			beats: 4,
			freq: 12,
			release: false,
			duration: false,
			type: 'triangle',
			volume: 0.4,
		},
		{
			id: 'qjvwpqgw',
			beats: 5,
			freq: 17,
			release: false,
			duration: false,
			type: 'triangle',
			volume: 0.4,
		},
		{
			id: 'asgwvubm',
			beats: 1,
			freq: 21,
			release: false,
			duration: false,
			type: 'triangle',
			volume: 0.4,
		},
		{
			id: 'inraqysp',
			beats: 1,
			freq: 24,
			release: false,
			duration: false,
			type: 'triangle',
			volume: 0.4,
		},
		{
			id: 'ksunnmej',
			beats: 1,
			freq: 29,
			release: false,
			duration: false,
			type: 'triangle',
			volume: 0.4,
		},
	])

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

	const setRandomID = () => {
		let str = ''
		while (str.length < 8) str += String.fromCharCode(Math.random() * (122 - 97) + 97)
		return str
	}

	const startMetronome = useCallback(() => {
		// Update to start state
		setStartTime(Date.now())
		setIsRunning(setRandomID())
	}, [])

	const stopMetronome = () => {
		setSegment(prev => ({ ...prev, count: 0 }))
		setIsRunning('')
		setStartTime(0)
	}

	const restartMetronome = useCallback(() => {
		if (isRunning !== '') {
			setSegment(prev => ({ ...prev, count: 0 }))
			startMetronome()
		}
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
				isRunningRef.current ? stopMetronome() : startMetronome()

			// Tempo up by 10 if shift
			if (e.code === 'ArrowUp') setTempo(tempoRef.current + (e.shiftKey ? 10 : 1))

			// Tempo down by 10 if shift
			if (e.code === 'ArrowDown') setTempo(tempoRef.current - (e.shiftKey ? 10 : 1))

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

		// eslint-disable-next-line
	}, [])

	//
	//
	// Render
	//
	//

	return (
		<div
			className={'polytronome' + (isMobileOnly ? ' mobile' : '') + (easy ? ' easy' : '')}
		>
			<main>
				<Header
					easy={easy}
					tempo={tempo}
					segment={segment}
					moreSettings={moreSettings}
					setEasy={setEasy}
					setTempo={setTempo}
					setSegment={setSegment}
					restart={restartMetronome}
					setMoreSettings={setMoreSettings}
				></Header>

				<Clicks
					layers={layers}
					segment={segment}
					tempoRef={tempoRef}
					isRunning={isRunning}
					isRunningRef={isRunningRef}
					startTimeRef={startTimeRef}
					setSegment={setSegment}
				></Clicks>

				<LayersTable
					easy={easy}
					layers={layers}
					setLayers={setLayers}
					restartMetronome={restartMetronome}
				></LayersTable>

				<div className={'start-button'}>
					<button onClick={() => (isRunning ? stopMetronome() : startMetronome())}>
						{isRunning ? '◼' : '▶'}
					</button>

					{easy ? (
						''
					) : (
						<button className="randomize" onClick={randomizeLayers}>
							shuffle
						</button>
					)}
				</div>
			</main>
		</div>
	)
}

export default App
