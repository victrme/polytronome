import Settings from '../types/settings'
import Layer from '../types/layer'

export default function exportCode(tempo: number, layers: Layer[], moreSettings: Settings) {
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
