import Themes from '../public/assets/themes.json'
import defaultLayers from '../public/assets/layers.json'
import defaultSettings from '../public/assets/settings.json'
import Settings from '../types/settings'
import Layer from '../types/layer'

export const tempoList = [
	30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 63, 66, 69, 72, 76, 80, 84,
	88, 92, 96, 100, 104, 108, 112, 116, 120, 126, 132, 138, 144, 152, 160, 168, 176, 184, 192,
	200, 208, 216, 224, 232, 240, 252,
]

export const applyTheme = (index: number, anim: boolean) => {
	const root = document.querySelector(':root')! as HTMLBodyElement

	document.body.style.transitionDuration = anim ? '1s' : '0s'

	if (index >= 0 && index < Themes.length) {
		Object.entries(Themes[index]).forEach(([key, val]) =>
			val !== undefined ? root.style.setProperty('--' + key, val) : ''
		)
		document
			.querySelector('meta[name="theme-color"]')
			?.setAttribute('content', Themes[index].background)
	}
}

export const setRandomID = () => {
	let str = ''
	while (str.length < 8) str += String.fromCharCode(Math.random() * (122 - 97) + 97)
	return str
}

//
//
// Profile export / import
//
//

export const createExportCode = (tempo: number, layers: Layer[], moreSettings: Settings) => {
	const minifiedLayers: Number[][] = []
	const minifiedSettings: Number[] = []

	layers.forEach(layer => {
		minifiedLayers.push([
			layer.beats,
			layer.freq,
			layer.type,
			+layer.duration,
			+layer.release,
			layer.volume,
			+layer.muted,
		])
	})

	Object.values(moreSettings).forEach(setting => {
		minifiedSettings.push(+setting)
	})

	return [tempo, minifiedLayers, minifiedSettings]
}

export const importCode = (code: any[]) => {
	if (code.length === 0)
		return {
			tempo: 21,
			layers: defaultLayers,
			moreSettings: defaultSettings,
		}

	const parsedLayers: Layer[] = []
	const parsedSettings: Settings = {
		easy: true,
		theme: 0,
		fullscreen: false,
		animations: false,
		clickType: 0,
		offset: 0,
	}

	const [tempo, layers, settings] = code

	layers.forEach((minified: number[]) => {
		parsedLayers.push({
			id: setRandomID(),
			beats: minified[0],
			freq: minified[1],
			type: minified[2],
			duration: minified[3],
			release: minified[4],
			volume: minified[5],
			muted: !!minified[6],
		})
	})

	Object.keys(parsedSettings).forEach((key: string, i: number) => {
		parsedSettings[key] = settings[i]
	})

	return {
		tempo,
		layers: parsedLayers,
		moreSettings: parsedSettings,
	}
}
