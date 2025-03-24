import { FieldTypes } from "../repository/types.ts"
import { BattleState } from "../game-source/types.ts"

export interface BlockIds {
  banpick: string
  waiting: string
  ingame: string
  postgame: string
  clock: string
  mvp: string
}

// This represent all the events registries that a plugin listening to
export type EventRegistries = {
  state: BattleState[]
  data: (keyof FieldTypes)[]
}

// This represent a single event registries that matches
export type EventRegistry = { state: BattleState; data: keyof FieldTypes }

export interface Inputs {
  input: InputItem[]
}

interface InputItem {
  key: string
  title: string
  text?: TextItem[]
  image?: ImageItem | ImageItem[]
  [key: string]: any
}

interface TextItem {
  index: string
  name: string
  [key: string]: any
}

interface ImageItem {
  index: string
  name: string
}
