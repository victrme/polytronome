import { useEffect, useState, useRef } from 'react'

const Keymapping = ({ toggleMetronome, tempoRef, setTempo, setMoreSettings, moreSettings }) => {
	const [logs, setLogs] = useState([{ key: 'keyM', action: 'Mute layer' }])
	const logsRef = useRef(logs)
	logsRef.current = logs

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

				case 'ArrowUp':
				case 'NumpadAdd': {
					action = 'Tempo up'
					setTempo(tempoRef.current + (e.ctrlKey ? 50 : e.shiftKey ? 10 : 1))
					break
				}

				case 'ArrowDown':
				case 'NumpadSubtract': {
					action = 'Tempo down'
					setTempo(tempoRef.current - (e.ctrlKey ? 50 : e.shiftKey ? 10 : 1))
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
			{logs.map(({ key, action }, i) => (
				<li key={i}>
					<small>{action}</small>
					<code>{key}</code>
				</li>
			))}
		</div>
	)
}

export default Keymapping
