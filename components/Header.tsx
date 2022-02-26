import { useTransition, config } from '@react-spring/web'

import Tutorial from './Tutorial'
import Tempo from './Tempo'

const Header = ({ tempoProps, tutoStage, setTutoStage, isForMobile }) => {
	const toggle = tutoStage !== 'removed'

	const transition = useTransition(toggle, {
		from: { scale: 0.9, opacity: 0 },
		enter: { scale: 1, opacity: 1 },
		leave: { scale: 0.9, opacity: 0 },
		reverse: toggle,
		config: config.stiff,
	})

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
			{transition(
				(styles, item) =>
					item && (
						<Tutorial
							styles={styles}
							tutoStage={tutoStage}
							setTutoStage={setTutoStage}
						></Tutorial>
					)
			)}

			<div></div>

			{isForMobile ? '' : <Tempo {...tempoProps}></Tempo>}
		</div>
	)
}

export default Header
