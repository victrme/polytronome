import { useEffect, useState } from 'react'

export function useTest() {
	const [state, setState] = useState(0)

	useEffect(() => {
		setState(Date.now())
	}, [])

	return state
}

export default useTest
