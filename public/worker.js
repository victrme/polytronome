
// const recursivetimeout = (delay) => {

//     const timeout = setTimeout(() => {
//         postMessage(timeout)
//         recursivetimeout(delay)
//     }, delay)
// }

// onmessage = function (e) {
//     recursivetimeout(e.data)
// }









// let monworker: Worker

	// function changeWorkerTest(which: 'start' | 'stop') {
	// 	if (which === 'start') {
	// 		monworker = new Worker(`${process.env.PUBLIC_URL}/worker.js`)
	// 		monworker.postMessage(calculateTempoMs(4, metronome.tempo))

	// 		monworker.onmessage = function (e) {
	// 			console.log('timeoutID: ', e.data)
	// 		}
	// 	}

	// 	if (which === 'stop' && monworker !== undefined) {
	// 		monworker.terminate()
	// 	}
	// }