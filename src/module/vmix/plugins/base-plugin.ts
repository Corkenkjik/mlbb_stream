import { RateLimiter } from "#rate-limiter"
import { Vmix } from "../vmix.ts"
import { VMIX_SERVER } from "#lib/env.ts"
import { API_SERVER } from "#lib/constant.ts"
import { EventRegistries, EventRegistry } from "../types.ts"

export abstract class VmixPlugin {
  protected readonly blockId: string
  protected readonly vmixController: Vmix
  abstract eventsRegistered: EventRegistries

  constructor(blockId: string, vmixController: Vmix) {
    this.blockId = blockId
    this.vmixController = vmixController
  }

  protected createTextUrl(
    data: { blockName: string; value: string; blockId?: string },
  ) {
    const blockId = data.blockId ?? this.blockId
    return `${VMIX_SERVER}/?Function=SetText&Input=${blockId}&SelectedName=${data.blockName}.Text&Value=${data.value}`
  }
  protected createImageUrl(data: {
    blockName: string
    value: number
    type:
      | "champ-ban"
      | "champ-pick"
      | "champ-waiting"
      | "champ-end"
      | "item"
      | "spell"
      | "rune"
      | "player"
    blockId?: string
  }) {
    const blockId = data.blockId ?? this.blockId
    if (data.value === 0) {
      return `${VMIX_SERVER}/?Function=SetImage&Input=${blockId}&SelectedName=${data.blockName}.Source&Value=`
    }
    return `${VMIX_SERVER}/?Function=SetImage&Input=${blockId}&SelectedName=${data.blockName}.Source&Value=${API_SERVER}/image/${data.type}/${data.value}`
  }

  protected abstract createUrls(event: EventRegistry): string[]
  // public abstract sendUrls(): string[]

  public async trigger(payload: EventRegistry) {
    const urls = this.createUrls(payload)
    await RateLimiter.execute(urls)
  }
}
