import { DataRepository } from "#repository/repository.ts"
import {
  BattleData,
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
      rune: data.rune,
      runeMap: data.rune_map,
      skillid: data.skillid,
    }
  }

  private processEvents(data: BattleData) {
    // Sleep for one seconds, then prompt the alert board
    if (data.tortoise_left_time === 1) {
      setTimeout(() => {
        controllerEvents.emit("tortoise-spawn", null)
      }, 1000)
    }

    // first lord will spawn in 8 minute
    if (data.game_time === 8 * 60) {
      controllerEvents.emit("lord-spawn", null)
    }

    // the second lord and so on will be the same as tortoise
    if (data.lord_left_time === 1) {
      setTimeout(() => {
        controllerEvents.emit("lord-spawn", null)
      }, 1000)
    }

    // TODO: add logic to handle rùa, lord
    const killTortoise = data.incre_event_list.findLast((e) =>
      e.event_type === "kill_tortoise"
    )
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

  private postgameTeamHandler(data: PostBattleCamp[]) {
    const blueCamp = data.find((x) => x.campid === 1)!
    const redCamp = data.find((x) => x.campid === 2)!

    const blueScore = DataRepository.getInstance().teams.blue.score
    const redScore = DataRepository.getInstance().teams.red.score

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

  public processPostgameData(data: PostBattleData) {
    const winCamp = data.win_camp
    DataRepository.getInstance().reducers["winCamp"](winCamp)
    this.postGamePlayersHandler(data.hero_list, winCamp)
    this.postgameTeamHandler(data.camp_list)
  }
}
