import { useEffect, useRef } from 'react'
import { useSpring, animated, config } from '@react-spring/web'

function Range({ volume, muted, update }): JSX.Element {
	const rangeWrap = useRef<HTMLDivElement>(null)

	const [styles, api] = useSpring(() => ({
		width: 0,
		config: config.stiff,
	}))

	const handleVolumeChange = (e: any) => {
		if (!muted && rangeWrap.current) {
			const wrap = rangeWrap.current
			const percent = e.pageX - wrap.getBoundingClientRect().x

			api.start({ width: percent })
			update(percent / 100)
		}
	}

	useEffect(() => {
		api.start({ width: volume * 100 })
		// eslint-disable-next-line
	}, [volume, muted])

	return (
		<div
			ref={rangeWrap}
			className={'range-wrap' + (muted ? ' muted' : '')}
			onClick={e => handleVolumeChange(e)}
		>
			<animated.div className="inner-range" style={styles} />
		</div>
	)
}

export default Range
