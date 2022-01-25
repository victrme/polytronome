export type MoreSettings = {
	theme: number
	fullscreen: boolean
	animations: boolean
	clickType: number
	offset: number
}

export type Segment = {
	on: boolean
	ratios: number[]
}

export type Layer = {
	id: string
	beats: number
	freq: number
	release: number
	duration: boolean
	type: number
	volume: number
	muted: boolean
}

export type Sounds = {
	wood: [any]
	drum: [any]
}

export type Code = {
	easy: boolean
	tempo: number
	layers: Layer[]
	moreSettings: MoreSettings
}

//
// Tutorial

export type Interaction = {
	to: string
	text: string
}

export type Stage = {
	yes: Interaction
	no: Interaction
	text: string
}
