import { isMacOs } from 'react-device-detect'

function scrollPrevent(no: boolean) {
	const app = document.querySelector('.App')! as HTMLDivElement
	document.body.style.overflow = no ? 'hidden' : 'auto'

	if (no) {
		app.style.paddingRight = isMacOs ? '0' : '17px'
		app.style.transition = 'all 1s cubic-bezier(0.19, 1, 0.22, 1) padding 0s'
	} else {
		app.style.paddingRight = '0'
		app.style.transition = 'all 1s cubic-bezier(0.19, 1, 0.22, 1) padding 0s'
	}
}

export default scrollPrevent
