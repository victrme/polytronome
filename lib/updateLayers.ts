import Layer from '../types/layer'

export default function updateLayers({
	cat,
	val,
	index,
	layers,
}: {
	layers: Layer[]
	cat: string
	val: number
	index: number
}) {
	let newLayers = [...layers]
	const durationsList = [50, 0.25, 0.33, 0.5, 0.75, 0.97]

	switch (cat) {
		case 'wave':
			newLayers[index].type = (newLayers[index].type + val) % 4
			break

		case 'beats': {
			newLayers[index].beats = val + 1
			break
		}

		case 'freq':
			newLayers[index].freq = val
			break

		case 'duration': {
			const curr = durationsList.indexOf(val)
			newLayers[index].duration = durationsList[(curr + 1) % durationsList.length]
			break
		}

		case 'release':
			newLayers[index].release = (newLayers[index].release + 1) % 3
			break

		case 'mute':
			newLayers[index].muted = !newLayers[index].muted
			break

		case 'vol':
			newLayers[index].volume = val
			break
	}

	return [...newLayers]
}
