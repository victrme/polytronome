import Themes from '../assets/themes.json'
import propTypes from 'prop-types'
import Button from './Button'
import { useEffect, useState } from 'react'

const Menu = ({ moreSettings, setMoreSettings, easy, setEasy, menuShown, menuHovered }) => {
	const [openedTheme, setOpenedTheme] = useState(false)
	const [fullscreen, setFullscreen] = useState(false)

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
			setFullscreen(true)
		} else if (document.fullscreenElement !== null) {
			document.exitFullscreen()
			setFullscreen(false)
		}
	}

	const applyTheme = (index: number) => {
		const root = document.querySelector(':root')! as HTMLBodyElement
		Object.entries(Themes[index]).forEach(([key, val]) =>
			val !== undefined ? root.style.setProperty('--' + key, val) : ''
		)
	}

	const changeTheme = (index: number) => {
		applyTheme(index)
		setMoreSettings(prev => ({ ...prev, theme: index }))
		localStorage.theme = index
	}

	useEffect(() => {
		applyTheme(moreSettings.theme)
	}, [])

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
					on={!moreSettings.animations}
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
						maxHeight: openedTheme ? 90 : 0,
						transition: 'max-height .5s',
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