interface ButtonProps {
	style?: Object
	name: string
	func: any
	on: boolean
}

const Button = ({ name, func, on, style }: ButtonProps) => {
	return (
		<button style={style} name={name} onClick={func} className={on ? 'on' : ''}>
			{name}
		</button>
	)
}

export default Button
