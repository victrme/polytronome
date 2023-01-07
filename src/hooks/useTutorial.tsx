import { useState, useEffect } from 'react'
import Layer from '../types/layer'

export default function useTutorial(props: {
	layers: Layer[]
	tempo: number
	isRunning: string
	isForMobile: boolean
}) {
	const [tutoStage, setTutoStage] = useState('removed')

	useEffect(() => {
		// Change mode after following second tutorial
		if (tutoStage === 'testLaunch' && props.isRunning) setTutoStage('waitLaunch')
		if (tutoStage === 'waitLaunch' && props.isRunning === '') setTutoStage('showTempo')
	}, [props.isRunning])

	useEffect(() => {
		// Select beats for tutorial
		if (tutoStage === 'testBeats') {
			const beats = props.layers.map(x => x.beats)
			const reduced = beats.reduce((a, b) => a + b)

			if (beats.includes(5) && beats.includes(7) && reduced === 15)
				setTutoStage('testLaunch')
		}
	}, [props.layers])

	useEffect(() => {
		// Moves tempo for tutorial
		if (tutoStage.startsWith('showTempo')) {
			setTutoStage(props.isForMobile ? 'endEasy' : 'clickMenu')
		}
	}, [props.tempo])

	return [tutoStage, setTutoStage] as [string, typeof setTutoStage]
}
