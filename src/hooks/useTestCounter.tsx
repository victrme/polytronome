import { useEffect, useState } from 'react'

export default function useTestCounter({ layers, tempo }) {
	const [counter, setCounter] = useState(0)

	const handleTestCounter = () => {
		setCounter(counter + 1)
	}

	useEffect(() => {
		console.log(counter)
	}, [layers, tempo])

	return [counter, handleTestCounter] as [number, () => void]
}
