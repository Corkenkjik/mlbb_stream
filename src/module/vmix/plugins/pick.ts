import { DataRepository } from "#repository/repository.ts"
import { EventRegistries, EventRegistry } from "../types.ts"
import { VmixPlugin } from "./base-plugin.ts"

/**
 * This plugin belongs to a small subsets of the <inputs title="banpick">
 * Migrated since ban/pick now use different login to handle
 */
export class PickPlugin extends VmixPlugin {
  private existedPicks = new Set<string>()

  override eventsRegistered: EventRegistries = {
    state: ["init", "pick"],
    data: ["players", "phaseLeftTime"],
  }

  private resetPickUrls() {
    this.existedPicks.clear()
    return Array(10).fill(0).map((_, index) => {
      const side = index + 1 < 6 ? "xanh" : "do"
      const pos = index + 1 < 6 ? index + 1 : index + 1 - 5
      const url = this.createImageUrl({
        type: "champ-pick",
        blockName: `player${side}pick${pos}`,
        value: 0,
      })
      if (!this.existedPicks.has(url)) {
        this.existedPicks.add(url)
        return url
      }
    }).filter((x) => x !== undefined)
  }

  private createPickUrls() {
    const blueUrls = DataRepository.getInstance().players.blue.map(
      (player, index) => {
        const pos = index + 1
        const blockName = `playerxanhpick${pos}`
        const url = this.createImageUrl({
          type: "champ-pick",
          blockName: blockName,
          value: player.pick,
        })

        if (!this.existedPicks.has(url)) {
          this.existedPicks.add(url)
          return url
        }
      },
    ).filter((x) => x !== undefined)

    const redUrls = DataRepository.getInstance().players.red.map(
      (player, index) => {
        const pos = index + 1
        const blockName = `playerdopick${pos}`
        const url = this.createImageUrl({
          type: "champ-pick",
          blockName: blockName,
          value: player.pick,
        })

        if (!this.existedPicks.has(url)) {
          this.existedPicks.add(url)
          return url
        }
      },
    ).filter((x) => x !== undefined)

    return [...blueUrls, ...redUrls]
  }

  private createPhaseUrl() {
    const phaseLeftTime = DataRepository.getInstance().phaseLeftTime
    if (!phaseLeftTime) {
      return [
        this.createTextUrl({
          blockName: "timebanpick",
          value: "",
        }),
      ]
    } else {
      return [
        this.createTextUrl({
          blockName: "timebanpick",
          value: "" + phaseLeftTime,
        }),
      ]
    }
  }

  protected override createUrls(event: EventRegistry) {
    let urls: string[] = []
    if (event.state === "init" && event.data === "players") {
      urls = this.resetPickUrls()
    } else if (event.state === "pick") {
      if (event.data === "players") {
        urls = this.createPickUrls()
      } else if (event.data === "phaseLeftTime") {
        urls = this.createPhaseUrl()
      }
    }
    return urls
  }

  /* public override allUrls(): string[] {
    const result = DataRepository.getInstance().teams.blue.bans.map((ban, index) => {
      // playerdoban5

      return this.createTextUrl({
        blockName: `player${index + 1}ban`,
        value: "" + ban,
      })
    })
    DataRepository.getInstance().teams.red.bans.map((ban, index) => {
      return this.createTextUrl({
        blockName: `player${index + 1}ban`,
        value: "" + ban,
      })
    })
  } */
}
