import Themes from '../assets/themes.json'
import propTypes from 'prop-types'
import Button from './Button'

const Settings = ({ moreSettings, segment, setSegment, setMoreSettings, easy, setEasy }) => {
	const changeAnimations = () => {
		const appDOM = document.querySelector('.polytronome') as HTMLDivElement

		moreSettings.animations
			? appDOM.classList.add('performance')
			: appDOM.classList.remove('performance')

		setMoreSettings(prev => ({
			...prev,
			animations: moreSettings.animations ? false : true,
		}))
	}

	const changeFullscreen = () => {
		if (moreSettings.fullscreen && document.fullscreenElement === null) {
			const wrap = document.querySelector('.settings-wrap') as HTMLDivElement
			document.querySelector('.polytronome')!.requestFullscreen()
			wrap.style.overflowY = 'auto'
		} else if (document.fullscreenElement !== null) {
			document.exitFullscreen()
		}

		setMoreSettings(prev => ({
			...prev,
			fullscreen: moreSettings.fullscreen,
		}))
	}

	const changeTheme = () => {
		const newTheme = (moreSettings.theme + 1) % Themes.length
		const root = document.querySelector(':root')! as HTMLBodyElement

		root.style.setProperty('--background', Themes[newTheme].background)
		root.style.setProperty('--accent', Themes[newTheme].accent)
		root.style.setProperty('--dim', Themes[newTheme].dim)
		root.style.setProperty('--dimmer', Themes[newTheme].dimmer)
		root.style.setProperty('--buttons', Themes[newTheme].buttons || Themes[newTheme].dim)

		setMoreSettings(prev => ({ ...prev, theme: newTheme }))
		localStorage.theme = newTheme
	}

	const changeSegment = () => {
		setSegment({
			...segment,
			on: !segment.on,
		})
	}

	return (
		<div className="more-settings">
			<Button name="all settings" on={!easy} func={() => setEasy(!easy)}></Button>

			<Button
				name="animations"
				on={moreSettings.animations}
				func={changeAnimations}
			></Button>

			<Button name="themes" on={false} func={changeTheme}></Button>

			<Button
				name="fullscreen"
				on={moreSettings.fullscreen}
				func={changeFullscreen}
			></Button>

			<Button name="segmented" on={segment.on} func={changeSegment}></Button>
		</div>
	)
}

Settings.propTypes = {
	moreSettings: propTypes.object.isRequired,
	segment: propTypes.object.isRequired,
	setSegment: propTypes.func.isRequired,
	setMoreSettings: propTypes.func.isRequired,
	easy: propTypes.bool.isRequired,
	setEasy: propTypes.func.isRequired,
}

export default Settings
