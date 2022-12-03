import defaultLayers from '../public/assets/layers.json'
import defaultSettings from '../public/assets/settings.json'
import Settings from '../types/settings'
import Layer from '../types/layer'
import { setRandomID } from './utils'

export default function importCode(code: any[]) {
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
