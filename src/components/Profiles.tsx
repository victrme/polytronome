// import { useBeforeunload } from 'react-beforeunload'

import { useEffect, useState } from 'react'
import { Layer } from '../Types'
import Themes from '../assets/themes.json'

const Profiles = ({
	easy,
	setEasy,
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
			let layerCode = ''
			let bools: boolean[] = []
			let activeLayers: boolean[] = []

			// Stack freq with beats, type with volume
			// (Duration + release) * 5 in binary array
			layers.forEach((layer: Layer, i: number) => {
				const savedLayer = JSON.parse(sessionStorage.layers)[i]
				const layerIsNotDefault = !compareLayers(layer, savedLayer)

				if (layerIsNotDefault) {
					const filteredVolume = parseInt(
						((layer.volume / 2) * 10 + 1).toPrecision(1)
					)
					const fbStack = layer.freq * 16 + layer.beats
					const tvStack = filteredVolume * 4 + waveformsList.indexOf(layer.type)

					layerCode +=
						(fbStack < 36 ? '0' : '') + fbStack.toString(36) + tvStack.toString(36)
				}

				activeLayers.push(layerIsNotDefault)
				bools.push(layer.duration, layer.release)
			})

			// Add more settings
			// Stack themes with layers/settings bool
			bools.push(easy, moreSettings.animations)
			const boolsInt = binaryToInt(bools)
			const tbStack = boolsInt * Themes.length + moreSettings.theme

			return (
				tempo.toString(36) +
				binaryToInt(activeLayers).toString(36) +
				layerCode +
				':' +
				tbStack.toString(36)
			)
		}

		const settingsExport = () => {}

		return mainExport() + (extended ? settingsExport() : '')
	}

	// In export: if layers are defaults, add binary after tempo to indicate which are activated
	// t: tempo, a: active layers, l: layers, m: more settings
	// [ttallllllllll:mm]

	const importCode = (code: string) => {
		//

		const split = code.split(':')
		const [tempoFreqBeats, boolsAndTheme] = split

		const defaultLayers = JSON.parse(sessionStorage.layers)
		const newLayers = defaultLayers
		let layersChars = ''
		let countActivated = 0
		let activesArray: number[] = []

		// Separate tempo & active layers from actual layer settings
		layersChars = tempoFreqBeats.slice(3, tempoFreqBeats.length)
		activesArray = intToBinary(parseInt(tempoFreqBeats.slice(2, 3), 36), 5).reverse()

		const theme = parseInt(boolsAndTheme, 36) % Themes.length
		const boolsInt = (parseInt(boolsAndTheme, 36) - theme) / Themes.length
		const boolsArray = intToBinary(boolsInt, 12)

		//
		// Decoding
		//

		// For all 5 layers
		for (let i = 0; i < 5; i++) {
			let { beats, freq, volume, type } = defaultLayers[i]

			// If changed layer, apply destackment
			if (activesArray[i]) {
				const typeVolumeCode = layersChars.charAt(countActivated * 3 + 2)
				const beatsFreqCode = layersChars.slice(
					countActivated * 3,
					countActivated * 3 + 2
				)
				beats = parseInt(beatsFreqCode, 36) % 16
				freq = (parseInt(beatsFreqCode, 36) - beats) / 16

				type = parseInt(typeVolumeCode, 36) % 4
				volume = (parseInt(typeVolumeCode, 36) - type) / 4
				volume = ((volume - 1) * 2) / 10

				countActivated++
			}

			newLayers[i] = {
				id: setRandomID(),
				beats,
				freq,
				volume,
				type: waveformsList[type],
				duration: !!boolsArray[i * 2],
				release: !!boolsArray[i * 2 + 1],
			}
		}

		// Add tempo
		const newTempo = parseInt(tempoFreqBeats.slice(0, 2), 36)
		const newMoreSettings = {
			theme,
			animations: boolsArray[0],
		}

		return {
			layers: newLayers,
			tempo: newTempo,
			moreSettings: newMoreSettings,
			easy: !!boolsArray[1],
		}
	}

	const applySaved = (data: any) => {
		setMoreSettings(prev => ({
			...prev,
			...data.moreSettings,
		}))
		setLayers([...data.layers])
		setTempo(data.tempo)
		setEasy(data.easy)
	}

	// useBeforeunload(event => {
	// 	localStorage.sleep = JSON.stringify(saveWork())
	// })

	//28v5gf9hbafnayfcxc:6at

	useEffect(() => {
		sessionStorage.layers = JSON.stringify(layers)
		applySaved(importCode('28v5gf9hbafnayfcxc:6at'))
	}, [])

	// useEffect(() => {
	// 	setExportCode(createExportCode(false))
	// }, [layers, moreSettings, tempo, easy])

	return <div></div>
}

export default Profiles
