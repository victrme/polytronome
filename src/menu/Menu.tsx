import Themes from '../assets/themes.json'
import propTypes from 'prop-types'
import Button from './Button'
import { useState } from 'react'

const Menu = ({ moreSettings, segment, setSegment, setMoreSettings, easy, setEasy }) => {
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
		if (!moreSettings.fullscreen && document.fullscreenElement === null) {
			document.body!.requestFullscreen()
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

	const [menuShown, setMenuShown] = useState(false)

	return (
		<div className={'menu ' + (menuShown ? 'shown' : '')}>
			<svg
				className="logo"
				xmlns="http://www.w3.org/2000/svg"
				width="61"
				height="30"
				fill={Themes[moreSettings.theme].accent}
				onClick={() => setMenuShown(!menuShown)}
			>
				<rect width="29" height="8" y="11" rx="4" />
				<rect width="12" height="8" rx="4" transform="matrix(1 0 0 -1 0 30)" />
				<rect width="12" height="8" rx="4" transform="matrix(1 0 0 -1 32 19)" />
				<rect width="29" height="8" x="32" rx="4" />
			</svg>

			<div className="inner">
				<div className="overlay"></div>

				<Button name="theme" on={true} func={changeTheme}></Button>

				<Button
					name="show all settings"
					on={!easy}
					func={() => setEasy(!easy)}
				></Button>

				<Button
					name="performance mode"
					on={!moreSettings.animations}
					func={changeAnimations}
				></Button>

				<Button
					name="fullscreen"
					on={moreSettings.fullscreen}
					func={changeFullscreen}
				></Button>

				<Button name="segmented clicks" on={segment.on} func={changeSegment}></Button>

				<p className="credit">
					<a href="https://victr.me">created by victr</a>
				</p>
			</div>
		</div>
	)
}

Menu.propTypes = {
	moreSettings: propTypes.object.isRequired,
	segment: propTypes.object.isRequired,
	setSegment: propTypes.func.isRequired,
	setMoreSettings: propTypes.func.isRequired,
	easy: propTypes.bool.isRequired,
	setEasy: propTypes.func.isRequired,
}

export default Menu
