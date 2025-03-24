export interface PlayerData {
  pick: number
  gold: number
  kill: number
  death: number
  assist: number
  level: number
  // roleid: number
  skillid: number
  dmgTaken: number // total_hurt
  dmgDealt: number // total_damage
  rune: number
  runeMap: { "1": number; "2": number; "3": number }
  item_list: number[]
  mvp: boolean
}

export interface TeamData {
  bans: number[]
  score: number
  gold: number
  tortoise: number
  lord: number
  tower: number
  blueBuff: number
  redBuff: number
}

export interface ISetup {
  blue: {
    name: string
    players: string[]
  }
  red: {
    name: string
    players: string[]
  }
}

export type FieldTypes = {
  setup: ISetup
  teams: { blue: TeamData; red: TeamData }
  players: { blue: PlayerData[]; red: PlayerData[] }
  phaseLeftTime: number
}
