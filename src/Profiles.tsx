// import { useBeforeunload } from 'react-beforeunload'

const Profiles = () => {
	// const pfStorage = {
	// 	available: () => {
	// 		if (localStorage.profile === undefined || localStorage.profile === '[]')
	// 			return false
	// 		else return true
	// 	},
	// 	get: () => {
	// 		let result: any[] = []
	// 		try {
	// 			result = JSON.parse(localStorage.profile)
	// 		} catch (error) {
	// 			console.log(localStorage.profile, error)
	// 		}
	// 		return result
	// 	},
	// 	set: (a: any) => (localStorage.profile = JSON.stringify(a)),
	// }
	// const exportCode = (extended: boolean) => {
	// 	//
	// 	//	Stackers uses steps for saving different settings in one character
	// 	//
	// 	//	To stack:
	// 	// 	[a.len: 3, b.len: 4] => to get the a[2] and b[1]
	// 	// 	a * b.len + b ---> 3 * 4 + 2 = 14th character
	// 	//
	// 	// 	To destack:
	// 	// 	b: stack % b.length
	// 	// 	a: (stack - b) / b.length
	// 	//
	// 	const mainExport = () => {
	// 		let layers = ''
	// 		layers.forEach(layer => {
	// 			const stack = layer.frequency * 16 + layer.beats
	// 			if (stack > 36) layers += stack.toString(36)
	// 			else layers += '0' + stack.toString(36)
	// 		})
	// 		return tempo.toString(30) + layers
	// 	}
	// 	const settingsExport = () => {
	// 		const waveStacker = () => {
	// 			const form = waveformsList.findIndex(w => w === moreSettings.sound.type)
	// 			const time = moreSettings.sound.duration
	// 			return (form * waveTimeList.length + time).toString(26)
	// 		}
	// 		// times 2 because [true, false].length = 2
	// 		const displayStacker = () =>
	// 			((+moreSettings.animations | 0) * 2 + (+moreSettings.segment.on | 0)).toString(
	// 				26
	// 			)
	// 		return (
	// 			'-' +
	// 			Math.floor(moreSettings.sound.volume * 35).toString(36) +
	// 			Math.floor(moreSettings.sound.release * 35).toString(36) +
	// 			waveStacker() +
	// 			(+moreSettings.theme | 0) +
	// 			displayStacker()
	// 		)
	// 	}
	// 	return mainExport() + (extended ? settingsExport() : '')
	// }
	// const saveWork = () => {
	// 	const importCode = (code: string) => {
	// 		const split = code.split('-')
	// 		const [mainChars, settingsChars] = split
	// 		const mainDecode = () => {
	// 			//
	// 			// 	For amout of layers found (divide by 2 char by layer)
	// 			// 	get 1, 2 char, and step up... 3, 4, etc
	// 			//
	// 			const layersChars = mainChars.slice(2, mainChars.length)
	// 			const newLayers: any[] = []
	// 			for (let ii = 0; ii < layersChars.length / 2; ii++) {
	// 				// 	Takes 2 chars at a time
	// 				const singleLayer = layersChars.slice(ii * 2, ii * 2 + 2)
	// 				//	Apply destackment
	// 				const beats = parseInt(singleLayer, 36) % 16
	// 				const note = (parseInt(singleLayer, 36) - beats) / 16
	// 				newLayers.push({
	// 					beats: beats === 0 ? 16 : beats,
	// 					frequency: note,
	// 				})
	// 			}
	// 			const tempo = parseInt(mainChars.slice(0, 2), 30)
	// 			return {
	// 				layers,
	// 				tempo,
	// 			}
	// 		}
	// 		const settingsDecode = () => {
	// 			const wavetime = parseInt(settingsChars[2], 26) % waveTimeList.length
	// 			const clickType =
	// 				(parseInt(settingsChars[2], 26) - wavetime) / waveTimeList.length
	// 			const segment = parseInt(settingsChars[4], 26) % 2
	// 			const animations = (parseInt(settingsChars[4], 26) - segment) / 2
	// 			return {
	// 				volume: +(parseInt(settingsChars[0], 36) / 35).toFixed(2),
	// 				release: +(parseInt(settingsChars[1], 36) / 35).toFixed(2),
	// 				wavetime: wavetime,
	// 				waveform: clickTypeList[clickType],
	// 				theme: +settingsChars[3],
	// 				segment: !!segment,
	// 				animations: !!animations,
	// 			}
	// 		}
	// 		if (settingsChars === undefined) {
	// 			return mainDecode()
	// 		} else {
	// 			return {
	// 				...mainDecode(),
	// 				...settingsDecode(),
	// 			}
	// 		}
	// 	}
	// 	return {
	// 		name: setRandomID(),
	// 		layers: [...layers],
	// 		tempo: tempo,
	// 		animations: moreSettings.animations,
	// 		theme: moreSettings.theme,
	// 		segment: moreSettings.segment.on,
	// 	}
	// }
	// const applySaved = (data: any) => {
	// 	setMoreSettings(prev => ({
	// 		...prev,
	// 		animations: data.animations,
	// 		theme: data.theme,
	// 		segment: {
	// 			...prev.segment,
	// 			on: data.segment,
	// 		},
	// 		sound: { ...data.sound },
	// 	}))
	// 	setLayers([...data.layers])
	// 	setTempo(data.tempo)
	// 	applyTheme(data.theme)
	// }
	// const addProfiles = () => {
	// 	const profiles = pfStorage.get()
	// 	if (profiles.length < 5) {
	// 		// Nested objects need to be saved like this
	// 		// (layers, sound, etc.)
	// 		profiles.push(saveWork())
	// 		pfStorage.set(profiles)
	// 		setSelectedProfile(profiles.length - 1)
	// 	}
	// }
	// const selectProfile = (selection: number) => {
	// 	const profile = JSON.parse(localStorage.profile)[selection]
	// 	applySaved(profile)
	// 	setSelectedProfile(selection)
	// 	//setExportInput(exportCode(true))
	// }
	// const deleteProfile = () => {
	// 	const i = selectedProfile
	// 	const p = pfStorage.get()
	// 	p.splice(i, 1)
	// 	pfStorage.set(p)
	// 	let newSelection = 0
	// 	if (i === 0 || p.length === i) newSelection = i
	// 	else newSelection = i - 1
	// 	setSelectedProfile(newSelection)
	// }
	//
	//
	//	JSXs
	//
	//
	// const ProfileList = () => {
	// 	const list = pfStorage.get()
	// 	const [renamingInput, setRenamingInput] = useState(list[selectedProfile].name)
	// 	let result = (
	// 		<div className="profile-bank">
	// 			<div className="profile" onClick={addProfiles}>
	// 				<span>+</span>
	// 			</div>
	// 		</div>
	// 	)
	// 	if (pfStorage.available()) {
	// 		result = (
	// 			<div className="profile-bank">
	// 				{pfStorage.get().map((pf, i) => (
	// 					<div
	// 						key={i}
	// 						className={'profile' + (selectedProfile === i ? ' selected' : '')}
	// 						onClick={() =>
	// 							selectedProfile === i ? setIsTyping(true) : selectProfile(i)
	// 						}
	// 					>
	// 						<div
	// 							className={
	// 								'profile-name' +
	// 								(selectedProfile === i && IsTyping ? ' edit' : '')
	// 							}
	// 						>
	// 							<input
	// 								name="profile-name"
	// 								type="text"
	// 								value={renamingInput}
	// 								onChange={e => {
	// 									if (e.target.value.length < 12) {
	// 										setRenamingInput(e.target.value)
	// 										list[selectedProfile].name = e.target.value
	// 										pfStorage.set(list)
	// 									}
	// 								}}
	// 								onKeyPress={e =>
	// 									e.key === 'Enter' ? setIsTyping(false) : ''
	// 								}
	// 							/>
	// 							<span>{pf.name}</span>
	// 						</div>
	// 					</div>
	// 				))}
	// 				<div className="profile" onClick={addProfiles}>
	// 					<span>+</span>
	// 				</div>
	// 			</div>
	// 		)
	// 	}
	// 	return result
	// }
	// useBeforeunload(event => {
	//     localStorage.sleep = JSON.stringify(saveWork())
	// })
}

export default Profiles
