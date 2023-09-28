import Layer from '../types/layer'
import { tempoList } from './utils'
import Timings from '../types/timings'

export default function getMetronomeTimings({
	layers,
	tempo,
}: {
	layers: Layer[]
	tempo: number
}) {
	const wholeMesureInMs = 24e4 / tempoList[tempo]
	const division: { ratio: number; layer: number }[] = []
	let rawTimings: [number, number][] = []
	const result: Timings = []

	// Fill with all layers divisions
	layers.forEach((layer, index) => {
		for (let beat = 1; beat < layer.beats; beat++) {
			division.push({ ratio: beat / layer.beats, layer: index })
		}
	})

	// Sort: slower latency first, regardless of layer
	division.sort((a, b) => a.ratio - b.ratio)

	// Substract time from last click to get click interval
	let lastClickTime = 0
	division.forEach(elem => {
		const clickTime = wholeMesureInMs * elem.ratio
		const interval = clickTime - lastClickTime

		rawTimings.push([interval, elem.layer])
		lastClickTime = clickTime
	})

	// Subsctract from last click
	rawTimings.push([wholeMesureInMs - lastClickTime, rawTimings[rawTimings.length - 1][1]])

	// Add 0 timed layer index to last timing
	// Or push a new timing
	rawTimings.forEach(([time, layer]) => {
		if (time === 0) result[result.length - 1][1].push(layer)
		else result.push([time, [layer]])
	})

	// [play time in ms, [all layers played at that time]]
	return result
}
