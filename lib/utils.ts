export const tempoList = [
	30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 63, 66, 69, 72, 76, 80, 84,
	88, 92, 96, 100, 104, 108, 112, 116, 120, 126, 132, 138, 144, 152, 160, 168, 176, 184, 192,
	200, 208, 216, 224, 232, 240, 252,
]

export const setRandomID = () => {
	let str = ''
	while (str.length < 8) str += String.fromCharCode(Math.random() * (122 - 97) + 97)
	return str
}
