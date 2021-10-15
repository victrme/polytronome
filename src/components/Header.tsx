import Tempo from './Tempo'
import Menu from './Menu'
import { useState } from 'react'

const Header = props => {
	const [menuHovered, setMenuHovered] = useState(false)
	const [menuShown, setMenuShown] = useState(false)

	const { easy, moreSettings, setMoreSettings, setEasy, restart, tempo, setTempo } = props

	const handleMenuChange = e => setMenuHovered(e.type === 'mouseenter')

	return (
		<div className="header">
			<Menu
				easy={easy}
				setEasy={setEasy}
				menuShown={menuShown}
				menuHovered={menuHovered}
				moreSettings={moreSettings}
				setMoreSettings={setMoreSettings}
			></Menu>

			<svg
				className="logo"
				xmlns="http://www.w3.org/2000/svg"
				width="61"
				height="30"
				fill="var(--accent)"
				onMouseLeave={handleMenuChange}
				onMouseEnter={handleMenuChange}
				onClick={() => setMenuShown(!menuShown)}
			>
				<rect width="29" height="8" y="11" rx="4" />
				<rect width="12" height="8" rx="4" transform="matrix(1 0 0 -1 0 30)" />
				<rect width="12" height="8" rx="4" transform="matrix(1 0 0 -1 32 19)" />
				<rect width="29" height="8" x="32" rx="4" />
			</svg>

			<div></div>

			<Tempo restart={restart} tempo={tempo} setTempo={setTempo}></Tempo>
		</div>
	)
}

export default Header
