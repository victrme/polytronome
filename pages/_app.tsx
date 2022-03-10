import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/App.scss'

function App({ Component }: AppProps) {
	return (
		<>
			<Head>
				<title>Polytronome - train your polyrythms</title>
				<meta charSet="utf-8" />

				<meta
					name="description"
					content="Train your polyrythms by playing multiple metronome simultaneously"
				/>

				<meta name="theme-color" content="#EAEBEA" />

				<link rel="icon" id="favicon" href="/favicon.png" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<link rel="manifest" href="/manifest.json" />
			</Head>
			<Component />
		</>
	)
}

export default App
