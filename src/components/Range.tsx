import { useEffect } from 'react'
import { useSpring, animated, config } from '@react-spring/web'
import { ResizeObserver } from '@juggle/resize-observer'
import useMeasure from 'react-use-measure'

function Range({ volume, muted, update }): JSX.Element {
	const [wrapRef, bounds] = useMeasure({ polyfill: ResizeObserver })
	const [styles, api] = useSpring(() => ({
		width: 0,
		config: config.stiff,
	}))

	const handleVolumeChange = (e: any) => {
		if (!muted) {
			const percent = e.pageX - bounds.left
			api.start({ width: percent })
			update(percent / 100)
		}
	}

	useEffect(() => {
		api.start({ width: muted ? 0 : volume * 100 })
		// eslint-disable-next-line
	}, [volume, muted])

	return (
		<div ref={wrapRef} className={'range-wrap'} onClick={e => handleVolumeChange(e)}>
			<animated.div className="inner-range" style={styles} />
		</div>
	)
}

export default Range
