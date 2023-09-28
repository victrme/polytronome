import { useEffect, useState } from 'react'

export default function useFullscreen() {
	const [fullscreen, setFullscreen] = useState(false)

	const toggleFullscreen = () => {
		if (document.fullscreenElement === null) {
			document.body?.requestFullscreen()
			setFullscreen(true)
			return
		}

		document.exitFullscreen()
		setFullscreen(false)
	}

	// const toggleWithElement = () => {
	// 	setFullscreen(!!document.fullscreenElement)
	// }

	// useEffect(() => {
	// 	window.addEventListener('fullscreenchange', toggleWithElement)
	// 	return window.removeEventListener('fullscreenchange', toggleWithElement)
	// }, [])

	return [fullscreen, toggleFullscreen] as [boolean, typeof toggleFullscreen]
}
