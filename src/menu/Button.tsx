const Button = ({ name, on, func }) => {
	console.log(on)
	return (
		<button name={name} onClick={func} className={on ? 'on' : ''}>
			{name}
		</button>
	)
}

export default Button
