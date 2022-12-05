import Settings from '../types/settings'
import Layer from '../types/layer'

export default function exportCode(tempo: number, layers: Layer[], moreSettings: Settings) {
	const minifiedLayers: Number[][] = []

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

	const minifiedSettings: Number[] = [
		+moreSettings.easy,
		+moreSettings.animations,
		+moreSettings.theme,
		+moreSettings.clickType,
		+moreSettings.offset,
	]

	return [tempo, minifiedLayers, minifiedSettings]
}
