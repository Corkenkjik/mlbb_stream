import { VmixPlugin } from "./base-plugin.ts"
import { DataRepository } from "#repository/repository.ts"
import { EventRegistries, EventRegistry } from "../types.ts"

/**
 * This plugin belongs to a small subsets of the <inputs title="banpick">
 * Migrated since ban/pick now use different login to handle
 */
export class BanPlugin extends VmixPlugin {
  private existedBans = new Set<string>()

  override eventsRegistered: EventRegistries = {
    state: ["init", "ban"],
    data: ["teams", "phaseLeftTime"],
  }

  private resetBanUrls() {
    this.existedBans.clear()
    return Array(10).fill(0).map((_, index) => {
      const side = index + 1 < 6 ? "xanh" : "do"
      const pos = index + 1 < 6 ? index + 1 : index + 1 - 5
      return this.createImageUrl({
        type: "champ-ban",
        blockName: `player${side}ban${pos}`,
        value: 0,
      })
    })
  }

  private createBanUrls() {
    const blueBans = DataRepository.getInstance().teams.blue.bans.map(
      (ban, index) => {
        // playerxanhban1
        const url = this.createImageUrl({
          type: "champ-ban",
          blockName: `playerxanhban${index + 1}`,
          value: ban,
        })
        const isExsisted = this.existedBans.has(url)
        if (!isExsisted) {
          this.existedBans.add(url)
          return url
        }
      },
    ).filter((x) => x !== undefined)

    const redBans = DataRepository.getInstance().teams.red.bans.map(
      (ban, index) => {
        // playerdoban1
        const url = this.createImageUrl({
          type: "champ-ban",
          blockName: `playerdoban${index + 1}`,
          value: ban,
        })
        const isExsisted = this.existedBans.has(url)
        if (!isExsisted) {
          this.existedBans.add(url)
          return url
        }
      },
    ).filter((x) => x !== undefined)
    return [...blueBans, ...redBans]
  }

  private createPhaseUrl() {
    const phaseLeftTime = DataRepository.getInstance().phaseLeftTime
    if (!phaseLeftTime) {
      return [
        this.createTextUrl({
          blockName: "timebanpick",
          value: "0",
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
    if (event.state === "init" && event.data === "teams") {
      urls = this.resetBanUrls()
    } else if (event.state === "ban") {
      if (event.data === "teams") {
        urls = this.createBanUrls()
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
