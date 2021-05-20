import propTypes from 'prop-types'

const Octaves = ({ freq }) => {
	const a = Math.floor(freq / 12)

	return (
		<div className="octave-wrap">
			<div className={'octave' + (a > 2 ? ' on' : '')}></div>
			<div className={'octave' + (a > 1 ? ' on' : '')}></div>
			<div className={'octave' + (a > 0 ? ' on' : '')}></div>
			<div className={'octave' + (a > -1 ? ' on' : '')}></div>
		</div>
	)
}

Octaves.propTypes = {
	freq: propTypes.number.isRequired,
}

export default Octaves
