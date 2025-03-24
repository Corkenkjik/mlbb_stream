import { DataRepository } from "#repository/repository.ts"
import { RateLimiter } from "#rate-limiter"
import { EventRegistries, EventRegistry } from "../types.ts"
import { VmixPlugin } from "./base-plugin.ts"

export class WaitingPlugin extends VmixPlugin {
  private existedPicks = new Set<string>()

  override eventsRegistered: EventRegistries = {
    state: ["init"],
    data: ["players"],
  }

  private resetScreenUrls() {
    this.existedPicks.clear()
    return Array(10).fill(0).map((_, index) => {
      const side = index + 1 < 6 ? "x" : "d"
      const pos = index + 1 < 6 ? index + 1 : index + 1 - 5
      return this.createImageUrl({
        type: "champ-waiting",
        blockName: `p${pos}${side}hero`,
        value: 0,
      })
    })
  }

  private createScreenUrls() {
    const blueUrls = DataRepository.getInstance().players.blue.map(
      (player, index) => {
        const pos = index + 1
        const blockName = `p${pos}xhero`
        const url = this.createImageUrl({
          type: "champ-waiting",
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
        const blockName = `p${pos}dhero`
        const url = this.createImageUrl({
          type: "champ-waiting",
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

  protected override createUrls(event: EventRegistry) {
    let urls: string[] = []
    if (event.state === "init") {
      urls = this.resetScreenUrls()
    } else if (event.state === "adjust") {
      urls = this.createScreenUrls()
    }
    return urls
  }

  public async run() {
    const urls = this.createScreenUrls()
    await RateLimiter.execute(urls)
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
