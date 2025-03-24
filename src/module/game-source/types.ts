export interface MatchesByReferee {
  code: number
  message: string
  result: { battleid: string; reporttime: string }[]
}

export interface BattleResponse {
  code: number
  message: string
  dataid: number
  data: BattleData
}

export type BattleState =
  | "init"
  | "ban"
  | "pick"
  | "adjust"
  | "loading"
  | "play"
  | "end"

export interface BattleData {
  // battleid: string
  // start_time: string
  win_camp: number
  // roomname: string
  state: BattleState
  state_left_time: number
  game_time: number
  // dataid: number
  tortoise_left_time: number
  lord_left_time: number
  // kill_lord_money_advantage: number
  paused: boolean
  camp_list: Camp[]
  incre_event_list: EventList[] | null
  // rune_2023: boolean
  // banpick_paused: boolean
}

export interface Camp {
  campid: 1 | 2 | 5
  team_name: string
  score: number
  kill_lord: number
  kill_tower: number
  total_money: number
  kill_tortoise: number
  ban_hero_list: number[] | null
  player_list: Player[]
}

export interface Player {
  // roleid: number
  name: string
  campid: number
  // banning: boolean
  // picking: boolean
  ban_heroid: number
  heroid: number
  skillid: number
  gold: number
  // exp: number
  level: number
  total_hurt: number
  total_damage: number
  dead: boolean
  rune_id: number
  kill_num: number
  dead_num: number
  assist_num: number
  rune_map: any | null
  equip_list: any | null
  // ban_order: number
  // pick_order: number
}

type EventList =
  | BossEvent
  | { event_type: "any" }

export interface BossEvent {
  event_type: "kill_boss"
  campid: 1 | 2 | 5
  boss_name: "tortoise" | "lord"
  killer_name: string
  game_time: number
}

export interface PostBattleResponse {
  code: number
  message: string
  data: PostBattleData
}

export interface PostBattleData {
  battleid: string
  start_time: string
  win_camp: number
  hero_list: PostBattleHero[]
  camp_list: PostBattleCamp[]
  event_list: any[]
  game_time: number
  rune_2023: boolean
}

export interface PostBattleHero {
  campid: 1 | 2 | 5
  mvp: boolean
  name: string
  heroid: number
  total_damage: number
  total_hurt: number
  kill_num: number
  dead_num: number
  assist_num: number
  equip_list: number[]
  level: number
  total_money: number
  runeid: number
  skillid: number
  rune_map: any | null
}

export interface PostBattleCamp {
  red_buff_num: number
  blue_buff_num: number
  campid: number
  ban_hero_list: number[] | null
  kill_lord: number
  kill_totoise: number
  kill_tower: number
  total_money: number
}
