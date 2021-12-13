import Tempo from './Tempo'

const Header = ({ toggleMetronome, tempo, setTempo }) => {
	return (
		<div className="header">
			<div className="logo">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="61"
					height="30"
					fill="var(--accent)"
				>
					<rect width="29" height="8" y="11" rx="4" fill="var(--clicks-on)" />
					<rect width="12" height="8" rx="4" transform="matrix(1 0 0 -1 0 30)" />
					<rect
						width="12"
						height="8"
						rx="4"
						transform="matrix(1 0 0 -1 32 19)"
						fill="var(--clicks-on)"
					/>
					<rect width="29" height="8" x="32" rx="4" />
				</svg>
				<div>
					<h1>polytronome</h1>
					<p>train your polytrythms</p>
				</div>
			</div>

			<div></div>

			<Tempo toggleMetronome={toggleMetronome} tempo={tempo} setTempo={setTempo}></Tempo>
		</div>
	)
}

export default Header
