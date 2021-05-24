const Button = ({ name, on, func }) => {
	return (
		<button name={name} onClick={func} className={on ? 'on' : ''}>
			{name}
		</button>
	)
}

export default Button
