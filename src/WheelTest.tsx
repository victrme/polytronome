import { useDrag } from 'react-use-gesture'
import { useState } from 'react'

function Wheel(): JSX.Element {

	const dom = document.querySelector('.wheel')!
	const [wheelY, setWheelY] = useState(0)

	const bind = useDrag(
		({ dragging, movement: [x, y]}) => {


			if (dragging) {
				//set({ y: y * 2 })

				dom.setAttribute('style', `transform: translateY(${y}px)`)
				setWheelY(y)

			} else {

				const height = 30
				let mod = y % height
				let toTranslate = y

				if (Math.abs(mod) >= height / 2) {
					toTranslate -= height +mod
					console.log('up')
				} else {
					toTranslate -= mod
					console.log('down')
				}

				if (toTranslate > 0) toTranslate = 0

				const number = +(Math.abs(toTranslate) / height)
				console.log(number)

				dom.setAttribute('style', `transform: translateY(${toTranslate}px); transition: transform .2s`)
				setWheelY(toTranslate)
			}
		},
		{
			axis: 'y',
			initial: () => [0, wheelY]
		}
	)

	return (
		<div className="immovable_wheel">
			<div {...bind()} className="wheel octave">
				{[-1, 0, 1, 2, 3, 4, 5, 6].map((oct, i) => (
					<div key={'octavewheel' + i}>{oct}</div>
				))}
			</div>
		</div>
	)
}

export default Wheel
