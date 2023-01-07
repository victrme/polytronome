export type Interaction = {
	to: string
	text: string
}

export type Stage = {
	yes: Interaction
	no: Interaction
	text: string
}
