import { clamp } from 'lodash'
import Tutorial from './Tutorial'
import Wheel from './Wheel'

const Header = ({ toggleMetronome, tempo, setTempo, tapTempo, tutoStage, setTutoStage }) => {
	const handleTempo = (res: number) => {
		setTempo(clamp(res + 30, 30, 300))
		toggleMetronome(true)
	}

	return (
		<div className="header">
			{tutoStage === 'removed' ? (
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
			) : (
				<Tutorial tutoStage={tutoStage} setTutoStage={setTutoStage}></Tutorial>
			)}

			<div></div>

			<div className="tempo">
				<Wheel type="tempo" state={tempo} update={res => handleTempo(res)}></Wheel>
				<button className="tap" onClick={tapTempo}>
					tap
				</button>
			</div>
		</div>
	)
}

export default Header
