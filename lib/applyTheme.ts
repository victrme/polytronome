import Themes from '../public/assets/themes.json'

export default function applyTheme(index: number) {
	if (index < 0 && index >= Themes.length) {
		return
	}

	const root = document.querySelector(':root')! as HTMLBodyElement
	Object.entries(Themes[index]).forEach(([key, val]) => {
		if (val) root.style.setProperty('--' + key, val)
	})

	document
		.querySelector('meta[name="theme-color"]')
		?.setAttribute('content', Themes[index].background)
}
