import { useState } from 'react'
import Themes from '../assets/themes.json'
import defaultLayers from '../assets/layers.json'
import { applyTheme, createExportCode, importCode } from '../utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
	faBars,
	faPalette,
	faExpand,
	faEye,
	faHeadphones,
	faFire,
	faStar,
	faBookOpen,
	faCode,
	faHandHoldingHeart,
	faComment,
	faSlidersH,
	faChalkboardTeacher,
} from '@fortawesome/free-solid-svg-icons'

const Menu = ({ moreSettings, setMoreSettings, easy, setEasy, setImport, setTutoStage }) => {
	const [openedTheme, setOpenedTheme] = useState(false)
	const [fullscreen, setFullscreen] = useState(false)
	const [extended, setExtended] = useState(false)
	const isOn = bool => (bool ? 'on' : '')

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

	const changeTheme = (index?: number) => {
		let nextTheme = index || 0

		if (!extended) nextTheme = (moreSettings.theme + 1) % Themes.length

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

	// useEffect(() => {
	// 	const keymappings = e => (e.code === 'KeyF' ? changeFullscreen() : '')
	// 	const cleanupEvents = () => window.removeEventListener('keypress', keymappings)

	// 	window.addEventListener('keypress', keymappings)
	// 	return cleanupEvents
	// }, [])

	const links = [
		{ url: 'https://polytronome.com/docs', icon: faBookOpen, text: 'documentation' },
		{ url: 'https://github.com/victrme/polytronome', icon: faCode, text: 'github' },
		{ url: 'https://ko-fi.com/victr', icon: faHandHoldingHeart, text: 'donate' },
		{ url: 'mailto:mail@victr.me', icon: faComment, text: 'contact' },
	]

	const texts = {
		advanced: ['on', 'off'],
		animations: ['off', 'on'],
		fullscreen: ['off', 'on'],
		view: ['layers', 'segment', 'block'],
	}

	const options = [
		{
			icon: faPalette,
			text: 'themes',
			title: 'change theme\nCycles through themes when menu is closed,\nopens theme list when menu is open',
			func: () => (extended ? setOpenedTheme(!openedTheme) : changeTheme()),
			css: '',
			state: Themes[moreSettings.theme].name,
		},
		{
			icon: faSlidersH,
			text: 'advanced mode',
			title: `toggle advanced mode\nAdds note, wave type, note time, release & volume control`,
			func: () => setEasy(!easy),
			css: isOn(!easy),
			state: texts.advanced[+easy],
		},
		{
			icon: faStar,
			text: 'animations',
			title: `toggle animations\nunchecking this option will improve performances`,
			func: changeAnimations,
			css: isOn(moreSettings.performance),
			state: texts.advanced[+moreSettings.performance],
		},
		{
			icon: faEye,
			text: 'click view',
			title: `change click view\nCycles through layers, segment & block`,
			func: changeClickType,
			css: '',
			state: texts.view[moreSettings.clickType],
		},
		{
			icon: faExpand,
			text: 'fullscreen',
			title: 'toggle fullscreen',
			func: changeFullscreen,
			css: isOn(fullscreen),
			state: texts.fullscreen[+fullscreen],
		},
		{
			icon: faHeadphones,
			text: 'sound offset',
			title: 'sound offset\nUseful for bluetooth devices with latency\n50ms increment, 500ms max',
			func: changeOffset,
			css: '',
			state: moreSettings.offset + 'ms',
		},
		{
			icon: faChalkboardTeacher,
			text: 'show tutorial',
			title: 'show tutorial',
			func: () => setTutoStage('intro'),
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

	return (
		<div className="menu">
			<button onClick={toggleMenu}>
				<FontAwesomeIcon icon={faBars} />
				<span>Menu</span>
			</button>

			<aside className={extended ? 'extended' : 'closed'}>
				<div className="inner-menu">
					{options.map(({ func, title, icon, css, text, state }) => (
						<button key={text} title={title} onClick={func} className={css}>
							<p>
								<span>
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
								<span>
									<FontAwesomeIcon icon={icon} />
								</span>
								<span>{text}</span>
							</a>
						))}
					</div>
				</div>

				<div className={'theme-list' + (openedTheme ? ' opened' : '')}>
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
			</aside>
		</div>
	)
}

export default Menu
