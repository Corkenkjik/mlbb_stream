import { DataRepository } from "#repository/repository.ts"
import {
  BattleData,
  BossEvent,
  Camp,
  Player,
  PostBattleCamp,
  PostBattleData,
  PostBattleHero,
} from "./types.ts"
import { logger } from "@kinbay/logger"
import { PlayerData, TeamData } from "../repository/types.ts"
import { controllerEvents } from "#game-controller/event.ts"

export class DataPipeline {
  private events = new Map() // Deduplicate the events based on timestamp

  private getTeam = (data: BattleData) => {
    let blueTeam = {} as Camp
    let redTeam = {} as Camp

    data.camp_list.forEach((camp) => {
      if (camp.campid === 1) {
        blueTeam = camp
      } else if (camp.campid === 2) {
        redTeam = camp
      }
    })

    return { blueTeam, redTeam }
  }

  private playerDTO(data: Player, mvp = false): PlayerData {
    return {
      assist: data.assist_num,
      death: data.dead_num,
      dmgDealt: data.total_damage,
      dmgTaken: data.total_hurt,
      gold: data.gold,
      item_list: data.equip_list,
      kill: data.kill_num,
      level: data.level,
      mvp: mvp,
      pick: data.heroid,
      rune: data.rune_id,
      runeMap: data.rune_map,
      skillid: data.skillid,
    }
  }

  private playerDTO2(data: PostBattleHero, winCamp: number): PlayerData {
    return {
      assist: data.assist_num,
      death: data.dead_num,
      dmgDealt: data.total_damage,
      dmgTaken: data.total_hurt,
      gold: data.total_money,
      item_list: data.equip_list,
      kill: data.kill_num,
      level: data.level,
      mvp: data.mvp && winCamp === data.campid,
      pick: data.heroid,
      rune: data.runeid,
      runeMap: data.rune_map,
      skillid: data.skillid,
    }
  }

  private processEvents(data: BattleData) {
    // Sleep for one seconds, then prompt the alert board
    if (data.tortoise_left_time === 1) {
      setTimeout(() => {
        if (!this.events.has(data.game_time)) {
          this.events.set(data.game_time, "tortoise-spawn")
          controllerEvents.emit("tortoise-spawn", null)
        }
      }, 1000)
    }

    // first lord will spawn in 8 minute
    if (data.game_time === (8 * 60 + 5)) {
      if (!this.events.has(data.game_time)) {
        this.events.set(data.game_time, "lord-spawn")
        controllerEvents.emit("lord-spawn", null)
      }
    }

    // the second lord and so on will be the same as tortoise
    if (data.lord_left_time === 1) {
      setTimeout(() => {
        if (!this.events.has(data.game_time)) {
          this.events.set(data.game_time, "lord-spawn")
          controllerEvents.emit("lord-spawn", null)
        }
      }, 1000)
    }

    if (data.incre_event_list && data.incre_event_list.length > 0) {
      const tortoiseEvents = data.incre_event_list.filter((e) =>
        e.event_type === "kill_boss" && e.boss_name === "tortoise"
      )
      if (tortoiseEvents.length > 0) {
        const lastEvent = tortoiseEvents[tortoiseEvents.length - 1] as BossEvent
        if (!this.events.has(lastEvent.game_time)) {
          this.events.set(lastEvent.game_time, "tortoise-kill")
          controllerEvents.emit("tortoise-kill", {
            killer: lastEvent.killer_name,
          })
        }
      }
      const lordEvents = data.incre_event_list.filter((e) =>
        e.event_type === "kill_boss" && e.boss_name === "lord"
      )
      if (lordEvents.length > 0) {
        const lastEvent = lordEvents[lordEvents.length - 1] as BossEvent
        if (!this.events.has(lastEvent.game_time)) {
          this.events.set(lastEvent.game_time, "lord-kill")
          controllerEvents.emit("lord-kill", {
            killer: lastEvent.killer_name,
          })
        }
      }
    }
  }

  private banHandler(data: BattleData) {
    const { blueTeam, redTeam } = this.getTeam(data)

    DataRepository.getInstance().reducers["bans"]({
      blue: blueTeam.ban_hero_list || [],
      red: redTeam.ban_hero_list || [],
    })

    DataRepository.getInstance().reducers["phaseLeftTime"](data.state_left_time)
  }

  private pickHandler(data: BattleData) {
    const { blueTeam, redTeam } = this.getTeam(data)

    const bluePlayers: PlayerData[] = DataRepository.getInstance().setup.blue
      .players.map(
        (playerName) => {
          const player = blueTeam.player_list.find((x) => x.name === playerName)
          if (!player) {
            logger.log(
              `Cannot find player with name ${playerName}`,
              "ERROR",
              "DataPipeline.pickHandler",
            )
            throw new Error()
          }
          return this.playerDTO(player)
        },
      )

    const redPlayers: PlayerData[] = DataRepository.getInstance().setup.red
      .players.map(
        (playerName) => {
          const player = redTeam.player_list.find((x) => x.name === playerName)
          if (!player) {
            logger.log(
              `Cannot find player with name ${playerName}`,
              "ERROR",
              "DataPipeline.pickHandler",
            )
            throw new Error()
          }
          return this.playerDTO(player)
        },
      )

    DataRepository.getInstance().reducers["players"]({
      blue: bluePlayers,
      red: redPlayers,
    })

    DataRepository.getInstance().reducers["phaseLeftTime"](data.state_left_time)
  }

  private ingameHandler(data: BattleData) {
    if (data.paused) {
      return "paused"
    }

    const { blueTeam, redTeam } = this.getTeam(data)

    const blue: TeamData = {
      bans: blueTeam.ban_hero_list || [],
      blueBuff: 0,
      gold: blueTeam.total_money,
      lord: blueTeam.kill_lord,
      redBuff: 0,
      score: blueTeam.score,
      tortoise: blueTeam.kill_tortoise,
      tower: blueTeam.kill_tower,
    }

    const red: TeamData = {
      bans: redTeam.ban_hero_list || [],
      blueBuff: 0,
      gold: redTeam.total_money,
      lord: redTeam.kill_lord,
      redBuff: 0,
      score: redTeam.score,
      tortoise: redTeam.kill_tortoise,
      tower: redTeam.kill_tower,
    }

    DataRepository.getInstance().reducers["teams"]({
      blue,
      red,
    })

    this.processEvents(data)

    return "play"
  }

  public process(data: BattleData) {
    DataRepository.getInstance().reducers["gameState"](data.state)

    if (data.state === "ban") {
      this.banHandler(data)
    } else if (data.state === "pick") {
      this.pickHandler(data)
    } else if (data.state === "play") {
      return this.ingameHandler(data)
    } else if (data.state === "end") {
      return "end"
    } else if (data.state === "adjust") {
      return "adjust"
    }
  }

  public processTestPing(data: BattleData) {
    const { blueTeam, redTeam } = this.getTeam(data)

    const blueTeamName = blueTeam.team_name
    const redTeamName = redTeam.team_name

    const bluePlayers = blueTeam.player_list.map((x) => x.name)
    const redPlayers = redTeam.player_list.map((x) => x.name)

    const blue = {
      name: blueTeamName,
      players: bluePlayers,
    }
    const red = {
      name: redTeamName,
      players: redPlayers,
    }

    return { blue, red }
  }

  private postGamePlayersHandler(data: PostBattleHero[], winCamp: number) {
    const bluePlayers = data.filter((x) => x.campid === 1)
    const redPlayers = data.filter((x) => x.campid === 2)

    const newBlue: PlayerData[] = DataRepository.getInstance().setup.blue
      .players.map((x) => {
        const player = bluePlayers.find((p) => p.name === x)
        if (!player) {
          logger.log(
            `Cannot find player with name ${x}`,
            "ERROR",
            "DataPipeline.postGamePlayers",
          )
          throw new Error()
        }
        return this.playerDTO2(player, winCamp)
      })

    const newRed: PlayerData[] = DataRepository.getInstance().setup.red
      .players.map((x) => {
        const player = redPlayers.find((p) => p.name === x)
        if (!player) {
          logger.log(
            `Cannot find player with name ${x}`,
            "ERROR",
            "DataPipeline.postGamePlayers",
          )
          throw new Error()
        }
        return this.playerDTO2(player, winCamp)
      })

    DataRepository.getInstance().reducers["players"]({
      blue: newBlue,
      red: newRed,
    })
  }

  private postgameTeamHandler(
    data: PostBattleCamp[],
    { blueScore, redScore }: { blueScore: number; redScore: number },
  ) {
    const blueCamp = data.find((x) => x.campid === 1)!
    const redCamp = data.find((x) => x.campid === 2)!

    const blueTeam: TeamData = {
      bans: blueCamp.ban_hero_list || [],
      blueBuff: blueCamp.blue_buff_num,
      gold: blueCamp.total_money,
      lord: blueCamp.kill_lord,
      redBuff: blueCamp.red_buff_num,
      score: blueScore,
      tortoise: blueCamp.kill_totoise,
      tower: blueCamp.kill_tower,
    }

    const redTeam: TeamData = {
      bans: redCamp.ban_hero_list || [],
      blueBuff: redCamp.blue_buff_num,
      gold: redCamp.total_money,
      lord: redCamp.kill_lord,
      redBuff: redCamp.red_buff_num,
      score: redScore,
      tortoise: redCamp.kill_totoise,
      tower: redCamp.kill_tower,
    }

    DataRepository.getInstance().reducers["teams"]({
      blue: blueTeam,
      red: redTeam,
    })
  }

  private scoreReduce(data: PostBattleData) {
    const bluePlayers = data.hero_list.filter((x) => x.campid === 1)
    const redPlayers = data.hero_list.filter((x) => x.campid === 2)

    const blueScore = bluePlayers.reduce((acc, cur) => acc + cur.kill_num, 0)
    const redScore = redPlayers.reduce((acc, cur) => acc + cur.kill_num, 0)

    return { blueScore, redScore }
  }

  public processPostgameData(data: PostBattleData) {
    const winCamp = data.win_camp
    const gameTime = data.game_time
    const { blueScore, redScore } = this.scoreReduce(data)

    DataRepository.getInstance().reducers["winCamp"](winCamp)
    DataRepository.getInstance().reducers["gameTime"](gameTime)
    this.postGamePlayersHandler(data.hero_list, winCamp)
    this.postgameTeamHandler(data.camp_list, { blueScore, redScore })
  }
}
