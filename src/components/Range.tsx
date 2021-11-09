import useMeasure from 'react-use-measure'
import { useSpring, animated, config } from '@react-spring/web'
import { useEffect } from 'react'

function Range({ volume, muted, update }): JSX.Element {
	const [wrapRef, bounds] = useMeasure()
	const [styles, api] = useSpring(() => ({ width: 0, config: config.stiff }))

	const handleVolumeChange = (e: any) => {
		const percent = e.pageX - bounds.left
		api.start({ width: percent })
		update(percent / 100)
	}

	useEffect(() => {
		api.start({ width: volume * 100 })
		// eslint-disable-next-line
	}, [volume])

	return (
		<div
			ref={wrapRef}
			className={'range-wrap ' + (muted ? 'muted' : '')}
			onClick={e => handleVolumeChange(e)}
		>
			<animated.div className="inner-range" style={styles} />
		</div>
	)
}

export default Range
