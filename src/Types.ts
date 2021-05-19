export type MoreSettings = {
	theme: number
	segment: {
		on: boolean
		count: number
		ratios: number[]
		duplicates: number[]
		dupCount: number
	}
	fullscreen: boolean
	unlimited: boolean
	animations: boolean
}

export type Layer = {
	beats: number
	frequency: number
	type: string
	volume: number
}

export type Sounds = {
	wood: [any]
	drum: [any]
}
