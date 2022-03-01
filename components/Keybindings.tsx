import { useTransition, animated, config } from '@react-spring/web'
import { useEffect, useState } from 'react'
import clamp from 'lodash/clamp'

let tempoWait = setTimeout(() => {}, 0)

const Keymapping = ({
	layers,
	tempoRef,
	setTempo,
	tapTempo,
	selected,
	setSelected,
	moreSettings,
	toggleMetronome,
	randomizeLayers,
	setMoreSettings,
	changeFullscreen,
	handleLayerChange,
}) => {
	const [octave, setOctave] = useState(0)
	const [keylog, setKeylog] = useState({ key: '', desc: '' })

	const toggleClickView = () =>
		setMoreSettings(prev => ({
			...prev,
			clickType: (moreSettings.clickType + 1) % 3,
		}))

	useEffect(() => {
		function handleKeyMapping(e: KeyboardEvent) {
			// Lose focus before firing, (like a preventDefault)
			// Not preventDefault, because it would prevent
			// Browser accessibility keybindings
			if (document.activeElement) {
				const el = document.activeElement as HTMLButtonElement
				el.blur()
			}

			const incrSelect = () => (selected + 1) % 5
			const decrSelect = () => (selected === 0 ? 4 : selected - 1)

			// Mettre les nouveaux contrôles dans le readme
			// Mettre shift + Arrow pour les beats
			// Todo: accessibilité avec tab

			const bindings = [
				{
					key: 'Backspace',
					cat: 'select',
					desc: 'deselect rythm',
					val: -1,
					selected: false,
				},
				{
					key: 'Digit1',
					cat: 'select',
					desc: 'select 1st rythm',
					val: 0,
					selected: false,
				},
				{
					key: 'Digit2',
					cat: 'select',
					desc: 'select 2nd rythm',
					val: 1,
					selected: false,
				},
				{
					key: 'Digit3',
					cat: 'select',
					desc: 'select 3rd rythm',
					val: 2,
					selected: false,
				},
				{
					key: 'Digit4',
					cat: 'select',
					desc: 'select 4th rythm',
					val: 3,
					selected: false,
				},
				{
					key: 'Digit5',
					cat: 'select',
					desc: 'select 5th rythm',
					val: 4,
					selected: false,
				},
				{
					key: 'ArrowRight',
					cat: 'select',
					desc: 'select next rythm',
					val: incrSelect(),
					selected: false,
				},
				{
					key: 'ArrowDown',
					cat: 'select',
					desc: 'select next rythm',
					val: incrSelect(),
					selected: false,
				},
				{
					key: 'ArrowLeft',
					cat: 'select',
					desc: 'select previous rythm',
					val: decrSelect(),
					selected: false,
				},
				{
					key: 'ArrowUp',
					cat: 'select',
					desc: 'select previous rythm',
					val: decrSelect(),
					selected: false,
				},
				{ key: 'ArrowUp', cat: 'beats', desc: 'beats up', val: 1, selected: true },
				{ key: 'ArrowDown', cat: 'beats', desc: 'beats down', val: -1, selected: true },
				{ key: 'KeyA', cat: 'freq', desc: 'note C', val: 0, selected: true },
				{ key: 'KeyW', cat: 'freq', desc: 'note C#', val: 1, selected: true },
				{ key: 'KeyS', cat: 'freq', desc: 'note D', val: 2, selected: true },
				{ key: 'KeyE', cat: 'freq', desc: 'note D#', val: 3, selected: true },
				{ key: 'KeyD', cat: 'freq', desc: 'note E', val: 4, selected: true },
				{ key: 'KeyF', cat: 'freq', desc: 'note F', val: 5, selected: true },
				{ key: 'KeyT', cat: 'freq', desc: 'note F#', val: 6, selected: true },
				{ key: 'KeyG', cat: 'freq', desc: 'note G', val: 7, selected: true },
				{ key: 'KeyY', cat: 'freq', desc: 'note G#', val: 8, selected: true },
				{ key: 'KeyH', cat: 'freq', desc: 'note A', val: 9, selected: true },
				{ key: 'KeyU', cat: 'freq', desc: 'note A#', val: 10, selected: true },
				{ key: 'KeyJ', cat: 'freq', desc: 'note B', val: 11, selected: true },
				{ key: 'KeyK', cat: 'freq', desc: 'note C', val: 12, selected: true },
				{ key: 'KeyO', cat: 'freq', desc: 'note C#', val: 13, selected: true },
				{ key: 'KeyL', cat: 'freq', desc: 'note D', val: 14, selected: true },
				{ key: 'KeyP', cat: 'freq', desc: 'note D#', val: 15, selected: true },
				{ key: 'Semicolon', cat: 'freq', desc: 'note E', val: 16, selected: true },
				{ key: 'Quote', cat: 'freq', desc: 'note F', val: 17, selected: true },
				{ key: 'KeyZ', cat: 'octave', desc: 'octave down', val: -1, selected: false },
				{ key: 'KeyX', cat: 'octave', desc: 'octave up', val: 1, selected: false },
				{ key: 'KeyC', cat: 'wave', desc: 'change wavetype', val: 1, selected: true },
				{
					key: 'KeyV',
					cat: 'duration',
					desc: 'change note duration',
					val: 1,
					selected: true,
				},
				{
					key: 'KeyB',
					cat: 'release',
					desc: 'change note release',
					val: 1,
					selected: true,
				},
				{ key: 'KeyM', cat: 'mute', desc: 'volume muted', val: 1, selected: true },
				{
					key: 'Comma',
					cat: 'vol',
					desc: 'volume down 10%',
					val: -0.1,
					selected: true,
				},
				{ key: 'Period', cat: 'vol', desc: 'volume up 10%', val: 0.1, selected: true },
				{
					key: 'AltRight',
					cat: 'shuffle',
					desc: 'shuffle beats',
					val: 1,
					selected: false,
				},
				{ key: 'NumpadAdd', cat: 'tempo', desc: 'tempo up', val: 1, selected: false },
				{
					key: 'NumpadSubtract',
					cat: 'tempo',
					desc: 'tempo down',
					val: -1,
					selected: false,
				},
				{ key: 'Minus', cat: 'tempo', desc: 'tempo down', val: -1, selected: false },
				{ key: 'Equal', cat: 'tempo', desc: 'tempo up', val: 1, selected: false },
				{ key: 'Digit0', cat: 'tempoTap', desc: 'tempo tap', val: 1, selected: false },

				{
					key: 'Digit9',
					cat: 'view',
					desc: 'change rythm view',
					val: 1,
					selected: false,
				},
				{
					key: 'Digit8',
					cat: 'fullscreen',
					desc: 'change fullscreen',
					val: 1,
					selected: false,
				},
				{
					key: 'Space',
					cat: 'metronome',
					desc: 'start / stop metronome',
					val: 1,
					selected: false,
				},
				{
					key: 'Enter',
					cat: 'metronome',
					desc: 'start / stop metronome',
					val: 1,
					selected: false,
				},
			]

			// Finds corresponding key
			const hitArray = bindings.filter(elem => elem.key === e.code)
			let hitKey = hitArray[0]

			// Arrow special control (because of shift (ugly))
			if (hitArray[1] && e.shiftKey) hitKey = hitArray[1]

			if (hitKey !== undefined && !e.ctrlKey) {
				// Keybinds when focused on layers
				if (hitKey.selected && selected > -1) {
					let layer = layers[selected]
					const { cat, val } = hitKey

					const filteredVals = {
						beats: clamp(layer.beats - 1 + val, 0, 15),
						freq: clamp(12 * octave + val, 0, 53),
						vol: clamp(layer.volume + val, 0, 1),
						wave: val,
						duration: layer.duration,
						release: layer.release,
						mute: !layer.muted,
					}

					if (cat === 'select') e.preventDefault()
					handleLayerChange(cat, filteredVals[cat], selected)
					setKeylog({ key: e.code, desc: hitKey.desc })
					setDisplayKeylog(true)
				}

				// Keys that doesn't overlap with layers keys
				else if (!hitKey.selected) {
					const updateTempo = () => {
						const updatedTempo =
							tempoRef.current + hitKey.val * (e.shiftKey ? 10 : 1)
						setTempo(clamp(updatedTempo, 30, 300))

						clearTimeout(tempoWait)
						tempoWait = setTimeout(() => {
							toggleMetronome(true)
						}, 400)
					}

					const actions = {
						tempoTap: () => tapTempo(),
						tempo: () => updateTempo(),
						view: () => toggleClickView(),
						shuffle: () => randomizeLayers(),
						fullscreen: () => changeFullscreen(),
						select: () => setSelected(hitKey.val),
						octave: () => setOctave(clamp(octave + hitKey.val, 0, 3)),
						metronome: () => {
							toggleMetronome()
							e.preventDefault()
						},
					}

					actions[hitKey.cat]()
					setKeylog({ key: e.code, desc: hitKey.desc })
					setDisplayKeylog(true)
				}
			}
		}

		// Retire event when effect dies
		const removeEvent = () => window.removeEventListener('keydown', handleKeyMapping)
		window.addEventListener('keydown', handleKeyMapping)
		return removeEvent

		// eslint-disable-next-line
	}, [selected, layers, moreSettings, octave])

	useEffect(() => {
		const removeKeylog = () => setDisplayKeylog(false)
		window.addEventListener('click', removeKeylog)
		return () => window.removeEventListener('click', removeKeylog)
	}, [])

	const [displayKeylog, setDisplayKeylog] = useState(false)
	const transitions = useTransition(displayKeylog, {
		from: { display: 'none', opacity: 0, scale: 0.94 },
		enter: { display: 'flex', opacity: 1, scale: 1 },
		leave: { opacity: 0, scale: 0.94 },
		config: config.stiff,
	})

	return transitions(
		(styles, item) =>
			item && (
				<animated.div className="keylog" style={styles}>
					<code>{keylog.key}</code>
					<small>{keylog.desc}</small>
				</animated.div>
			)
	)
}

export default Keymapping
