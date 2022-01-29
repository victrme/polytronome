import { useEffect, useState } from 'react'
import Themes from '../assets/themes.json'
import defaultLayers from '../assets/layers.json'
import { applyTheme, createExportCode, importCode } from '../utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTrail, animated } from '@react-spring/web'
import { isMobileOnly } from 'react-device-detect'

import {
	faBars,
	faPalette,
	faExpand,
	faEye,
	faHeadphones,
	faFire,
	faStar,
	faCode,
	faHandHoldingHeart,
	faComment,
	faSlidersH,
	faChalkboardTeacher,
} from '@fortawesome/free-solid-svg-icons'

const Menu = ({
	moreSettings,
	setMoreSettings,
	easy,
	setEasy,
	setImport,
	tutoStage,
	setTutoStage,
	fullscreen,
	changeFullscreen,
}) => {
	const [openedTheme, setOpenedTheme] = useState(false)
	const [extended, setExtended] = useState(false)
	const isOn = bool => (bool ? 'on' : '')

	const changeAnimations = () => {
		const appDOM = document.querySelector('.polytronome') as HTMLDivElement

		moreSettings.animations
			? appDOM.classList.remove('performance')
			: appDOM.classList.add('performance')

		setMoreSettings(prev => ({ ...prev, animations: !moreSettings.animations }))
	}

	const changeTheme = (index?: number) => {
		let nextTheme = index || 0

		if (!extended || isMobileOnly) nextTheme = (moreSettings.theme + 1) % Themes.length

		setMoreSettings(prev => ({ ...prev, theme: nextTheme }))
		localStorage.theme = nextTheme
		applyTheme(nextTheme)
	}

	const toggleMenu = () => {
		setExtended(!extended)
		setOpenedTheme(false)
	}

	const changeClickType = () =>
		setMoreSettings(prev => ({ ...prev, clickType: (moreSettings.clickType + 1) % 3 }))

	const changeOffset = () =>
		setMoreSettings(prev => ({ ...prev, offset: (moreSettings.offset + 50) % 550 }))

	const resetToDefault = () =>
		setImport(importCode(createExportCode(80, defaultLayers, moreSettings, easy)))

	const links = [
		{ url: 'https://github.com/victrme/polytronome', icon: faCode, text: 'github' },
		{ url: 'https://ko-fi.com/victr', icon: faHandHoldingHeart, text: 'donate' },
		{ url: 'mailto:mail@victr.me', icon: faComment, text: 'contact' },
	]

	const statesTexts = {
		advanced: ['on', 'off'],
		animations: ['on', 'reduced'],
		fullscreen: ['off', 'on'],
		view: ['layers', 'segment', 'block'],
	}

	const options = [
		{
			icon: faSlidersH,
			text: 'advanced mode',
			title: `toggle advanced mode\nAdds note, wave type, note time, release & volume control`,
			func: () => setEasy(!easy),
			css: isOn(!easy),
			state: statesTexts.advanced[+easy],
		},
		{
			icon: faStar,
			text: 'animations',
			title: `toggle animations\nunchecking this option will improve performances`,
			func: changeAnimations,
			css: isOn(!moreSettings.animations),
			state: statesTexts.animations[+moreSettings.animations],
		},
		{
			icon: faPalette,
			text: 'themes',
			title: 'change theme\nCycles through themes when menu is closed,\nopens theme list when menu is open',
			func: () =>
				isMobileOnly || !extended ? changeTheme() : setOpenedTheme(!openedTheme),
			css: '',
			state: Themes[moreSettings.theme].name,
		},
		{
			icon: faEye,
			text: 'click view',
			title: `change click view\nCycles through layers, segment & block`,
			func: changeClickType,
			css: '',
			state: statesTexts.view[moreSettings.clickType],
		},
		{
			icon: faExpand,
			text: 'fullscreen',
			title: 'toggle fullscreen',
			func: changeFullscreen,
			css: isOn(fullscreen),
			state: statesTexts.fullscreen[+fullscreen],
		},
		{
			icon: faHeadphones,
			text: 'sound offset',
			title: 'sound offset\nUseful for bluetooth devices with latency\n50ms increment, 500ms max',
			func: changeOffset,
			css: isOn(moreSettings.offset > 0),
			state: moreSettings.offset + 'ms',
		},
		{
			icon: faChalkboardTeacher,
			text: 'show tutorial',
			title: 'show tutorial',
			func: () => {
				setTutoStage(easy ? 'intro' : 'beatsAgain')
				if (isMobileOnly) setExtended(false)
			},
			css: '',
			state: '',
		},
		{
			icon: faFire,
			text: 'reset to default',
			title: 'reset to default',
			func: resetToDefault,
			css: '',
			state: '',
		},
	]

	const themeList = {
		off: {
			width: 0,
			opacity: 0,
		},
		on: {
			width: 60,
			opacity: 1,
		},
	}

	const [trail, api] = useTrail(Themes.length, () => ({
		...themeList.off,
		config: { mass: 0.1, friction: 8 },
	}))

	useEffect(() => {
		api.start({ ...themeList[openedTheme ? 'on' : 'off'] })
		// eslint-disable-next-line
	}, [openedTheme])

	useEffect(() => {
		if (tutoStage === 'clickMenu' && extended) setTutoStage('endEasy')
		// eslint-disable-next-line
	}, [extended])

	return (
		<div className="menu">
			<button onClick={toggleMenu}>
				<FontAwesomeIcon icon={faBars} />
				{!isMobileOnly ? <span>Menu</span> : ''}
			</button>

			<aside className={extended ? 'extended' : 'closed'}>
				<div className="inner-menu">
					{options.map(({ func, title, icon, css, text, state }) => (
						<button key={text} title={title} onClick={func} className={css}>
							<p>
								<span className="option-icon">
									<FontAwesomeIcon icon={icon} />
								</span>
								<span>{text}</span>
							</p>
							<span className="optionState">{state}</span>
						</button>
					))}

					<div className="links">
						{links.map(({ icon, text, url }) => (
							<a key={text} href={url}>
								<span className="option-icon">
									<FontAwesomeIcon icon={icon} />
								</span>
								<span>{text}</span>
							</a>
						))}
					</div>
				</div>

				<div className={'theme-list' + (openedTheme ? ' opened' : '')}>
					{trail.map((styles, i) => (
						<animated.span
							key={i}
							style={{
								...styles,
								backgroundColor: Themes[i].background,
								color: Themes[i].accent,
								visibility: styles.opacity.to(o =>
									o === 0 ? 'hidden' : 'visible'
								),
							}}
							onClick={e => {
								e.stopPropagation()
								e.nativeEvent.stopImmediatePropagation()
								changeTheme(i)
							}}
						>
							{Themes[i].name}
						</animated.span>
					))}
				</div>
			</aside>
		</div>
	)
}

export default Menu
