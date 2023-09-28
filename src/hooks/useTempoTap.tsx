import { useState, useRef } from 'react'
import clamp from 'lodash/clamp'
import mean from 'lodash/mean'

import { tempoList } from '../lib/utils'

import { Tap } from '../types/options'

export default function useTempoTap(): [number, Function] {
	const [tempo, setTempo] = useState(0)
	const [tap, setTap] = useState<Tap>([{ date: Date.now(), wait: 0 }])
	const tapRef = useRef(tap)
	tapRef.current = tap

	const now = Date.now()
	const taps = [...tapRef.current]

	function action() {
		// Reset tap after 2s
		if (now - taps[0].date > 2000) {
			setTap([{ date: now, wait: 0 }])
		} else {
			// Adds current
			taps.unshift({ date: now, wait: now - tapRef.current[0].date })

			// if theres still default or too long, removes
			if (taps[1].wait === 0 || taps.length > 6) taps.pop()

			// Array of taps in milliseconds, transform to BPM
			const tappedMs: number[] = taps.map(tap => tap.wait)
			const averageBPM = clamp(Math.floor(60000 / mean(tappedMs)), 30, 252)

			// Stops index search to nearest BPM in list
			let closestIndex = 0
			while (tempoList[closestIndex] < averageBPM) closestIndex++

			// Saves
			setTap(taps)
			setTempo(closestIndex)
		}
	}

	return [tempo, action]
}
