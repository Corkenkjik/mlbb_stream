import { DataRepository } from "#repository/repository.ts"
import { EventRegistries, EventRegistry } from "../types.ts"
import { VmixPlugin } from "./base-plugin.ts"

const ingameBlockPrefixes = {
  score: "tiso",
  gold: "vang",
  tortoise: "rua",
  lord: "lord",
  tower: "tru",
} as const

export class IngamePlugin extends VmixPlugin {
  private existedPicks = new Set<string>()

  override eventsRegistered: EventRegistries = {
    state: ["init", "play"],
    data: ["teams"],
  }

  private resetStatUrls() {
    this.existedPicks.clear()
    const urls = Object.keys(ingameBlockPrefixes).map((key) => {
      const prefix =
        ingameBlockPrefixes[key as keyof typeof ingameBlockPrefixes]

      return [
        this.createTextUrl({
          blockName: `${prefix}xanh`,
          value: "0",
        }),
        this.createTextUrl({
          blockName: `${prefix}do`,
          value: "0",
        }),
      ]
    }).flatMap((x) => x)

    return urls
  }

  private createStatUrls() {
    const blueUrls = Object.entries(DataRepository.getInstance().teams.blue)
      .map(([key, value]) => {
        if (["score", "gold", "tortoise", "lord", "tower"].includes(key)) {
          const prefix =
            ingameBlockPrefixes[key as keyof typeof ingameBlockPrefixes]
          const url = this.createTextUrl({
            blockName: `${prefix}xanh`,
            value: "" + value,
          })
          if (!this.existedPicks.has(url)) {
            this.existedPicks.add(url)
            return url
          }
        }
      }).filter((x) => x !== undefined).flatMap((x) => x)
    const redUrls = Object.entries(DataRepository.getInstance().teams.blue)
      .map(([key, value]) => {
        if (["score", "gold", "tortoise", "lord", "tower"].includes(key)) {
          const prefix =
            ingameBlockPrefixes[key as keyof typeof ingameBlockPrefixes]
          const url = this.createTextUrl({
            blockName: `${prefix}xanh`,
            value: "" + value,
          })
          if (!this.existedPicks.has(url)) {
            this.existedPicks.add(url)
            return url
          }
        }
      }).filter((x) => x !== undefined).flatMap((x) => x)

    return [...blueUrls, ...redUrls]
  }

  protected override createUrls(event: EventRegistry) {
    console.log('event from ingame', event)
    console.log(this.blockId)

    let urls: string[] = []
    if (event.state === "init") {
      urls = this.resetStatUrls()
    } else if (event.state === "play") {
      urls = this.createStatUrls()
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
