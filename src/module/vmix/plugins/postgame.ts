import { DataRepository } from "#repository/repository.ts"
import { PlayerData, TeamData } from "#repository/types.ts"
import { formatSeconds } from "#lib/fmt.ts"
import { EventRegistries, EventRegistry } from "../types.ts"
import { VmixPlugin } from "./base-plugin.ts"

export class PostGamePlugin extends VmixPlugin {
  override eventsRegistered: EventRegistries = {
    state: ["init", "end"],
    data: ["players", "teams"],
  }

  /**
   * Only update player's item since they are varied
   * the rest stats will be override
   */
  private resetPlayers() {
    const urls = Array(10).fill(0).map((_, index) => {
      const pos = index + 1 < 6 ? index + 1 : index + 1 - 5
      const side = index + 1 < 6 ? "x" : "d"

      const items = Array(6).fill(0).map((_, itemIndex) => {
        return this.createImageUrl({
          type: "item",
          value: 0,
          blockName: `p${pos}${side}item${itemIndex + 1}`,
        })
      })

      return items
    }).flatMap((x) => x)
    return urls
  }

  private createPlayersUrls() {
    const bluePlayers = DataRepository.getInstance().players.blue
    const redPlayers = DataRepository.getInstance().players.red

    const createUrls = (players: PlayerData[], side: "x" | "d") => {
      const names = side === "x"
        ? DataRepository.getInstance().setup.blue.players
        : DataRepository.getInstance().setup.red.players

      return players.map((player, index) => {
        const pos = index + 1
        const playerItems = player.item_list.map((item, itemIndex) => {
          return this.createImageUrl({
            type: "item",
            value: item,
            blockName: `p${pos}${side}item${itemIndex + 1}`,
          })
        })

        return [
          ...playerItems,
          this.createTextUrl({
            value: names[index],
            blockName: `p${pos}${side}name`,
          }),
          this.createTextUrl({
            value: "" + player.kill,
            blockName: `p${pos}${side}kill`,
          }),
          this.createTextUrl({
            value: "" + player.death,
            blockName: `p${pos}${side}death`,
          }),
          this.createTextUrl({
            value: "" + player.assist,
            blockName: `p${pos}${side}assist`,
          }),
          this.createTextUrl({
            value: "" + player.level,
            blockName: `p${pos}${side}level`,
          }),
          this.createTextUrl({
            value: "" + player.gold,
            blockName: `p${pos}${side}gold`,
          }),
          this.createImageUrl({
            type: "champ-end",
            value: player.pick,
            blockName: `p${pos}${side}hero`,
          }),
          this.createImageUrl({
            type: "player",
            value: side === "x" ? pos : pos + 5,
            blockName: `p${pos}${side}`,
          }),
          this.createImageUrl({
            type: "rune",
            value: player.runeMap["3"] || 0,
            blockName: `p${pos}${side}ngoc`,
          }),
        ]
      }).flatMap((x) => x)
    }

    const blue = createUrls(bluePlayers, "x")
    const red = createUrls(redPlayers, "d")

    return [...blue, ...red]
  }

  /**
   * Don't need to reset team postgame stats,
   * since they are always be overwritten
   */
  private createTeamUrls() {
    const blueTeam = DataRepository.getInstance().teams.blue
    const redTeam = DataRepository.getInstance().teams.red

    const createUrl = (data: TeamData, side: "xanh" | "do") => {
      return [
        this.createTextUrl({
          value: "" + data.score,
          blockName: `tiso${side}`,
        }),
        this.createTextUrl({
          value: "" + data.gold,
          blockName: `gold${side}`,
        }),
        this.createTextUrl({
          value: "" + data.tortoise,
          blockName: `rua${side}`,
        }),
        this.createTextUrl({
          value: "" + data.lord,
          blockName: `lord${side}`,
        }),
        this.createTextUrl({
          value: "" + data.tower,
          blockName: `tru${side}`,
        }),
        this.createTextUrl({
          value: "" + data.blueBuff,
          blockName: `bluebuff${side}`,
        }),
        this.createTextUrl({
          value: "" + data.redBuff,
          blockName: `redbuff${side}`,
        }),
      ]
    }

    // Gametime
    const gameTime = DataRepository.getInstance().gameTime
    const gameTimeUrl = this.createTextUrl({
      blockName: "gametime",
      value: gameTime ? formatSeconds(gameTime) : "00:00",
    })

    return [...createUrl(blueTeam, "xanh"), ...createUrl(redTeam, "do"), gameTimeUrl]
  }

  protected override createUrls(event: EventRegistry): string[] {
    if (event.state === "init" && event.data === "players") {
      return this.resetPlayers()
    }
    if (event.state === "end") {
      if (event.data === "players") {
        return this.createPlayersUrls()
      } else if (event.data === "teams") {
        return this.createTeamUrls()
      }
    }
    return []
  }
}
