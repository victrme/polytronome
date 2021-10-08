// import { useBeforeunload } from 'react-beforeunload'

import { useEffect, useState } from 'react'
import { Layer } from '../Types'

const Profiles = ({
	layers,
	tempo,
	moreSettings,
	setLayers,
	setMoreSettings,
	setTempo,
	setRandomID,
	exportCode,
	setExportCode,
}) => {
	const waveformsList = ['triangle', 'sawtooth', 'square', 'sine']

	const binaryToInt = arr => arr.reduce((a, v) => (a << 1) | v)
	const intToBinary = int => [...Array(15)].map((x, i) => (int >> i) & 1)

	const compareLayers = (stateLayer: Layer, defaultLayer: Layer) => {
		let result = true

		Object.values(stateLayer).forEach((val, index) => {
			if (val !== Object.values(defaultLayer)[index]) result = false
		})

		return result
	}

	const pfStorage = {
		available: () => {
			if (localStorage.profile === undefined || localStorage.profile === '[]')
				return false
			else return true
		},
		get: () => {
			let result: any[] = []
			try {
				result = JSON.parse(localStorage.profile)
			} catch (error) {
				console.log(localStorage.profile, error)
			}
			return result
		},
		set: (a: any) => (localStorage.profile = JSON.stringify(a)),
	}

	const createExportCode = (extended: boolean) => {
		//
		//	Stackers uses steps for saving different settings in one character
		//
		//	To stack:
		// 	[a.len: 3, b.len: 4] => to get the a[2] and b[1]
		// 	a * b.len + b ---> 3 * 4 + 2 = 14th character
		//
		// 	To destack:
		// 	b: stack % b.length
		// 	a: (stack - b) / b.length
		//
		const mainExport = () => {
			let freqBeats = ''
			let effects: boolean[] = []
			let activeLayers: boolean[] = []

			layers.forEach(function (layer: Layer, i: number) {
				const savedLayer = JSON.parse(sessionStorage.layers)[i]
				const layerIsNotDefault = !compareLayers(layer, savedLayer)

				if (layerIsNotDefault) {
					const stack = layer.freq * 16 + layer.beats
					freqBeats += (stack < 36 ? '0' : '') + stack.toString(36)
				}

				activeLayers.push(layerIsNotDefault)
				effects.push(layer.duration, layer.release)
			})

			console.log(activeLayers)

			const activeLayersResult = binaryToInt(activeLayers).toString(36)

			return (
				tempo.toString(36) +
				(activeLayersResult === 'v' ? '' : activeLayersResult) +
				freqBeats +
				':' +
				binaryToInt(effects)
			)
		}

		const settingsExport = () => {
			const waveStacker = () => {
				const form = waveformsList.findIndex(w => w === moreSettings.sound.type)
				const time = moreSettings.sound.duration ? 1 : 0
				return (form * waveformsList.length + time).toString(26)
			}
			// times 2 because [true, false].length = 2
			const displayStacker = () =>
				((+moreSettings.animations | 0) * 2 + (+moreSettings.segment.on | 0)).toString(
					26
				)
			return (
				'-' +
				Math.floor(moreSettings.sound.volume * 35).toString(36) +
				Math.floor(moreSettings.sound.release * 35).toString(36) +
				waveStacker() +
				(+moreSettings.theme | 0) +
				displayStacker()
			)
		}
		return mainExport() + (extended ? settingsExport() : '')
	}

	// In export: if layers are defaults, add binary after tempo to indicate which are activated

	const importCode = (code: string) => {
		const split = code.split(':')
		const [tempoFreqBeats, effects] = split

		const mainDecode = () => {
			const allEffects = intToBinary(effects)
			const layersChars = tempoFreqBeats.slice(2, tempoFreqBeats.length)
			const newLayers: any[] = []

			if (tempoFreqBeats.length === 12) {
				// Add Beats and Frequency
				for (let ii = 0; ii < 5; ii++) {
					// 	Takes 2 chars at a time
					const singleLayer = layersChars.slice(ii * 2, ii * 2 + 2)

					//	Apply destackment
					const beats = parseInt(singleLayer, 36) % 16
					const note = (parseInt(singleLayer, 36) - beats) / 16
					newLayers.push({
						beats: beats === 0 ? 16 : beats,
						frequency: note,
					})
				}

				// Add Effects
				newLayers.forEach((l, i) => {
					newLayers[i].duration = !!allEffects[i * 2]
					newLayers[i].release = !!allEffects[i * 2 + 1]
				})
			}

			// Add tempo
			const newTempo = parseInt(tempoFreqBeats.slice(0, 2), 36)

			return {
				newLayers,
				newTempo,
			}
		}

		// const settingsDecode = () => {
		// 	const wavetime = parseInt(settingsChars[2], 26) % waveformsList.length
		// 	const clickType = (parseInt(settingsChars[2], 26) - wavetime) / waveformsList.length
		// 	const segment = parseInt(settingsChars[4], 26) % 2
		// 	const animations = (parseInt(settingsChars[4], 26) - segment) / 2
		// 	return {
		// 		volume: +(parseInt(settingsChars[0], 36) / 35).toFixed(2),
		// 		release: +(parseInt(settingsChars[1], 36) / 35).toFixed(2),
		// 		wavetime: wavetime,
		// 		waveform: waveformsList[clickType],
		// 		theme: +settingsChars[3],
		// 		segment: !!segment,
		// 		animations: !!animations,
		// 	}
		// }

		// if (settingsChars === undefined) {
		// 	return mainDecode()
		// } else {
		// 	return {
		// 		...mainDecode(),
		// 		...settingsDecode(),
		// 	}
		// }

		return mainDecode()
	}

	const applySaved = (data: any) => {
		setMoreSettings(prev => ({
			...prev,
			animations: data.animations,
			theme: data.theme,
			segment: {
				...prev.segment,
				on: data.segment,
			},
			sound: { ...data.sound },
		}))
		setLayers([...data.layers])
		setTempo(data.tempo)
		//applyTheme(data.theme)
	}

	// useBeforeunload(event => {
	// 	localStorage.sleep = JSON.stringify(saveWork())
	// })

	useEffect(() => {
		sessionStorage.layers = JSON.stringify(layers)
	}, [])

	useEffect(() => {
		setExportCode(createExportCode(false))
	}, [layers, moreSettings, tempo])

	console.log(exportCode, importCode(exportCode))

	return <div>{'ok'}</div>
}

export default Profiles
