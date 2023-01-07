import { useEffect, useRef, useState } from 'react'
import Pizzicato from 'pizzicato'

//
// Force sound on first inputs
//

export default function useEnableBrowserSound() {
	const [mockAmount, setMockAmount] = useState(0)
	const mockRef = useRef(mockAmount)
	mockRef.current = mockAmount

	function playSilentSound() {
		const silentSound = new Pizzicato.Sound({
			source: 'wave',
			options: {
				type: 'square',
				volume: 0.01,
				frequency: 1,
				attack: 0,
				release: 0,
			},
		})

		if (mockRef.current < 2) {
			silentSound.play()
			setMockAmount(mockRef.current + 1)
			setTimeout(() => silentSound.stop(), 200)
			return
		}

		silentSound.disconnect(null)
	}

	// Forces Safari to play sounds without "real" user gestures
	useEffect(() => {
		document.body.addEventListener('click', () => playSilentSound())
		document.body.addEventListener('keypress', () => playSilentSound())

		return () => {
			document.body.removeEventListener('click', () => playSilentSound())
			document.body.removeEventListener('keypress', () => playSilentSound())
		}
	}, [])
}
