import { Router } from "@oak/oak/router"

import setupTeamRouter from "./setup-team.ts"
import refereeRouter from "./referee.ts"
import streamRouter from "./stream.ts"
import { GameController } from "#game-controller/controller.ts"
import { DataRepository } from "#repository/repository.ts"
import { controllerEvents } from "#game-controller/event.ts"

const gameRouter = new Router({
  prefix: "/game",
})

gameRouter.post("/create-game", async (ctx) => {
  const matchId = (await ctx.request.body.json()).matchId
  GameController.getInstance().createGame(matchId)
  ctx.response.body = "OK"
})

gameRouter.delete("/reset", async (ctx) => {
  controllerEvents.emit("reset", null)
  ctx.response.body = "OK"
})

/*
gameRouter.get("/vmix-urls/:plugin", async (ctx) => {
  const pluginName = ctx.params.plugin
  if (!pluginName) {
    ctx.response.body = "Plugin name is required"
    return
  }
  const plugin = singleton.vmix.getPlugin(pluginName as any)
  if (!plugin) {
    ctx.response.body = "Plugin not found"
    return
  }

  ctx.response.body = plugin.sendUrls()
})

gameRouter.post("/set-unstable-flag/:flag", async (ctx) => {
  const flagName = ctx.params.flag
  if (!flagName) {
    ctx.response.body = "Flag name is required"
    return
  }
  // TODO: replace this with static flag names
  if (!["players-ban"].includes(flagName)) {
    ctx.response.body = "Invalid flag name"
    return
  }
  singleton.dataRepository.setUnstableFlag(flagName)

  ctx.response.body = "OK"
})

gameRouter.delete("/remove-unstable-flag/:flag", async (ctx) => {
  const flagName = ctx.params.flag
  if (!flagName) {
    ctx.response.body = "Flag name is required"
    return
  }
  // TODO: replace this with static flag names
  if (!["players-ban"].includes(flagName)) {
    ctx.response.body = "Invalid flag name"
    return
  }
  singleton.dataRepository.removeUnstableFlag(flagName)

  ctx.response.body = "OK"
})

gameRouter.get("/get-unstable-flags", async (ctx) => {
  ctx.response.body = singleton.dataRepository.unstableFlags
})

gameRouter.post("/set-game-data/:field", async (ctx) => {
  const field = ctx.params.field
  const data = await ctx.request.body.json()

  if (!field) {
    ctx.response.body = "Field name is required"
    return
  }

  singleton.dataRepository[field as unknown as keyof DataRepository] = data
}) */

gameRouter.use(setupTeamRouter.routes())
gameRouter.use(setupTeamRouter.allowedMethods())

gameRouter.use(refereeRouter.routes())
gameRouter.use(refereeRouter.allowedMethods())

gameRouter.use(streamRouter.routes())
gameRouter.use(streamRouter.allowedMethods())

export default gameRouter
