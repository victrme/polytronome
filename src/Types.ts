export type MoreSettings = {
	theme: number
	fullscreen: boolean
	performance: boolean
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
	type: string
	volume: number
	muted: boolean
}

export type Sounds = {
	wood: [any]
	drum: [any]
}
