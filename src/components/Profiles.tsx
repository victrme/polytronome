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
	const intToBinary = (int, size) => [...Array(size)].map((x, i) => (int >> i) & 1)

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

			return (
				tempo.toString(36) +
				binaryToInt(activeLayers).toString(36) +
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
	// t: tempo, a: active layers, l: layers, m: more settings
	// [ttallllllllll:mm]

	const importCode = (code: string) => {
		const split = code.split(':')
		const [tempoFreqBeats, effects] = split

		const mainDecode = () => {
			const defaultLayers = JSON.parse(sessionStorage.layers)
			const allEffects = intToBinary(effects, 10)
			const newLayers = defaultLayers
			let layersChars = ''
			let countActivated = 0
			let activesArray: number[] = []

			layersChars = tempoFreqBeats.slice(3, tempoFreqBeats.length)
			activesArray = intToBinary(parseInt(tempoFreqBeats.slice(2, 3), 36), 5).reverse()

			//
			// Decoding
			//

			for (let i = 0; i < 5; i++) {
				let beats = defaultLayers[i].beats
				let freq = defaultLayers[i].freq

				// If changed layer, apply destackment
				if (activesArray[i]) {
					const singleLayer = layersChars.slice(
						countActivated * 2,
						countActivated * 2 + 2
					)
					beats = parseInt(singleLayer, 36) % 16
					freq = (parseInt(singleLayer, 36) - beats) / 16

					countActivated++
				}

				newLayers[i] = {
					beats,
					freq,
					id: defaultLayers[i].id,
					duration: !!allEffects[i * 2],
					release: !!allEffects[i * 2 + 1],
					volume: 0.4,
				}
			}

			// Add tempo
			const newTempo = parseInt(tempoFreqBeats.slice(0, 2), 36)

			return {
				newLayers,
				newTempo,
			}
		}

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
