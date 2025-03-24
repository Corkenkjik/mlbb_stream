import { repositoryEvents } from "#repository/event.ts"
import { DataRepository } from "#repository/repository.ts"
import { controllerEvents } from "#game-controller/event.ts"
import { VmixPlugin } from "./plugins/base-plugin.ts"
import {
  BanPlugin,
  ClockPlugin,
  IngamePlugin,
  PickPlugin,
  PostGamePlugin,
  SetupPlugin,
  WaitingPlugin,
} from "./plugins/index.ts"
import { BlockIds } from "./types.ts"
import { RateLimiter } from "#rate-limiter"

export class Vmix {
  static instance: Vmix

  public static getInstance(): Vmix {
    if (!Vmix.instance) {
      Vmix.instance = new Vmix()
    }
    return Vmix.instance
  }

  private plugins: Map<string, VmixPlugin> = new Map()
  private blockIds = {} as BlockIds

  constructor() {
    this.subscribeEvents()
  }

  public getPlugin(key: keyof BlockIds) {
    return this.plugins.get(key)
  }

  private async fetchXml() {
    this.blockIds["banpick"] = "banpick-block-id"
    this.blockIds["waiting"] = "waiting-block-id"
    this.blockIds["ingame"] = "ingame-block-id"
    this.blockIds["postgame"] = "postgame-block-id"
    this.blockIds["clock"] = "clock-block-id"
    this.blockIds["mvp"] = "mvp-block-id"
  }

  private registerPlugin() {
    const banPlugin = new BanPlugin(this.blockIds.banpick, this)
    this.plugins.set("ban", banPlugin)

    const pickPlugin = new PickPlugin(this.blockIds.banpick, this)
    this.plugins.set("pick", pickPlugin)

    const waitingPlugin = new WaitingPlugin(this.blockIds.waiting, this)
    this.plugins.set("waiting", waitingPlugin)

    const ingamePlugin = new IngamePlugin(this.blockIds.ingame, this)
    this.plugins.set("ingame", ingamePlugin)

    const clockPlugin = new ClockPlugin(this.blockIds.clock, this)
    this.plugins.set("clock", clockPlugin)

    const mvpPlugin = new ClockPlugin(this.blockIds.mvp, this)
    this.plugins.set("mvp", mvpPlugin)

    const postgamePlugin = new PostGamePlugin(this.blockIds.postgame, this)
    this.plugins.set("postgame", postgamePlugin)

    const setupPlugin = new SetupPlugin(this, {
      banpick: this.blockIds.banpick,
      waiting: this.blockIds.waiting,
      ingame: this.blockIds.ingame,
      postgame: this.blockIds.postgame,
    })
    this.plugins.set("setup", setupPlugin)
  }

  public async init() {
    await this.fetchXml()
    this.registerPlugin()
  }

  private subscribeEvents() {
    repositoryEvents.on("data-changed", ({ field }) => {
      const state = DataRepository.getInstance().gameState
      this.plugins.values().forEach((plugin) => {
        if (
          plugin.eventsRegistered.state.includes(state) &&
          plugin.eventsRegistered.data.includes(field)
        ) {
          plugin.trigger({ data: field, state: state })
        }
      })
    })

    controllerEvents.on("start-game", () => {
      const plugin = this.plugins.get("clock") as ClockPlugin
      if (plugin) {
        const url = plugin.startClock()
        RateLimiter.execute([url])
      }
    })
    controllerEvents.on("pause-game", () => {
      const plugin = this.plugins.get("clock") as ClockPlugin
      if (plugin) {
        const url = plugin.pauseClock()
        RateLimiter.execute([url])
      }
    })
    controllerEvents.on("end-game", () => {
      const plugin = this.plugins.get("clock") as ClockPlugin
      if (plugin) {
        const url = plugin.pauseClock()
        RateLimiter.execute([url])
      }
    })
  }
}
