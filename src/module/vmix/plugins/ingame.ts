import { DataRepository } from "#repository/repository.ts"
import { TeamData } from "#repository/types.ts"
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
  private existedUrls = new Set<string>()

  override eventsRegistered: EventRegistries = {
    state: ["init", "play"],
    data: ["teams"],
  }

  private resetStatUrls() {
    this.existedUrls.clear()
    const urls = Object.keys(ingameBlockPrefixes).map((key) => {
      const prefix =
        ingameBlockPrefixes[key as keyof typeof ingameBlockPrefixes]

      const blue = this.createTextUrl({
        blockName: `${prefix}xanh`,
        value: "0",
      })

      const red = this.createTextUrl({
        blockName: `${prefix}do`,
        value: "0",
      })

      const results: string[] = []
      if (!this.existedUrls.has(blue)) {
        this.existedUrls.add(blue)
        results.push(blue)
      }
      if (!this.existedUrls.has(red)) {
        this.existedUrls.add(red)
        results.push(red)
      }
      return results
    }).flatMap((x) => x)

    return urls
  }

  private createStatUrls() {
    const createTeamUrls = (team: TeamData, side: "xanh" | "do") => {
      const urls = Object.entries(team).map(([key, value]) => {
        if (["score", "gold", "tortoise", "lord", "tower"].includes(key)) {
          const prefix =
            ingameBlockPrefixes[key as keyof typeof ingameBlockPrefixes]
          const url = this.createTextUrl({
            blockName: `${prefix}${side}`,
            value: "" + value,
          })
          if (!this.existedUrls.has(url)) {
            this.existedUrls.add(url)
            return url
          }
        }
      }).filter((x) => x !== undefined).flatMap((x) => x)
      return urls
    }

    const blueUrls = createTeamUrls(DataRepository.getInstance().teams.blue, "xanh")
    const redUrls = createTeamUrls(DataRepository.getInstance().teams.red, "do")
    
    return [...blueUrls, ...redUrls]
  }

  protected override createUrls(event: EventRegistry) {
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
