import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/App.scss'

function App({ Component }: AppProps) {
	return (
		<>
			<Head>
				<title>Polytronome - train your polyrythms</title>
				<meta charSet="utf-8" />
				<meta name="theme-color" content="#EAEBEA" />

				<meta
					name="description"
					content="Polytronome helps you visualize polyrythms by layering multiple metronomes !"
				/>

				<link rel="icon" id="favicon" href="/favicon.png" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<link rel="manifest" href="/manifest.json" />

				<meta property="og:url" content="https://polytronome.com/" />
				<meta property="og:type" content="website" />
				<meta property="og:title" content="Polytronome - train your polyrythms" />
				<meta property="og:image" content="\screenshots\screen-4.webp" />
				<meta
					property="og:description"
					content="You can visualize polyrythms by layering multiple metronomes !"
				/>
			</Head>
			<Component />
		</>
	)
}

export default App
