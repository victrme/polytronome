import { useTransition, animated, config } from '@react-spring/web'
import { useEffect, useState } from 'react'
import clamp from 'lodash/clamp'

import bindingsList from '../lib/keybindings'

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

			// Finds corresponding key
			const hitArray = bindingsList.filter(elem => elem.key === e.code)
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
						setTempo(clamp(updatedTempo, 0, 48))

						clearTimeout(tempoWait)
						tempoWait = setTimeout(() => {
							toggleMetronome(true)
						}, 400)
					}

					const incrSelect = () => (selected + 1) % 5
					const decrSelect = () => (selected === 0 ? 4 : selected - 1)

					const actions = {
						tempoTap: () => tapTempo(),
						tempo: () => updateTempo(),
						view: () => toggleClickView(),
						shuffle: () => randomizeLayers(),
						fullscreen: () => changeFullscreen(),
						octave: () => setOctave(clamp(octave + hitKey.val, 0, 3)),
						select: () => {
							setSelected(
								hitKey.val === -2
									? false
									: hitKey.val === 1
									? incrSelect()
									: decrSelect()
							)
						},
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

		window.addEventListener('keydown', handleKeyMapping)
		return () => window.removeEventListener('keydown', handleKeyMapping)

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
