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

				<link
					id="android"
					rel="android-chrome-192x192"
					sizes="180x180"
					href="/android-chrome-192x192.png?v=4"
				/>

				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<link rel="manifest" href="/manifest.json" />
				<link rel="shortcut icon" id="favicon" href="/favicon.ico?v=4" />
				<link rel="mask-icon" href="/safari-pinned-tab.svg?v=4" color="#b57e7d" />
			</Head>
			<Component />
		</>
	)
}

export default App
