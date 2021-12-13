import { useEffect } from 'react'

const Keymapping = ({ toggleMetronome, tempoRef, setTempo, setMoreSettings, moreSettings }) => {
	useEffect(() => {
		function handleKeyMapping(e: KeyboardEvent) {
			if (document.activeElement) {
				// Lose focus before firing
				const el = document.activeElement as HTMLButtonElement
				el.blur()
			}

			console.log(e)

			switch (e.code) {
				case 'Space': {
					toggleMetronome()
					e.preventDefault()
					break
				}

				case 'ArrowUp':
				case 'NumpadAdd':
					setTempo(tempoRef.current + (e.ctrlKey ? 50 : e.shiftKey ? 10 : 1))
					break

				case 'ArrowDown':
				case 'NumpadSubtract':
					setTempo(tempoRef.current - (e.ctrlKey ? 50 : e.shiftKey ? 10 : 1))
					break

				case 'Escape':
					console.log('Toggle Menu')
					break

				case 'KeyV': {
					setMoreSettings(prev => ({
						...prev,
						clickType: (moreSettings.clickType + 1) % 3,
					}))
					break
				}
			}
		}

		const removeEvent = () => window.removeEventListener('keydown', handleKeyMapping)
		window.addEventListener('keydown', handleKeyMapping)
		return removeEvent

		// eslint-disable-next-line
	}, [])

	return <div className="keylog"></div>
}

export default Keymapping
