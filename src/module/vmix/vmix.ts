import { XMLParser } from "@fast-xml-parser"
import { repositoryEvents } from "#repository/event.ts"
import { DataRepository } from "#repository/repository.ts"
import { controllerEvents } from "#game-controller/event.ts"
import { VmixPlugin } from "./plugins/base-plugin.ts"
import {
  BanPlugin,
  ClockPlugin,
  IngamePlugin,
  MvpPlugin,
  PickPlugin,
  PostGamePlugin,
  SetupPlugin,
  WaitingPlugin,
} from "./plugins/index.ts"
import { BlockIds, Inputs } from "./types.ts"
import { RateLimiter } from "#rate-limiter"
import { VMIX_SERVER } from "#lib/env.ts"
import { logger } from "@kinbay/logger"
import { BossPlugin } from "./plugins/boss.ts"

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
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)
    try {
      const xmlSrc = await fetch(VMIX_SERVER, {
        method: "GET",
        headers: {
          "Accept": "application/xml",
        },
        signal: controller.signal,
      })
      clearTimeout(timeout)
      const xmlString = await xmlSrc.text()
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
      })
      const parsedXML = parser.parse(xmlString)
      const inputs = parsedXML.vmix.inputs as Inputs
      inputs.input.forEach((element) => {
        if (element.title === "banpick") {
          this.blockIds["banpick"] = element.key
        } else if (element.title === "waiting") {
          this.blockIds["waiting"] = element.key
        } else if (element.title === "ingame") {
          this.blockIds["ingame"] = element.key
        } else if (element.title === "postdata") {
          this.blockIds["postgame"] = element.key
        } else if (element.title === "realtime") {
          this.blockIds["clock"] = element.key
        } else if (element.title === "mvp") {
          this.blockIds["mvp"] = element.key
        }
      })
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        logger.log(
          "Cannot connect to VMIX_SERVER, connection timeout",
          "ERROR",
          "VmixController.fetchXml",
        )
      }
      throw new Error()
    }
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

    const mvpPlugin = new MvpPlugin(this.blockIds.mvp, this)
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

    const bossPlugin = new BossPlugin("", this)
    this.plugins.set("boss", bossPlugin)
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
          (plugin.eventsRegistered.data.includes(field))
        ) {
          plugin.trigger({ data: field, state: state })
        }
      })
    })

    controllerEvents.on("start-game", async () => {
      const plugin = this.plugins.get("clock") as ClockPlugin
      if (plugin) {
        const url = plugin.startClock()
        await RateLimiter.execute([url])
      }
    })

    controllerEvents.on("reset", async () => {
      const plugin = this.plugins.get("clock") as ClockPlugin
      if (plugin) {
        const url = plugin.resetClock()
        await RateLimiter.execute([url])
      }
    })

    controllerEvents.on("pause-game", async () => {
      const plugin = this.plugins.get("clock") as ClockPlugin
      if (plugin) {
        const url = plugin.pauseClock()
        await RateLimiter.execute([url])
      }
    })
    controllerEvents.on("end-game", async () => {
      const plugin = this.plugins.get("clock") as ClockPlugin
      if (plugin) {
        const url = plugin.pauseClock()
        await RateLimiter.execute([url])
      }
    })
    controllerEvents.on("adjust-game", async () => {
      const plugin = this.plugins.get("waiting") as WaitingPlugin
      if (plugin) {
        await plugin.run()
      }
    })

    controllerEvents.on("tortoise-spawn", async () => {
      const plugin = this.plugins.get("boss") as BossPlugin
      if (plugin) {
        await plugin.run({ event: "show", type: "tortoise" })
      }
    })
    controllerEvents.on("tortoise-kill", async ({ killer }) => {
      const plugin = this.plugins.get("boss") as BossPlugin
      if (plugin) {
        await plugin.run({ event: "killed", type: "tortoise" }, killer)
      }
    })
    controllerEvents.on("lord-spawn", async () => {
      const plugin = this.plugins.get("boss") as BossPlugin
      if (plugin) {
        await plugin.run({ event: "show", type: "lord" })
      }
    })
    controllerEvents.on("lord-kill", async ({ killer }) => {
      const plugin = this.plugins.get("boss") as BossPlugin
      if (plugin) {
        await plugin.run({ event: "killed", type: "lord" }, killer)
      }
    })
  }
}
