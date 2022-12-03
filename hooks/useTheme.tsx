import { useEffect, useState } from 'react'

import Themes from '../public/assets/themes.json'
import defaultSettings from '../public/assets/settings.json'

export default function useTheme() {
	const [theme, setTheme] = useState(defaultSettings.theme)

	const applyTheme = (index: number) => {
		const root = document.querySelector(':root')! as HTMLBodyElement

		if (index >= 0 && index < Themes.length) {
			Object.entries(Themes[index]).forEach(([key, val]) =>
				val !== undefined ? root.style.setProperty('--' + key, val) : ''
			)
			document
				.querySelector('meta[name="theme-color"]')
				?.setAttribute('content', Themes[index].background)

			setTheme(index)
		}
	}

	function firstStartupColorScheme() {
		if (!localStorage.sleep && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			setTheme(0)
		}
	}

	useEffect(() => applyTheme(theme), [theme]) // Update theme
	useEffect(() => firstStartupColorScheme(), []) // first start

	return [theme, applyTheme] as [number, typeof applyTheme]
}
