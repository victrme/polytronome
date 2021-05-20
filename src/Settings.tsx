import Tempo from './Tempo'
import propTypes from 'prop-types'

const Settings = ({
	moreSettings,
	segment,
	tempo,
	tempoRef,
	setSegment,
	changeFullscreen,
	changeTempo,
	changeAnimations,
	changeTheme,
	restartMetronome,
	wheelUpdate,
}) => {
	return (
		<div className="settings-wrap">
			<Tempo
				restart={restartMetronome}
				update={changeTempo}
				wheelUpdate={wheelUpdate}
				tempo={tempo}
				tempoRef={tempoRef}
			></Tempo>

			<div className="other-settings">
				<h3>Display</h3>
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
				<h3>Links</h3>
				<div>
					<a href="#docs">documentation</a>
					<br />
					<a href="https://github.com/victorazevedo-me/polytronome">source code</a>
					<br />
					<span>Arranged by </span>
					<a href="https://victr.me/">victor azevedo</a>
				</div>

				<div></div>
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
	changeFullscreen: propTypes.func.isRequired,
	changeTempo: propTypes.func.isRequired,
	changeAnimations: propTypes.func.isRequired,
	changeTheme: propTypes.func.isRequired,
	restartMetronome: propTypes.func.isRequired,
	wheelUpdate: propTypes.func.isRequired,
}

export default Settings
