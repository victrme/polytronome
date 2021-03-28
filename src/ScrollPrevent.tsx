import { isMacOs } from 'react-device-detect'

function scrollPrevent(no: boolean) {
	const app = document.querySelector('.App')! as HTMLDivElement
	document.body.style.overflow = no ? 'hidden' : 'auto'

	if (no) {
		app.style.paddingRight = isMacOs ? '0' : '17px'
		app.style.transition = 'all 0s'
	} else {
		app.style.paddingRight = '0'
		app.style.transition = 'all 0s'
	}

	// oh oh something is wrong
	// too much call somehow
	console.log('mac: ', isMacOs)
}

export default scrollPrevent
