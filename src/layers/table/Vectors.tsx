// import { useState } from 'react'

function Vectors({ type, change }) {
	// const [hovered, setHovered] = useState(false)

	return (
		<div
			className="css-waves"
			// onMouseEnter={() => setHovered(true)}
			// onMouseLeave={() => setHovered(false)}
			onMouseDown={change}
		>
			<svg
				// SINE
				xmlns="http://www.w3.org/2000/svg"
				width="400"
				height="200"
				viewBox="0 0 106 53"
			>
				<path
					d="M1.254 27.124s27.149-58.251 51.774 0c24.438 55.681 51.774 0 51.774 0"
					fill="none"
					stroke="var(--accent)"
					opacity={type === 'sine' ? 1 : 0}
					strokeWidth="4"
					strokeLinecap="round"
				/>
			</svg>

			<svg
				// TRIANGLE
				xmlns="http://www.w3.org/2000/svg"
				width="400"
				height="200"
				viewBox="0 0 106.055 53.09"
			>
				<path
					d="M1.254 27.116L28.745 1.759l24.551 25.847 23.976 23.769 27.53-24.258"
					fill="none"
					stroke="var(--accent)"
					opacity={type === 'triangle' ? 1 : 0}
					strokeWidth="4"
					strokeLinecap="round"
				/>
			</svg>

			<svg
				// SAWTOOTH
				xmlns="http://www.w3.org/2000/svg"
				width="400"
				height="200"
				viewBox="0 0 106 53"
			>
				<path
					d="M1.254 27.098l51.99-25.099-.074 49.171 51.631-24.072"
					fill="none"
					stroke="var(--accent)"
					opacity={type === 'wood' ? 1 : 0}
					strokeWidth="4"
					strokeLinecap="round"
				/>
			</svg>

			<svg
				// SQUARE
				xmlns="http://www.w3.org/2000/svg"
				width="400"
				height="200"
				viewBox="0 0 105.939 53.169"
			>
				<path
					d="M1.254 1.253h51.91l-.106 50.66 51.627-.013"
					fill="none"
					stroke="var(--accent)"
					opacity={type === 'drum' ? 1 : 0}
					strokeWidth="4"
					strokeLinecap="round"
				/>
			</svg>
		</div>
	)
}

export default Vectors
