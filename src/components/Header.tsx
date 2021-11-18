import Tempo from './Tempo'

const Header = props => {
	const { moreSettings, restart, tempo, setTempo } = props

	return (
		<div className="header">
			<svg
				className="logo"
				xmlns="http://www.w3.org/2000/svg"
				width="61"
				height="30"
				fill="var(--accent)"
			>
				<rect width="29" height="8" y="11" rx="4" />
				<rect width="12" height="8" rx="4" transform="matrix(1 0 0 -1 0 30)" />
				<rect width="12" height="8" rx="4" transform="matrix(1 0 0 -1 32 19)" />
				<rect width="29" height="8" x="32" rx="4" />
			</svg>

			<div></div>

			<Tempo
				restart={restart}
				tempo={tempo}
				setTempo={setTempo}
				perfMode={moreSettings.performance}
			></Tempo>
		</div>
	)
}

export default Header
