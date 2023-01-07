import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Wheel from './Wheel'
import Range from './Range'
import Layer from '../types/layer'
import Settings from '../types/settings'

import {
	faVolumeMute,
	faVolumeUp,
	faVolumeDown,
	faVolumeOff,
} from '@fortawesome/free-solid-svg-icons'

const ordinals = ['1st', '2nd', '3rd', '4th', '5th']
const release = ['off', 'short', 'long']
const wavetypes = [
	'M 10 10 Q 20 -6 30 10 V 10 Q 40 26 50 10', // sine
	'M 10 10 L 20 2 L 40 18 L 50 10', // triangle
	'M 10 10 L 30 2 V 18 L 50 10', // sawtooth
	'M 10 2 H 30 V 18 H 50', // square
]
const durations = {
	'50': '50ms',
	'0.25': '1/4',
	'0.33': '1/3',
	'0.5': 'half',
	'0.75': '3/4',
	'0.97': 'full',
}

const Volume = props => {
	const volumeIcons = props.layer.muted
		? faVolumeMute
		: props.layer.volume < 0.2
		? faVolumeOff
		: props.layer.volume < 0.6
		? faVolumeDown
		: faVolumeUp

	return (
		<div title={'volume: ' + props.layer.volume} className="ls-volume">
			<span
				role="button"
				className="mute"
				onClick={props.muteEvent}
				tabIndex={0}
				title={`mute ${ordinals[props.i]} rythm`}
			>
				<FontAwesomeIcon icon={volumeIcons} />
			</span>
			<Range
				volume={props.layer.volume}
				muted={props.layer.muted}
				update={props.volumeEvent}
			></Range>
		</div>
	)
}

const Beats = props => (
	<div className="ls-beats">
		<Wheel
			type="beats"
			animations={props.animations}
			state={props.layer.beats}
			update={props.wheelEvent}
		></Wheel>
	</div>
)

const Notes = props => (
	<div className="ls-note">
		<div className="notes-wrap">
			<Wheel
				type="freq"
				animations={props.animations}
				state={props.layer.freq}
				update={props.wheelEvent}
			></Wheel>
			<pre className="octave">{Math.floor(props.layer.freq / 12) + 1}</pre>
		</div>
	</div>
)

const SoundType = props => (
	<button
		className="ls-type"
		title={`${ordinals[props.i]} sound type`}
		onClick={props.soundTypeEvent}
	>
		<svg type="svg" xmlns="http://www.w3.org/2000/svg" viewBox="8 0 44 20">
			<path
				d={wavetypes[props.layer.type]}
				fill="none"
				stroke="var(--accent)"
				strokeWidth="4"
				strokeLinecap="round"
			/>
		</svg>
	</button>
)

const EffectButton = props => (
	<button title={props.title} onClick={props.clickEvent}>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox={props.svg.viewBox}>
			<path
				d={props.svg.path}
				stroke="var(--accent)"
				strokeWidth="1"
				strokeLinecap="round"
				fill="none"
			/>
		</svg>
		{props.value}
	</button>
)

const Effects = props => (
	<div className="ls-effects">
		<EffectButton
			clickEvent={props.durationEvent}
			value={durations[props.layer.duration]}
			title={`${ordinals[props.i]} sound duration`}
			svg={{ path: 'M 2 2 V 6 M 2 4 H 10', viewBox: '1 1 10 6' }}
		/>

		<EffectButton
			clickEvent={props.releaseEvent}
			value={release[props.layer.release]}
			title={`${ordinals[props.i]} sound release`}
			svg={{ path: 'M 2 2 V 6 M 2 2 Q 3 6 8 6', viewBox: '1 1 8 6' }}
		/>
	</div>
)

const LayersTable = ({
	layers,
	selected,
	moreSettings,
	handleLayerUpdate,
}: {
	layers: Layer[]
	selected: number
	moreSettings: Settings
	handleLayerUpdate: (cat: string, i: number, val: number) => void
}) => {
	const { easy, animations } = moreSettings

	return (
		<div className="layers-table">
			{layers.map((layer: Layer, i: number) => (
				<div
					className={
						'ls-row' +
						(selected === i ? ' selected ' : '') +
						(layer.beats === 1 ? ' off' : '')
					}
					key={layer.id}
				>
					<Beats
						layer={layer}
						animations={animations}
						wheelEvent={(res: number) => handleLayerUpdate('beats', i, res)}
					></Beats>

					{!easy && (
						<>
							<Notes
								layer={layer}
								animations={animations}
								wheelEvent={(res: number) => handleLayerUpdate('freq', i, res)}
							></Notes>

							<SoundType
								i={i}
								layer={layer}
								soundTypeEvent={() => handleLayerUpdate('wave', i, 1)}
							></SoundType>

							<Effects
								i={i}
								layer={layer}
								releaseEvent={() => handleLayerUpdate('release', i, null)}
								durationEvent={() => {
									handleLayerUpdate('duration', i, layer.duration)
								}}
							/>

							<Volume
								i={i}
								layer={layer}
								muteEvent={() => handleLayerUpdate('mute', i, null)}
								volumeEvent={(res: number) => handleLayerUpdate('vol', i, res)}
							/>
						</>
					)}
				</div>
			))}
		</div>
	)
}

export default LayersTable
