import ReactDOM from 'react-dom'
import App from './App'
import { applyTheme, setRandomID, importCode } from './utils'

it('Renders normally', () => {
	ReactDOM.render(<App />, document.getElementById('app-content'))
})

it('No error on bad theme index', () => {
	applyTheme(-1)
})

it('Returns a small string ID', () => {
	expect(setRandomID()).toHaveLength(8)
})

it('No error on empty import code', () => {
	importCode([])
})
