import { useEffect, useState } from 'react'
import { useDrag } from '@use-gesture/react'
import Themes from '../assets/themes.json'
import defaultLayers from '../assets/layers.json'
import { animated, useSpring, config } from '@react-spring/web'
import { applyTheme, createExportCode, importCode } from '../utils'

const Menu = ({
	moreSettings,
	setMoreSettings,
	easy,
	setEasy,
	setImport,
	mainSpring,
	mainBounds,
}) => {
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

	const changeClickType = () => {
		setMoreSettings(prev => ({ ...prev, clickType: (moreSettings.clickType + 1) % 3 }))
	}

	const changeOffset = () => {
		setMoreSettings(prev => ({ ...prev, offset: (moreSettings.offset + 50) % 500 }))
	}

	const resetToDefault = () => {
		setImport(importCode(createExportCode(80, defaultLayers, moreSettings, easy)))
	}

	useEffect(() => {
		const keymappings = e => (e.code === 'KeyF' ? changeFullscreen() : '')
		const cleanupEvents = () => window.removeEventListener('keypress', keymappings)

		window.addEventListener('keypress', keymappings)
		return cleanupEvents
	}, [])

	// eslint-disable-next-line
	const springProps = { x: 0, y: 0, config: config.stiff }
	const [menuStyles, menuSpring] = useSpring(() => springProps)

	const menuSize = 360
	const padding = 60

	const moveElements = (moves: number[]) => {
		menuSpring.start({ x: moves[0] })
		mainSpring.start({ x: moves[1] })
	}

	// Ugly session storage to always save main left position
	// EXCEPT when App redraws main while menu is open
	// (because main left would be set to 420px or menuSize + padding)
	useEffect(() => {
		if (mainBounds.left !== menuSize + padding) sessionStorage.leftBound = mainBounds.left
	}, [mainBounds])

	const drag = useDrag(
		({ active, offset: [ox], tap }) => {
			// Moves main and menu together

			// sets offsets between main and menu
			const left = sessionStorage.leftBound || 0
			const dragMainOffest = Math.max(0, ox + padding - left)
			const clickMainOffset = Math.max(0, menuSize + padding - left)

			// moves on drag
			moveElements([ox, dragMainOffest < 0 ? 0 : dragMainOffest])

			// release drag, finds rest position
			if (!active) moveElements(ox > menuSize / 2 ? [menuSize, clickMainOffset] : [0, 0])

			// clicking dragbar, === 0 is click to open
			if (tap)
				moveElements(menuStyles.x.get() === 0 ? [menuSize, clickMainOffset] : [0, 0])
		},
		{
			axis: 'x',
			rubberband: 0.1,
			filterTaps: true,
			bounds: { left: 0, right: menuSize },
		}
	)

	return (
		<div>
			<animated.aside style={{ x: menuStyles.x }}>
				<div className="menu">
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

					<button onClick={changeClickType}>
						<span>click view</span>
						<span className="optionState">
							{moreSettings.clickType === 0
								? 'layers'
								: moreSettings.clickType === 1
								? 'segment'
								: 'block'}
						</span>
					</button>

					{/* <button
					className="clickview"
					onClick={() =>
						setSegment(prev => ({
							...prev,
							on: !prev.on,
						}))
					}
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 3.5">
						<path
							d={
								segment.on
									? 'M1 1.75 1.5 1.75M2.5 1.75 4 1.75M5 1.75 6 1.75'
									: 'M1 1 2 1M3 1 4 1M5 1 6 1M1 2.5 3 2.5M4 2.5 6 2.5'
							}
							stroke="var(--accent)"
							strokeWidth="1"
							strokeLinecap="round"
							fill="none"
						/>
					</svg>
					click view
				</button> */}

					<button onClick={changeFullscreen}>
						<span>fullscreen</span>
						<span className="optionState">{fullscreen ? 'on' : 'off'}</span>
					</button>

					<button onClick={changeOffset}>
						<span>sound offset</span>
						<span className="optionState">{moreSettings.offset}ms</span>
					</button>

					<button onClick={resetToDefault}>
						<span>reset to default</span>
					</button>
				</div>

				<div className="links">
					<a href="https://polytronome.com/docs">documentation</a>
					<a href="https://github.com/victrme/polytronome">github</a>
					<a href="https://ko-fi.com/victr">donate</a>
					<a href="mailto:mail@victr.me">contact</a>
				</div>
			</animated.aside>

			<animated.div {...drag()} className="settings-drag" style={{ x: menuStyles.x }}>
				<span></span>
			</animated.div>
		</div>
	)
}

export default Menu
