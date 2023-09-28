import { useEffect } from 'react'
import importCode from '../lib/codeImport'

export default function useLoadStorageSettings(props: { handleStorageImport: Function }) {
	useEffect(function applySavedSettings() {
		try {
			// Apply saved settings
			if (localStorage.sleep) {
				let code = importCode(JSON.parse(localStorage.sleep))

				let tempAnim = code.moreSettings.animations
				code.moreSettings.animations = false

				props.handleStorageImport({ ...code })

				// timeout to reenable anims to preference
				setTimeout(() => {
					if (tempAnim === true) {
						code.moreSettings.animations = true
						props.handleStorageImport({ ...code })
					}
				}, 30)
			}
		} catch (error) {
			console.error(error)
		}
	}, [])
}
