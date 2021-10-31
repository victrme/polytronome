import Themes from '../assets/themes.json'
import propTypes from 'prop-types'
import Button from './Button'
import { useState } from 'react'
import { applyTheme } from '../utils'

const Menu = ({ moreSettings, setMoreSettings, easy, setEasy, menuShown, menuHovered }) => {
	const [openedTheme, setOpenedTheme] = useState(false)
	const [openedSettings, setOpenedSettings] = useState(false)
	const [fullscreen, setFullscreen] = useState(false)

	const changeAnimations = () => {
		const appDOM = document.querySelector('.polytronome') as HTMLDivElement

		moreSettings.performance
			? appDOM.classList.add('performance')
			: appDOM.classList.remove('performance')

		setMoreSettings(prev => ({
			...prev,
			performance: moreSettings.performance ? false : true,
		}))
	}

	const changeFullscreen = () => {
		if (!moreSettings.fullscreen && document.fullscreenElement === null) {
			document.body!.requestFullscreen()
			setFullscreen(true)
		} else if (document.fullscreenElement !== null) {
			document.exitFullscreen()
			setFullscreen(false)
		}
	}

	const changeTheme = (index: number) => {
		applyTheme(index)
		setMoreSettings(prev => ({ ...prev, theme: index }))
		localStorage.theme = index
	}

	return (
		<div className={'menu' + (menuShown ? ' shown' : menuHovered ? ' hovered' : '')}>
			<div className={'overlay'}></div>

			<div className="inner">
				<Button
					name="show all settings"
					on={!easy}
					func={() => setEasy(!easy)}
				></Button>

				<Button
					name="performance mode"
					on={!moreSettings.performance}
					func={changeAnimations}
				></Button>

				<Button name="fullscreen" on={fullscreen} func={changeFullscreen}></Button>

				<Button
					name="themes"
					on={openedTheme}
					func={e => setOpenedTheme(!openedTheme)}
				></Button>

				<div
					className="theme-list"
					style={{
						maxHeight: openedTheme ? 80 : 0,
						paddingTop: openedTheme ? 20 : 0,
						paddingBottom: openedTheme ? 20 : 0,
						transition: 'max-height .5s, padding-top .4s',
						overflow: 'hidden',
					}}
				>
					{Themes.map((theme, i) => (
						<span
							key={i}
							style={{
								backgroundColor: theme.background,
								color: theme.accent,
								// borderTopLeftRadius: moreSettings.theme === i ? 0 : 20,
							}}
							onClick={e => {
								e.stopPropagation()
								e.nativeEvent.stopImmediatePropagation()
								changeTheme(i)
							}}
						>
							{theme.name}
						</span>
					))}
				</div>

				<Button
					name="settings"
					on={openedSettings}
					func={e => setOpenedSettings(!openedSettings)}
				></Button>

				<p className="credit">
					<a href="https://victr.me">created by victr</a>
				</p>
			</div>
		</div>
	)
}

Menu.propTypes = {
	moreSettings: propTypes.object.isRequired,
	setMoreSettings: propTypes.func.isRequired,
	easy: propTypes.bool.isRequired,
	setEasy: propTypes.func.isRequired,
	menuShown: propTypes.bool.isRequired,
	menuHovered: propTypes.bool.isRequired,
}

export default Menu
