const Menu = ({}) => {
	return (
		<div className="menu">
			<svg
				className="logo"
				xmlns="http://www.w3.org/2000/svg"
				width="61"
				height="30"
				fill="#ccc"
				onClick={() => console.log('menu')}
			>
				<rect width="29" height="8" y="11" rx="4" />
				<rect width="12" height="8" rx="4" transform="matrix(1 0 0 -1 0 30)" />
				<rect width="12" height="8" rx="4" transform="matrix(1 0 0 -1 32 19)" />
				<rect width="29" height="8" x="32" rx="4" />
			</svg>

			<div className="inner">
				<div className="overlay"></div>

				<div className="setting">
					<p>theme</p>
				</div>

				<div className="setting">
					<p>show all settings</p>
				</div>

				<div className="setting">
					<p>performance mode</p>
				</div>

				<div className="setting">
					<p>fullscreen</p>
				</div>

				<p className="credit">
					<a href="#">created by victr</a>
				</p>
			</div>
		</div>
	)
}

export default Menu
