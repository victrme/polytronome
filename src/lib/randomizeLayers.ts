import Layer from '../types/layer'

export default function randomizeLayers({ layers }: { layers: Layer[] }) {
	// Only randomizes activated layers
	const randBeats = () => +(Math.random() * (16 - 2) + 2).toFixed(0)
	return [...layers].map(l => (l.beats > 1 ? { ...l, beats: randBeats() } : { ...l }))
}
