import Layer from './layer'
import MoreSettings from './moreSettings'

export type Code = {
	easy: boolean
	tempo: number
	layers: Layer[]
	moreSettings: MoreSettings
}

export default Code
