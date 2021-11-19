import Themes from '../assets/themes.json'
import propTypes from 'prop-types'
import { useState } from 'react'
import { applyTheme } from '../utils'

interface ButtonProps {
	style?: Object
	name: string
	func: any
	state: boolean
}

const Button = ({ name, func, state, style }: ButtonProps) => {
	return (
		<button style={style} name={name} onClick={func}>
			<span>{name}</span>
			<span className="optionState">{state.toString()}</span>
		</button>
	)
}

const Menu = ({ moreSettings, setMoreSettings, easy, setEasy }) => {
	const [openedTheme, setOpenedTheme] = useState(false)
	const [fullscreen, setFullscreen] = useState(false)
	// const [menuShown, setMenuShown] = useState(false)

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

	// const handleMenu = () => {
	// 	if (menuShown) setOpenedTheme(false)
	// 	setMenuShown(!menuShown)
	// }

	return (
		<aside>
			{/* <button onClick={handleMenu}>menu</button> */}

			{/* <div className={'menu' + (menuShown ? ' shown' : '')}> */}
			<div className="menu shown">
				<Button name="advanced mode" state={!easy} func={() => setEasy(!easy)}></Button>

				<Button
					name="animations"
					state={!moreSettings.performance}
					func={changeAnimations}
				></Button>

				<Button name="fullscreen" state={fullscreen} func={changeFullscreen}></Button>

				<Button
					name="themes"
					state={moreSettings.theme}
					func={e => setOpenedTheme(!openedTheme)}
				></Button>

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
					name="sound offset"
					state={true}
					func={e => {
						console.log(e)
					}}
				></Button>
			</div>
		</aside>
	)
}

Menu.propTypes = {
	moreSettings: propTypes.object.isRequired,
	setMoreSettings: propTypes.func.isRequired,
	easy: propTypes.bool.isRequired,
	setEasy: propTypes.func.isRequired,
}

export default Menu
