import { useEffect, useState } from 'react'

export default function useIsMobile() {
	const [isForMobile, setIsForMobile] = useState(false)

	// Changes mobile view
	const handleMobileView = () => {
		setIsForMobile((window.visualViewport && window?.visualViewport?.width < 500) || false)
	}

	useEffect(() => {
		handleMobileView()
		window.addEventListener('resize', handleMobileView)
		return () => window.removeEventListener('resize', handleMobileView)
	}, [])

	return [isForMobile]
}
