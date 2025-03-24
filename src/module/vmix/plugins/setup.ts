import { VmixPlugin } from "./base-plugin.ts"
import { EventRegistries, EventRegistry } from "../types.ts"
import { DataRepository } from "#repository/repository.ts"
import { Vmix } from "../vmix.ts"

/**
 * This plugin does not belong to a specific <inputs> (does not inherit a blockIds)
 * Rather, this is the plugin that contains all the blocks that needs only to be triggered once.
 * This include the player names and the team names
 */

type BlockIds = {
  "banpick": string
  "waiting": string
  "ingame": string
  "postgame": string
}

export class SetupPlugin extends VmixPlugin {
  private blockIds = {} as BlockIds
  constructor(vmixController: Vmix, blockIds: BlockIds) {
    super("", vmixController)
    this.blockIds = blockIds
  }

  override eventsRegistered: EventRegistries = {
    state: ["init"],
    data: ["setup"],
  }

  private createPlayerNamesUrls() {
    const blueNames = DataRepository.getInstance().setup.blue.players.map(
      (player, index) => {
        const pos = index + 1
        const banpickBlockName = this.createTextUrl({
          blockId: this.blockIds["banpick"],
          blockName: `playerxanhname${index + 1}`,
          value: player,
        })
        const waitingBlockName = this.createTextUrl({
          blockId: this.blockIds["waiting"],
          blockName: `playerxanhname${index + 1}`,
          value: player,
        })
        const postgameBlockName = this.createTextUrl({
          blockId: this.blockIds["postgame"],
          blockName: `p${pos}xanhname`,
          value: player,
        })

        return [banpickBlockName, waitingBlockName, postgameBlockName]
      },
    ).flatMap((x) => x)

    const redNames = DataRepository.getInstance().setup.red.players.map(
      (player, index) => {
        const pos = index + 1
        const banpickBlockName = this.createTextUrl({
          blockId: this.blockIds["banpick"],
          blockName: `playerdoname${index + 1}`,
          value: player,
        })
        const waitingBlockName = this.createTextUrl({
          blockId: this.blockIds["waiting"],
          blockName: `playerdoname${index + 1}`,
          value: player,
        })
        const postgameBlockName = this.createTextUrl({
          blockId: this.blockIds["postgame"],
          blockName: `p${pos}doname`,
          value: player,
        })

        return [banpickBlockName, waitingBlockName, postgameBlockName]
      },
    ).flatMap((x) => x)

    return [...blueNames, ...redNames]
  }

  private createTeamNamesUrls() {
    const blueNames = [
      /* // banpick plugin name
      this.createTextUrl({
        blockName: "teamnameblue",
        value: DataRepository.getInstance().setup.blue.name,
      }), */
      // waiting plugin name
      this.createTextUrl({
        blockId: this.blockIds["waiting"],
        blockName: `pxtendoi`,
        value: DataRepository.getInstance().setup.blue.name,
      }),
      // ingame plugin name
      this.createTextUrl({
        blockId: this.blockIds["ingame"],
        blockName: "tendoixanh",
        value: DataRepository.getInstance().setup.blue.name,
      }),
      // postgame plugin name
      this.createTextUrl({
        blockId: this.blockIds["postgame"],
        blockName: "pxtendoi",
        value: DataRepository.getInstance().setup.blue.name,
      }),
    ]

    const redNames = [
      /* // banpick plugin name
      this.createTextUrl({
        blockName: "teamnameblue",
        value: DataRepository.getInstance().setup.blue.name,
      }), */
      // waiting plugin name
      this.createTextUrl({
        blockId: this.blockIds["waiting"],
        blockName: `pdtendoi`,
        value: DataRepository.getInstance().setup.red.name,
      }),
      // ingame plugin name
      this.createTextUrl({
        blockId: this.blockIds["ingame"],
        blockName: "tendoido",
        value: DataRepository.getInstance().setup.red.name,
      }),
      // postgame plugin name
      this.createTextUrl({
        blockId: this.blockIds["postgame"],
        blockName: "pdtendoi",
        value: DataRepository.getInstance().setup.red.name,
      }),
    ]

    return [...blueNames, ...redNames]
  }

  protected override createUrls(_event: EventRegistry) {
    const urls = [
      ...this.createPlayerNamesUrls(),
      ...this.createTeamNamesUrls(),
    ]
    return urls
  }
}
