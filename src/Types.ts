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
	beats: number
	freq: {
		wave: number
		wood: number
		drum: number
	}
	type: string
	volume: number
}

export type Sounds = {
	wood: [any]
	drum: [any]
}
