import { useEffect, useState, useRef } from 'react'
import { clamp } from 'lodash'

const Keymapping = ({
	layers,
	toggleMetronome,
	tempoRef,
	setTempo,
	selected,
	setSelected,
	setMoreSettings,
	moreSettings,
	handleLayerChange,
}) => {
	const [octave, setOctave] = useState(0)
	const [logs, setLogs] = useState([{ key: 'keyM', action: 'Mute layer' }])
	const logsRef = useRef(logs)
	logsRef.current = logs

	useEffect(() => {
		function handleKeyMapping(e: KeyboardEvent) {
			// Lose focus before firing, (like a preventDefault)
			// Not preventDefault, because it would prevent
			// Browser accessibility keybindings
			if (document.activeElement) {
				const el = document.activeElement as HTMLButtonElement
				el.blur()
			}

			console.log(e.code)

			const bindings = [
				{ key: 'Escape', cat: 'select', val: -1 },
				{ key: 'Digit1', cat: 'select', val: 0 },
				{ key: 'Digit2', cat: 'select', val: 1 },
				{ key: 'Digit3', cat: 'select', val: 2 },
				{ key: 'Digit4', cat: 'select', val: 3 },
				{ key: 'Digit5', cat: 'select', val: 4 },
				{ key: 'ArrowRight', cat: 'select', val: (selected + 1) % 5 },
				{ key: 'ArrowLeft', cat: 'select', val: selected === 0 ? 4 : selected - 1 },
				{ key: 'KeyA', cat: 'freq', val: 0 },
				{ key: 'KeyW', cat: 'freq', val: 1 },
				{ key: 'KeyS', cat: 'freq', val: 2 },
				{ key: 'KeyE', cat: 'freq', val: 3 },
				{ key: 'KeyD', cat: 'freq', val: 4 },
				{ key: 'KeyF', cat: 'freq', val: 5 },
				{ key: 'KeyT', cat: 'freq', val: 6 },
				{ key: 'KeyG', cat: 'freq', val: 7 },
				{ key: 'KeyY', cat: 'freq', val: 8 },
				{ key: 'KeyH', cat: 'freq', val: 9 },
				{ key: 'KeyU', cat: 'freq', val: 10 },
				{ key: 'KeyJ', cat: 'freq', val: 11 },
				{ key: 'KeyK', cat: 'freq', val: 12 },
				{ key: 'KeyO', cat: 'freq', val: 13 },
				{ key: 'KeyL', cat: 'freq', val: 14 },
				{ key: 'KeyP', cat: 'freq', val: 15 },
				{ key: 'Semicolon', cat: 'freq', val: 16 },
				{ key: 'Quote', cat: 'freq', val: 17 },
				{ key: 'KeyZ', cat: 'octave', val: -1 },
				{ key: 'KeyX', cat: 'octave', val: 1 },
				{ key: 'KeyB', cat: 'vol', val: -0.1 },
				{ key: 'KeyN', cat: 'vol', val: 0.1 },
				{ key: 'KeyM', cat: 'mute', val: 1 },
				{ key: 'ArrowUp', cat: 'beats', val: 1 },
				{ key: 'ArrowDown', cat: 'beats', val: -1 },
			]

			// Finds corresponding key
			const hitKey = bindings.filter(elem => elem.key === e.code)[0]
			if (hitKey !== undefined) {
				//
				// Keybinds when focused on layers
				if (selected > -1) {
					let layer = layers[selected]

					const filteredVals = {
						beats: clamp(layer.beats - 1 + hitKey.val, 0, 15),
						freq: clamp(12 * octave + hitKey.val, 0, 53),
						vol: clamp(layer.volume + hitKey.val, 0, 1),
						mute: !layer.muted,
					}

					handleLayerChange(hitKey.cat, filteredVals[hitKey.cat], selected)
				}

				// (Maybe) Keybinds only used when not focused on layers
				else {
				}

				// Keybinds that works anywhere
				if (hitKey.cat === 'select') setSelected(hitKey.val)
				if (hitKey.cat === 'octave') setOctave(clamp(octave + hitKey.val, 0, 3))
			}
		}

		// Retire event when effect dies
		const removeEvent = () => window.removeEventListener('keydown', handleKeyMapping)
		window.addEventListener('keydown', handleKeyMapping)
		return removeEvent

		// eslint-disable-next-line
	}, [selected, layers, octave])

	useEffect(() => {
		function handleKeyMapping(e: KeyboardEvent) {
			if (document.activeElement) {
				// Lose focus before firing
				const el = document.activeElement as HTMLButtonElement
				el.blur()
			}

			let action = ''

			switch (e.code) {
				case 'Space': {
					action = 'toggle metronome'
					toggleMetronome()
					e.preventDefault()
					break
				}

				case 'NumpadAdd': {
					action = 'Tempo up'
					setTempo(tempoRef.current + (e.shiftKey ? 10 : 1))
					break
				}

				case 'NumpadSubtract': {
					action = 'Tempo down'
					setTempo(tempoRef.current - (e.shiftKey ? 10 : 1))
					break
				}

				case 'Escape':
					action = 'Toggle menu'
					break

				case 'KeyV': {
					action = 'Change click view'
					setMoreSettings(prev => ({
						...prev,
						clickType: (moreSettings.clickType + 1) % 3,
					}))
					break
				}
			}

			const newlog = [...logsRef.current]

			if (newlog.length === 6) newlog.shift()
			newlog.push({ key: e.code, action: action })
			setLogs(newlog)
		}

		const removeEvent = () => window.removeEventListener('keydown', handleKeyMapping)
		window.addEventListener('keydown', handleKeyMapping)
		return removeEvent

		// eslint-disable-next-line
	}, [])

	return (
		<div className="keylog">
			{/* {logs.map(({ key, action }, i) => (
				<li key={i}>
					<small>{action}</small>
					<code>{key}</code>
				</li>
			))} */}
		</div>
	)
}

export default Keymapping
