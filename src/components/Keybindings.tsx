import { useEffect, useState } from 'react'
import { clamp } from 'lodash'

const Keymapping = ({
	layers,
	toggleMetronome,
	tempoRef,
	setTempo,
	tapTempo,
	selected,
	setSelected,
	setMoreSettings,
	moreSettings,
	randomizeLayers,
	handleLayerChange,
}) => {
	const [octave, setOctave] = useState(0)

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

			enum When {
				Selected,
				NotSelected,
				Either,
			}

			console.log(e.code)

			const incrSelect = () => (selected + 1) % 5
			const decrSelect = () => (selected === 0 ? 4 : selected - 1)

			const bindings = [
				{ key: 'Backspace', cat: 'select', val: -1, active: When.Either },
				{ key: 'Digit1', cat: 'select', val: 0, active: When.Either },
				{ key: 'Digit2', cat: 'select', val: 1, active: When.Either },
				{ key: 'Digit3', cat: 'select', val: 2, active: When.Either },
				{ key: 'Digit4', cat: 'select', val: 3, active: When.Either },
				{ key: 'Digit5', cat: 'select', val: 4, active: When.Either },
				{ key: 'ArrowRight', cat: 'select', val: incrSelect(), active: When.Either },
				{ key: 'ArrowLeft', cat: 'select', val: decrSelect(), active: When.Either },
				{ key: 'KeyA', cat: 'freq', val: 0, active: When.Selected },
				{ key: 'KeyW', cat: 'freq', val: 1, active: When.Selected },
				{ key: 'KeyS', cat: 'freq', val: 2, active: When.Selected },
				{ key: 'KeyE', cat: 'freq', val: 3, active: When.Selected },
				{ key: 'KeyD', cat: 'freq', val: 4, active: When.Selected },
				{ key: 'KeyF', cat: 'freq', val: 5, active: When.Selected },
				{ key: 'KeyT', cat: 'freq', val: 6, active: When.Selected },
				{ key: 'KeyG', cat: 'freq', val: 7, active: When.Selected },
				{ key: 'KeyY', cat: 'freq', val: 8, active: When.Selected },
				{ key: 'KeyH', cat: 'freq', val: 9, active: When.Selected },
				{ key: 'KeyU', cat: 'freq', val: 10, active: When.Selected },
				{ key: 'KeyJ', cat: 'freq', val: 11, active: When.Selected },
				{ key: 'KeyK', cat: 'freq', val: 12, active: When.Selected },
				{ key: 'KeyO', cat: 'freq', val: 13, active: When.Selected },
				{ key: 'KeyL', cat: 'freq', val: 14, active: When.Selected },
				{ key: 'KeyP', cat: 'freq', val: 15, active: When.Selected },
				{ key: 'Semicolon', cat: 'freq', val: 16, active: When.Selected },
				{ key: 'Quote', cat: 'freq', val: 17, active: When.Selected },
				{ key: 'KeyZ', cat: 'octave', val: -1, active: When.Selected },
				{ key: 'KeyX', cat: 'octave', val: 1, active: When.Selected },
				{ key: 'KeyB', cat: 'vol', val: -0.1, active: When.Selected },
				{ key: 'KeyN', cat: 'vol', val: 0.1, active: When.Selected },
				{ key: 'KeyM', cat: 'mute', val: 1, active: When.Selected },
				{ key: 'ArrowUp', cat: 'beats', val: 1, active: When.Selected },
				{ key: 'ArrowDown', cat: 'beats', val: -1, active: When.Selected },
				{ key: 'KeyV', cat: 'view', val: 1, active: When.Either },
				{ key: 'AltRight', cat: 'shuffle', val: 1, active: When.Either },
				{ key: 'NumpadAdd', cat: 'tempo', val: 1, active: When.Either },
				{ key: 'NumpadSubtract', cat: 'tempo', val: -1, active: When.Either },
				{ key: 'Equal', cat: 'tempo', val: 1, active: When.Either },
				{ key: 'Minus', cat: 'tempo', val: -1, active: When.Either },
				{ key: 'Digit0', cat: 'tempoTap', val: 1, active: When.Either },
				{ key: 'Space', cat: 'metronome', val: 1, active: When.Either },
			]

			// Finds corresponding key
			const hitKey = bindings.filter(elem => elem.key === e.code)[0]
			if (hitKey !== undefined && !e.ctrlKey) {
				//
				// Keybinds when focused on layers

				if (hitKey.active === When.Selected && selected > -1) {
					let layer = layers[selected]
					const { cat, val } = hitKey

					const filteredVals = {
						beats: clamp(layer.beats - 1 + val, 0, 15),
						freq: clamp(12 * octave + val, 0, 53),
						vol: clamp(layer.volume + val, 0, 1),
						mute: !layer.muted,
					}

					if (cat === 'select') e.preventDefault()
					handleLayerChange(cat, filteredVals[cat], selected)
				}

				// Keys that doesn't overlap with layers keys
				else if (hitKey.active === When.Either) {
					const actions = {
						select: () => setSelected(hitKey.val),
						octave: () => setOctave(clamp(octave + hitKey.val, 0, 3)),
						view: () => toggleClickView(),
						shuffle: () => randomizeLayers(),
						tempoTap: () => tapTempo(),
						tempo: () => {
							const updatedTempo =
								tempoRef.current + hitKey.val * (e.shiftKey ? 10 : 1)
							setTempo(clamp(updatedTempo, 30, 300))
						},
						metronome: () => {
							toggleMetronome()
							e.preventDefault()
						},
					}

					actions[hitKey.cat]()
				}

				// These keys only work when nothing is selected
				else if (hitKey.active === When.NotSelected) {
				}
			}
		}

		// Retire event when effect dies
		const removeEvent = () => window.removeEventListener('keydown', handleKeyMapping)
		window.addEventListener('keydown', handleKeyMapping)
		return removeEvent

		// eslint-disable-next-line
	}, [selected, layers, moreSettings, octave])

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
