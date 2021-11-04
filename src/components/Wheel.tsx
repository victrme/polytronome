import { useState } from 'react'
import { useSpring, animated, config } from '@react-spring/web'
import propTypes from 'prop-types'

// Wheels work by getting the index of an element with wheel height divided by children height
// Up movement uses translateY(-px), incrementing is negative, so maths are weird

const freqArr = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const fillArray = (start: number, end: number, freq?: boolean) => {
	const arr: any[] = []
	for (let i = start; i <= end; i++)
		arr.unshift(freq ? freqArr[i % freqArr.length].toString() : i.toString())
	return arr
}

// Init all wheels text before JSX Element
const allLists = {
	beats: fillArray(1, 16),
	tempo: fillArray(30, 300),
	frequency: fillArray(0, freqArr.length * 3, true),
}

// https://codesandbox.io/s/github/pmndrs/react-spring/tree/master/demo/src/sandboxes/slide

function Wheel({ update, tempo, freq, beats }): JSX.Element {
	let list: (number | string)[] = []

	if (tempo !== undefined) list = allLists.tempo
	else if (freq !== undefined) list = allLists.frequency
	else {
		list = allLists.beats
		list[list.length - 1] = '×'
	}

	const [flip, set] = useState(false)
	const { y } = useSpring({
		reset: true,
		reverse: flip,
		from: { y: 0 },
		y: (-list.length + 1) * 50,
		delay: 200,
		config: config.molasses,
		onRest: () => set(!flip),
	})

	return (
		<div className="immovable_wheel">
			<animated.div className="wheel" style={{ y }}>
				<pre>{list.join('\n')}</pre>
			</animated.div>
		</div>
	)
}

Wheel.propTypes = {
	update: propTypes.func.isRequired,
	tempo: propTypes.number,
	beats: propTypes.number,
	freq: propTypes.number,
}

export default Wheel
