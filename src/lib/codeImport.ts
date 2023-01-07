import defaultLayers from '../assets/layers.json'
import defaultSettings from '../assets/settings.json'
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

	// array destructuring must be in this order !
	const [easy, animations, theme, clickType, offset] = settings

	const parsedSettings: Settings = {
		easy: !!easy || false,
		animations: !!animations || false,
		theme: theme || 0,
		clickType: clickType || 0,
		offset: offset || 0,
	}

	return {
		tempo,
		layers: parsedLayers,
		moreSettings: parsedSettings,
	}
}
