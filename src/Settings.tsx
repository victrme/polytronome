import Themes from './Themes'
import Tempo from './Tempo'
import propTypes from 'prop-types'

const Settings = ({
	moreSettings,
	segment,
	tempo,
	tempoRef,
	setSegment,
	setMoreSettings,
	restartMetronome,
	changeTempo,
	wheelUpdate,
}) => {
	const changeAnimations = () => {
		const appDOM = document.querySelector('.App') as HTMLDivElement

		moreSettings.animations
			? appDOM.classList.add('performance')
			: appDOM.classList.remove('performance')

		setMoreSettings(prev => ({
			...prev,
			animations: moreSettings.animations ? false : true,
		}))
	}

	const changeFullscreen = (state: boolean) => {
		if (!state && document.fullscreenElement === null) {
			const wrap = document.querySelector('.settings-wrap') as HTMLDivElement
			document.querySelector('.App')!.requestFullscreen()
			wrap.style.overflowY = 'auto'
		} else if (document.fullscreenElement !== null) {
			document.exitFullscreen()
		}

		setMoreSettings(prev => ({
			...prev,
			fullscreen: !state,
		}))
	}

	const applyTheme = (theme: number) => {
		const root = document.querySelector(':root')! as HTMLBodyElement

		root.style.setProperty('--background', Themes[theme].background)
		root.style.setProperty('--accent', Themes[theme].accent)
		root.style.setProperty('--dim', Themes[theme].dim)
		root.style.setProperty('--dimmer', Themes[theme].dimmer)
		root.style.setProperty('--buttons', Themes[theme].buttons || Themes[theme].dim)
	}

	const changeTheme = (theme: number) => {
		const newTheme = (theme + 1) % Themes.length

		applyTheme(newTheme)

		setMoreSettings(prev => ({ ...prev, theme: newTheme }))
		localStorage.theme = newTheme
	}

	return (
		<div className="settings-wrap">
			{moreSettings.all ? (
				<Tempo
					restart={restartMetronome}
					update={changeTempo}
					wheelUpdate={wheelUpdate}
					tempo={tempo}
					tempoRef={tempoRef}
				></Tempo>
			) : (
				''
			)}

			<div className="other-settings">
				<div className="setting advanced">
					<div>
						<h4>All settings</h4>
					</div>

					<button
						name="advanced"
						id="advanced"
						onClick={() =>
							setMoreSettings(prev => ({
								...prev,
								all: moreSettings.all ? false : true,
							}))
						}
					>
						{moreSettings.all ? 'on' : 'off'}
					</button>
				</div>

				<div className="setting fullscreen">
					<h4>Fullscreen</h4>

					<button
						name="fullscreen"
						id="fullscreen"
						onClick={() => changeFullscreen(moreSettings.fullscreen)}
					>
						{moreSettings.fullscreen ? 'on' : 'off'}
					</button>
				</div>

				<div className="setting animations">
					<div>
						<h4>Animations</h4>
					</div>

					<button name="animations" id="animations" onClick={changeAnimations}>
						{moreSettings.animations ? 'on' : 'off'}
					</button>
				</div>

				<div className="setting display">
					<h4>Clicks</h4>

					<button
						name="display"
						id="display"
						onClick={() =>
							setSegment({
								...segment,
								on: segment.on ? false : true,
							})
						}
					>
						{segment.on ? 'segmented' : 'layered'}
					</button>
				</div>

				<div className="setting theme">
					<div>
						<h4>Theme</h4>
					</div>
					<div
						className="theme-preview"
						onClick={() => changeTheme(moreSettings.theme)}
					>
						<div className={moreSettings.theme >= 0 ? 'on' : ''}></div>
						<div className={moreSettings.theme >= 1 ? 'on' : ''}></div>
						<div className={moreSettings.theme >= 2 ? 'on' : ''}></div>
						<div className={moreSettings.theme >= 3 ? 'on' : ''}></div>
						<div className={moreSettings.theme >= 4 ? 'on' : ''}></div>
						<div className={moreSettings.theme >= 5 ? 'on' : ''}></div>
						<div className={moreSettings.theme >= 6 ? 'on' : ''}></div>
					</div>
				</div>

				{/* <div className="setting unlimited">
						<div>
							<h4>Unlimited</h4>
						</div>

						<button
							onClick={() =>
								setMoreSettings(prev => ({
									...prev,
									unlimited: moreSettings.unlimited ? false : true,
								}))
							}
						>
							{moreSettingsRef.current.unlimited ? 'on' : 'off'}
						</button>
					</div>
					
					<div className="setting debug">
						<h4>Debug button</h4>

						<button onClick={saveWork}>click</button>
					</div> */}
			</div>

			<div className="links">
				<p>📚 docs</p>

				<p>🧩 source code</p>

				<p className="pub">
					Made for your curiosity <br />
					by victr 👱🏼
				</p>
			</div>
		</div>
	)
}

Settings.propTypes = {
	moreSettings: propTypes.object.isRequired,
	segment: propTypes.object.isRequired,
	tempo: propTypes.number.isRequired,
	tempoRef: propTypes.object.isRequired,
	setSegment: propTypes.func.isRequired,
	setMoreSettings: propTypes.func.isRequired,
	changeTempo: propTypes.func.isRequired,
	restartMetronome: propTypes.func.isRequired,
	wheelUpdate: propTypes.func.isRequired,
}

export default Settings
