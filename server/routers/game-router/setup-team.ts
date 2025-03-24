import { Router } from "@oak/oak"
import { TestPing } from "#game-source/game-source.ts"
import { DataRepository } from "#repository/repository.ts"

const setupTeamRouter = new Router({
  prefix: "/setup-team",
})

setupTeamRouter.get("/get-test-ping", async (ctx) => {
  const matchId = ctx.request.url.searchParams.get("match-id")
  if (!matchId) {
    ctx.response.status = 400
    ctx.response.body = "match-id is required"
    return
  }

  const data = await TestPing.fetch(matchId)
  DataRepository.getInstance().setup = data
  ctx.response.body = data
})

setupTeamRouter.get("/get-setup", async (ctx) => {
  ctx.response.body = DataRepository.getInstance().setup
})

setupTeamRouter.post("/change-player-position/:side", async (ctx) => {
  const side = ctx.params.side
  if (!side && !["blue", "red"].includes(side)) {
    ctx.response.body = "Side is required, and it should be blue or red"
    return
  }
  const newPlayersList = await ctx.request.body.json()
  if (!newPlayersList) {
    ctx.response.body = "Players list is required"
    return
  }
  if (!Array.isArray(newPlayersList)) {
    ctx.response.body = "Players list should be an array"
    return
  }
  if (newPlayersList.length !== 5) {
    ctx.response.body = "Players list should have 5 players"
    return
  }

  const newSetup = {
    ...DataRepository.getInstance().setup,
    [side]: {
      ...DataRepository.getInstance().setup[side as "blue" | "red"],
      players: newPlayersList,
    },
  }

  DataRepository.getInstance().setup = newSetup
  ctx.response.body = DataRepository.getInstance().setup
})

setupTeamRouter.post("/switch-team-setup", async (ctx) => {
  const tempBlue = { ...DataRepository.getInstance().setup.blue }
  const tempRed = { ...DataRepository.getInstance().setup.red }

  DataRepository.getInstance().setup = {
    blue: tempRed,
    red: tempBlue,
  }

  ctx.response.body = DataRepository.getInstance().setup
})

export default setupTeamRouter
