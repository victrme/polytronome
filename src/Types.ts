export type MoreSettings = {
	theme: number
	fullscreen: boolean
	unlimited: boolean
	animations: boolean
	all: boolean
}

export type Segment = {
	on: boolean
	count: number
	ratios: number[]
	duplicates: number[]
	dupCount: number
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
