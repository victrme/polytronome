const moreSettings = ({ state, change }) => {
	return (
		<div className="setting">
			<h3>Click Sound</h3>

			<label htmlFor="wavetype">
				<span>Waveform</span>
				<select
					id="wavetype"
					name="wavetype"
					value={state.type}
					onChange={e => change(e, 'type')}
				>
					<option value="sine">sine</option>
					<option value="square">square</option>
					<option value="triangle">triangle</option>
					<option value="sawtooth">sawtooth</option>
				</select>
			</label>
			<label htmlFor="attack-range">
				<span>Attack</span>
				<input
					type="range"
					name="attack-range"
					key={'attack-range'}
					min="0"
					max=".1"
					step="0.01"
					value={state.attack}
					onChange={e => change(e, 'attack')}
				/>
			</label>
			<label htmlFor="release-range">
				<span>Release</span>
				<input
					type="range"
					name="release-range"
					key={'release-range'}
					min="0"
					max="1"
					step="0.01"
					value={state.release}
					onChange={e => change(e, 'release')}
				/>
			</label>
			<label htmlFor="volume-range">
				<span>volume</span>
				<input
					type="range"
					name="volume-range"
					key={'volume-range'}
					min="0.01"
					max="1"
					step="0.01"
					value={state.volume}
					onChange={e => change(e, 'volume')}
				/>
			</label>
		</div>
	)
}

export default moreSettings
