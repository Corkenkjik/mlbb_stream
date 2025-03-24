import { VMIX_SERVER } from "#lib/env.ts"
import { EventRegistries, EventRegistry } from "../types.ts"
import { VmixPlugin } from "./index.ts"

export class BossPlugin extends VmixPlugin {
  override eventsRegistered: EventRegistries = {
    state: [],
    data: [],
  }

  protected override createUrls(_event: EventRegistry): string[] {
    return []
  }

  public showSpawnBanner(type: "tortoise" | "lord") {
    console.log(`${type} has spawned`)
    return
  }

  public showKilledBanner(type: "tortoise" | "lord", killer: string) {
    console.log(`${type} has been killed by ${killer}`)
    return
  }

  public hideBanner() {
    console.log("hide banner")
    return ""
  }

  public async run(
    { event, type }: { type: "tortoise" | "lord"; event: "show" | "killed" },
    ...args: any[]
  ) {
    if (event === "show") {
      this.showSpawnBanner(type)
    } else if (event === "killed") {
      this.showKilledBanner(type, args[0])
    }
    setTimeout(() => {
      this.hideBanner()
    }, 1000)
  }
}
