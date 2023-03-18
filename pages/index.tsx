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
import exportCode from '../lib/codeExport'
import updateLayers from '../lib/updateLayers'
import randomizeLayers from '../lib/randomizeLayers'
import toggleMetronome from '../lib/toggleMetronome'
import updateMoreSettings from '../lib/updateMoreSettings'
import useLoadStorageSettings from '../hooks/useLoadStorageSettings'
import useTutorial from '../hooks/useTutorial'

const Main = (): JSX.Element => {
	//
	//
	// States & Refs
	//
	//

	const [tempo, setTempo] = useState(21)
	const [selected, setSelected] = useState(-1)
	const [isRunning, setIsRunning] = useState('')
	const [layers, setLayers] = useState<Layer[]>([...defaultLayers])
	const [moreSettings, setMoreSettings] = useState<Settings>({ ...defaultSettings })
	const [appClasses, setAppClasses] = useState('polytronome easy')
	const [isForMobile] = useIsMobile()

	const [tutoStage, setTutoStage] = useTutorial({
		layers,
		tempo,
		isRunning,
		isForMobile,
	})

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
	}

	const handleLayerUpdate = (cat: string, index: number, val: number) => {
		setLayers([...updateLayers({ layers, cat, index, val })])
		if (cat === 'beats') restartMetronome()
	}

	const handleMoreSettings = ({ cat, theme }: { cat: keyof Settings; theme?: number }) => {
		setMoreSettings({ ...updateMoreSettings({ moreSettings, cat, theme }) })
		if (cat === 'clickType') restartMetronome()
	}

	const handleTempo = (tempo: number) => {
		setTempo(clamp(tempo, 0, tempoList.length))
		restartMetronome()
	}

	const handleStorageImport = (code: Code) => {
		setMoreSettings({ ...code.moreSettings })
		setLayers([...code.layers])
		setTempo(code.tempo)
	}

	const updateAppClassName = () => {
		const conditions = [
			[isForMobile, 'mobile'],
			[moreSettings.easy, 'easy'],
			[tutoStage !== 'removed', tutoStage],
			[!moreSettings.animations, 'performance'],
		]

		return 'polytronome' + conditions.map(([c, str]) => (c ? ` ${str}` : '')).join('')
	}

	//
	//
	//	Effects
	//
	//

	useEnableBrowserSound()
	useLoadStorageSettings({ handleStorageImport })

	useEffect(() => {
		setAppClasses(updateAppClassName())
	}, [moreSettings, tutoStage, isForMobile])

	useEffect(() => {
		document.querySelector('.polytronome').setAttribute('style', 'opacity: 1')
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
				moreSettings={moreSettings}
				setTutoStage={setTutoStage}
				handleMoreSettings={handleMoreSettings}
				handleStorageImport={handleStorageImport}
			/>

			<main>
				<Header>
					<Tutorial tutoStage={tutoStage} setTutoStage={setTutoStage} />
				</Header>

				<Tempo tempo={tempo} moreSettings={moreSettings} handleTempo={handleTempo} />

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
