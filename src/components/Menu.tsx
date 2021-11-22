import Themes from '../assets/themes.json'
import { useState } from 'react'
import { applyTheme } from '../utils'
import { animated } from '@react-spring/web'

const Menu = ({ moreSettings, setMoreSettings, easy, setEasy, dragX }) => {
	const [openedTheme, setOpenedTheme] = useState(false)
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
		<animated.aside style={{ x: dragX }}>
			<div className="menu">
				<button onClick={() => setEasy(!easy)}>
					<span>advanced mode</span>
					<span className="optionState">{easy ? 'off' : 'on'}</span>
				</button>

				<button onClick={changeAnimations}>
					<span>animations</span>
					<span className="optionState">
						{moreSettings.performance ? 'on' : 'off'}
					</span>
				</button>

				<button onClick={changeFullscreen}>
					<span>fullscreen</span>
					<span className="optionState">{fullscreen ? 'on' : 'off'}</span>
				</button>

				<button onClick={e => console.log(e)}>
					<span>sound offset</span>
					<span className="optionState">soon</span>
				</button>

				<button onClick={e => setOpenedTheme(!openedTheme)}>
					<span>themes</span>
					<span className="optionState">{Themes[moreSettings.theme].name}</span>
				</button>

				<div
					className="theme-list"
					style={{
						maxHeight: openedTheme ? 100 : 0,
						paddingTop: openedTheme ? 20 : 0,
						paddingBottom: openedTheme ? 20 : 0,
						transition: 'max-height .5s, padding .4s',
						overflow: 'hidden',
					}}
				>
					{Themes.map((theme, i) => (
						<span
							key={i}
							style={{
								backgroundColor: theme.background,
								color: theme.accent,
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
			</div>

			<div className="links">
				<a href="https://polytronome.com/docs">documentation</a>
				<a href="https://github.com/victrme/polytronome">github</a>
				<a href="https://ko-fi.com/victr">donate</a>
				<a href="mailto:mail@victr.me">contact</a>
			</div>
		</animated.aside>
	)
}

export default Menu
