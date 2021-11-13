import Themes from './assets/themes.json'
import { Layer, MoreSettings } from './Types'

export const applyTheme = (index: number) => {
	const root = document.querySelector(':root')! as HTMLBodyElement
	Object.entries(Themes[index]).forEach(([key, val]) =>
		val !== undefined ? root.style.setProperty('--' + key, val) : ''
	)
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

export const waveformsList = ['triangle', 'sawtooth', 'square', 'sine']

export const createExportCode = (
	tempo: number,
	layers: Layer[],
	moreSettings: MoreSettings,
	easy: boolean
) => {
	const minifiedLayers: Number[][] = []
	const minifiedSettings: Number[] = []

	layers.forEach(layer => {
		minifiedLayers.push([
			layer.beats,
			layer.freq,
			waveformsList.indexOf(layer.type),
			+layer.duration,
			+layer.release,
			layer.volume,
			+layer.muted,
		])
	})

	Object.values(moreSettings).forEach(setting => {
		minifiedSettings.push(+setting)
	})

	return [+easy, tempo, minifiedLayers, minifiedSettings]
}

export const importCode = (code: any[]) => {
	const parsedLayers: Layer[] = []
	const parsedSettings: MoreSettings = {
		theme: 0,
		fullscreen: false,
		performance: false,
	}

	code[2].forEach((minified: number[]) => {
		parsedLayers.push({
			id: setRandomID(),
			beats: minified[0],
			freq: minified[1],
			type: waveformsList[minified[2]],
			duration: !!minified[3],
			release: minified[4],
			volume: minified[5],
			muted: !!minified[6],
		})
	})

	Object.keys(parsedSettings).forEach((key: string, i: number) => {
		parsedSettings[key] = code[3][i]
	})

	return {
		easy: !!code[0],
		tempo: code[1],
		layers: parsedLayers,
		moreSettings: parsedSettings,
	}
}
