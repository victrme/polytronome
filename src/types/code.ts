import Layer from './layer'
import Settings from './settings'

export type Code = {
	tempo: number
	layers: Layer[]
	moreSettings: Settings
}

export default Code
