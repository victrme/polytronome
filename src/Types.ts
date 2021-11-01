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
	release: boolean
	duration: boolean
	type: string
	volume: number
}

export type Sounds = {
	wood: [any]
	drum: [any]
}
