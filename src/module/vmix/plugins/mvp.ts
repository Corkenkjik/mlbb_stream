import { DataRepository } from "#repository/repository.ts"
import { logger } from "@kinbay/logger"
import { EventRegistries, EventRegistry } from "../types.ts"
import { VmixPlugin } from "./base-plugin.ts"

export class MvpPlugin extends VmixPlugin {
  override eventsRegistered: EventRegistries = {
    data: ["players"],
    state: ["init", "end"],
  }

  /**
   * Only needs to resets the item slot and rune map since they are varied,
   * the other stats will be override
   */
  private resetLayout() {
    const runes = Object.entries({ "1": 0, "2": 0, "3": 0 }).map(
      ([_, rune], index) => {
        return this.createImageUrl({
          type: "rune",
          blockName: `emblem${index + 2}`,
          value: rune,
        })
      },
    )
    const items = Array(6).fill(0).map((item, index) => {
      return this.createImageUrl({
        type: "item",
        blockName: `item${index + 1}`,
        value: item,
      })
    })

    return [...runes, ...items]
  }

  private createMvpUrls() {
    const winCamp = DataRepository.getInstance().winCamp
    const winTeam = winCamp === 1
      ? DataRepository.getInstance().players.blue
      : DataRepository.getInstance().players.red

    const winSetup = winCamp === 1
      ? DataRepository.getInstance().setup.blue
      : DataRepository.getInstance().setup.red

    const mvp = winTeam.find((player) => player.mvp)
    if (!mvp) {
      logger.log("No mvp players found", "ERROR", "MvpPlugin.createMvpUrls")
      throw new Error()
    }

    const mvpIndex = winTeam.indexOf(mvp)
    const mvpName = winSetup.players[mvpIndex]

    const simpleBlock = [
      this.createTextUrl({
        blockName: `kill`,
        value: "" + mvp.kill,
      }),
      this.createTextUrl({
        blockName: `death`,
        value: "" + mvp.death,
      }),
      this.createTextUrl({
        blockName: `assist`,
        value: "" + mvp.assist,
      }),
      this.createTextUrl({
        blockName: `gold`,
        value: "" + mvp.gold,
      }),
      this.createTextUrl({
        blockName: `dmgDealt`,
        value: "" + mvp.dmgDealt,
      }),
      this.createTextUrl({
        blockName: `mvptenplayer`,
        value: mvpName,
      }),
      this.createImageUrl({
        type: "rune",
        value: mvp.rune,
        blockName: `emblem1`,
      }),
      this.createImageUrl({
        type: "spell",
        value: mvp.skillid,
        blockName: `spell`,
      }),
      this.createImageUrl({
        type: "champ-pick",
        value: mvp.pick,
        blockName: `mvptuong`,
      }),
    ]

    let runeMaps: string[] = []
    if (mvp.runeMap) {
      runeMaps = Object.entries(mvp.runeMap).map(
        ([_, rune], index) => {
          return this.createImageUrl({
            type: "rune",
            blockName: `emblem${index + 2}`,
            value: rune,
          })
        },
      )
    }
    const items = mvp.item_list.map((item, index) => {
      return this.createImageUrl({
        type: "item",
        blockName: `item${index + 1}`,
        value: item,
      })
    })

    return [...simpleBlock, ...runeMaps, ...items]
  }

  protected override createUrls(event: EventRegistry): string[] {
    if (event.state === "init") {
      return this.resetLayout()
    } else if (event.state === "end") {
      return this.createMvpUrls()
    }

    return []
  }
}
